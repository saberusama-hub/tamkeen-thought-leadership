/**
 * app/api/editorial/publish/route.ts
 *
 * The write-back for the live editor. One route, two backends:
 *
 *   development  -> splice the local working tree (the fast local loop)
 *   production   -> commit to GitHub, which redeploys the site
 *
 * Both share identical validation and the same precondition check, so the path
 * exercised locally is the path that runs live apart from where bytes land.
 *
 * The manifest is imported rather than read from disk: `resolveJsonModule` is
 * on, so it is bundled into the function and there is no filesystem dependency
 * at runtime on Vercel.
 */

import { NextResponse } from 'next/server';
import manifestJson from '@/editorial/manifest.json';
import {
  MAX_EDITS_PER_PUBLISH,
  applyEdits,
  filesTouched,
  planEdits,
  spliceFile,
  type ManifestBlock,
} from '@/lib/editorial/splice';
import { commitFiles, getRepoConfig, readFiles } from '@/lib/editorial/github';
import { COOKIE_NAME, getConfig, verify } from '@/lib/editorial/session';

export const dynamic = 'force-dynamic';

const BLOCKS = (manifestJson as { blocks: ManifestBlock[] }).blocks;

function signedIn(request: Request): boolean {
  const cfg = getConfig();
  if (!cfg) return false;
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  return verify(cookie, cfg.secret);
}

export async function POST(request: Request) {
  const isProd = process.env.NODE_ENV === 'production';

  // In production a session is mandatory. In development the route is a local
  // convenience and the working tree is the developer's own.
  if (isProd && !signedIn(request)) {
    return NextResponse.json(
      { error: 'Not signed in. Open /edit and sign in again.' },
      { status: 401 },
    );
  }

  let body: { edits?: unknown; dry?: unknown };
  try {
    body = (await request.json()) as { edits?: unknown; dry?: unknown };
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const raw = body.edits;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Expected { edits: { [blockId]: string } }.' }, { status: 400 });
  }
  const edits = raw as Record<string, string>;
  const ids = Object.keys(edits);
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Nothing to publish.' }, { status: 400 });
  }
  if (ids.length > MAX_EDITS_PER_PUBLISH) {
    return NextResponse.json(
      { error: `Too many changes in one publish (limit ${MAX_EDITS_PER_PUBLISH}).` },
      { status: 400 },
    );
  }
  const dry = body.dry === true;

  // ── Development: write the working tree ───────────────────────────────────
  if (!isProd) {
    const result = applyEdits(edits, { write: !dry });
    if (result.stale.length) {
      return NextResponse.json(
        {
          error:
            'The article changed since this page was opened. Refresh and make the change again.',
          stale: result.stale,
        },
        { status: 409 },
      );
    }
    return NextResponse.json({
      mode: 'local',
      dry,
      applied: result.applied.length,
      files: result.filesWritten.map((f) => f.file),
      splices: result.filesWritten.reduce((n, f) => n + f.splices, 0),
      unchanged: result.unchanged.length,
      unknown: result.unknown,
      rejected: result.rejected.map((r) => `${r.id}: ${r.reason}`),
      warnings: result.applied.filter((a) => a.warn).map((a) => `${a.id}: ${a.warn}`),
    });
  }

  // ── Production: commit to GitHub ──────────────────────────────────────────
  const repo = getRepoConfig();
  if (!repo) {
    return NextResponse.json(
      { error: 'Publishing is not configured on this deployment. GITHUB_TOKEN must be set.' },
      { status: 503 },
    );
  }

  try {
    const files = filesTouched(edits, BLOCKS);
    if (files.length === 0) {
      return NextResponse.json({ error: 'No known blocks in this request.' }, { status: 400 });
    }

    // Always work from the branch's current content, never from anything the
    // client sent, and never from the deployment's own bundled copy.
    const sources = await readFiles(repo, files);
    const plan = planEdits(edits, BLOCKS, sources);

    if (plan.stale.length) {
      return NextResponse.json(
        {
          error:
            'The article changed since this page was opened. Refresh the page and make the change again.',
          stale: plan.stale,
        },
        { status: 409 },
      );
    }
    if (plan.applied.length === 0) {
      return NextResponse.json({
        mode: 'github',
        applied: 0,
        unchanged: plan.unchanged.length,
        rejected: plan.rejected.map((r) => `${r.id}: ${r.reason}`),
        message: 'Nothing changed.',
      });
    }

    const changed = [...plan.splices.entries()].map(([file, splices]) => ({
      path: file,
      content: spliceFile(sources.get(file)!, splices),
    }));

    const n = plan.applied.length;
    const message =
      `content: ${n} text edit${n === 1 ? '' : 's'} from the web editor\n\n` +
      plan.applied
        .map((a) => `- ${a.id}${a.locations > 1 ? ` (shared, ${a.locations} places)` : ''}`)
        .join('\n');

    const res = await commitFiles(repo, changed, message, { dry });

    return NextResponse.json({
      mode: 'github',
      dry,
      applied: n,
      commit: res.commit,
      parent: res.parent,
      files: changed.map((c) => c.path),
      splices: [...plan.splices.values()].reduce((t, s) => t + s.length, 0),
      unchanged: plan.unchanged.length,
      unknown: plan.unknown,
      rejected: plan.rejected.map((r) => `${r.id}: ${r.reason}`),
      warnings: plan.applied.filter((a) => a.warn).map((a) => `${a.id}: ${a.warn}`),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not publish: ${(err as Error).message}` },
      { status: 502 },
    );
  }
}
