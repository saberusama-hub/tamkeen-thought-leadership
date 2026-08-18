/**
 * app/api/editorial/apply/route.ts
 *
 * Development-only write-back for the in-browser edit layer. Accepts a map of
 * block id -> new text and splices each one into its exact byte range in the
 * MDX source.
 *
 * Refused outside development. The deployed site is static and its filesystem
 * is read-only, so there is nothing to write to there; the edit layer falls
 * back to downloading a patch file, which `pnpm apply-json-edits` applies.
 */

import { NextResponse } from 'next/server';
import { applyEdits } from '@/lib/editorial/splice';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Editing writes to the working tree and is available in development only.' },
      { status: 403 },
    );
  }

  let body: { edits?: Record<string, string> };
  try {
    body = (await request.json()) as { edits?: Record<string, string> };
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 });
  }

  const edits = body.edits;
  if (!edits || typeof edits !== 'object' || Array.isArray(edits)) {
    return NextResponse.json({ error: 'Expected { edits: { [blockId]: string } }.' }, { status: 400 });
  }
  for (const [k, v] of Object.entries(edits)) {
    if (typeof v !== 'string') {
      return NextResponse.json({ error: `Edit for ${k} is not a string.` }, { status: 400 });
    }
  }

  const result = applyEdits(edits, { write: true });

  return NextResponse.json({
    applied: result.applied.length,
    files: result.filesWritten.length,
    unchanged: result.unchanged.length,
    unknown: result.unknown,
    rejected: result.rejected.map((r) => `${r.id}: ${r.reason}`),
    warnings: result.applied.filter((a) => a.warn).map((a) => `${a.id}: ${a.warn}`),
  });
}
