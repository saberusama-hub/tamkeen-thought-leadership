/**
 * app/api/editorial/health/route.ts
 *
 * Read-only diagnostic: is the editor actually wired up on this deployment?
 *
 * Exists because proving the publish path works otherwise requires an
 * authenticated POST, which means someone has to sign in and publish a real
 * change to discover a misconfigured token. This answers the same question
 * with a GET and without writing anything.
 *
 * Deliberately public and deliberately thin. It returns statuses only — no
 * secrets, no commit shas, no file contents, no error detail from GitHub. It
 * reveals that an editor exists, which /edit already does.
 */

import { NextResponse } from 'next/server';
import manifestJson from '@/editorial/manifest.json';
import { filesTouched, type ManifestBlock } from '@/lib/editorial/splice';
import { getRepoConfig, readFiles } from '@/lib/editorial/github';
import { getConfig } from '@/lib/editorial/session';

export const dynamic = 'force-dynamic';

const BLOCKS = (manifestJson as { blocks: ManifestBlock[] }).blocks;

/** Cached briefly so this cannot be used to burn the GitHub rate limit. */
let cache: { at: number; body: unknown } | null = null;
const TTL_MS = 60_000;

async function hasWriteAccess(): Promise<boolean | null> {
  const cfg = getRepoConfig();
  if (!cfg) return null;
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
    headers: {
      authorization: `Bearer ${cfg.token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'the-index-editor',
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { permissions?: { push?: boolean } };
  return data.permissions?.push === true;
}

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.body);
  }

  const editor = getConfig() ? 'configured' : 'not-configured';
  const repo = getRepoConfig();

  let publishing: string;
  let content: string = 'unknown';
  let checkedBlocks = 0;

  if (!repo) {
    publishing = 'not-configured';
  } else {
    try {
      // All blocks, so the answer covers every article the editor can touch.
      const all: Record<string, string> = {};
      for (const b of BLOCKS) all[b.id] = '';
      const files = filesTouched(all, BLOCKS);
      const sources = await readFiles(repo, files);

      // Do the deployed byte ranges still match what is on the branch? If not,
      // every publish would be refused as stale, which is the failure mode
      // worth knowing about before someone sits down to edit.
      let stale = 0;
      for (const b of BLOCKS) {
        for (const loc of b.locations) {
          const src = sources.get(loc.file);
          if (src === undefined || src.slice(loc.start, loc.end) !== b.text) stale++;
          else checkedBlocks++;
        }
      }
      content = stale === 0 ? 'in-sync' : 'out-of-sync';

      const write = await hasWriteAccess();
      publishing = write === true ? 'ready' : write === false ? 'no-write-access' : 'unverified';
    } catch {
      publishing = 'unreachable';
      content = 'unknown';
    }
  }

  const body = {
    editor,
    publishing,
    content,
    blockRangesChecked: checkedBlocks,
    blocksInManifest: BLOCKS.length,
  };
  cache = { at: Date.now(), body };
  return NextResponse.json(body);
}
