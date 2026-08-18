/**
 * scripts/apply-json-edits.ts
 *
 * Applies the patch file the in-browser edit layer downloads when it cannot
 * write to the working tree directly (i.e. from the deployed site).
 *
 * The patch is a flat map of block id -> new text. Each block is spliced into
 * its exact byte range in the MDX source, so nothing is matched fuzzily and
 * JSX structure cannot be disturbed. Blocks shared between the two articles
 * are written to every location, so one edit keeps both pieces in step.
 *
 * Dry run by default.
 *
 *   pnpm apply-json-edits                       # report only
 *   pnpm apply-json-edits -- --write            # apply
 *   pnpm apply-json-edits -- --file p.json      # a patch somewhere else
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { applyEdits } from '../lib/editorial/splice';

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');

function resolvePatch(): string | null {
  const explicit = argv.indexOf('--file');
  if (explicit >= 0 && argv[explicit + 1]) {
    const p = path.resolve(ROOT, argv[explicit + 1]);
    return existsSync(p) ? p : null;
  }
  // Otherwise take the newest edits-*.json sitting in editorial/.
  const dir = path.join(ROOT, 'editorial');
  if (!existsSync(dir)) return null;
  const candidates = readdirSync(dir)
    .filter((f) => /^edits.*\.json$/.test(f))
    .map((f) => path.join(dir, f));
  return candidates.length ? candidates.sort().at(-1)! : null;
}

const patchPath = resolvePatch();
if (!patchPath) {
  console.error('No patch found. Put the downloaded edits-<slug>.json in editorial/,');
  console.error('or pass one with:  pnpm apply-json-edits -- --file <path>');
  process.exit(1);
}

let edits: Record<string, string>;
try {
  edits = JSON.parse(readFileSync(patchPath, 'utf-8')) as Record<string, string>;
} catch (err) {
  console.error(`Could not parse ${patchPath}: ${(err as Error).message}`);
  process.exit(1);
}

const clip = (s: string, n = 96) => {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n) + '…' : one;
};

const result = applyEdits(edits, { write: WRITE });

console.log('================ APPLY JSON EDITS ================');
console.log(`  patch  : ${path.relative(ROOT, patchPath)}`);
console.log(`  mode   : ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to apply)'}`);
console.log(`  entries: ${Object.keys(edits).length}`);
console.log();

if (result.applied.length) {
  console.log(`---------------- ${result.applied.length} CHANGE(S) ----------------`);
  for (const a of result.applied) {
    console.log(`  ${a.id}${a.locations > 1 ? `  SHARED ×${a.locations}` : ''}`);
    console.log(`    -  ${clip(a.before)}`);
    console.log(`    +  ${clip(a.after)}`);
    if (a.warn) console.log(`    !  ${a.warn}`);
  }
  console.log();
}

if (result.unchanged.length) console.log(`  ${result.unchanged.length} block(s) unchanged, skipped.`);
if (result.unknown.length) console.log(`  UNKNOWN ids (not in the manifest): ${result.unknown.join(', ')}`);
if (result.rejected.length) {
  console.log(`\n  ${result.rejected.length} REJECTED:`);
  for (const r of result.rejected) console.log(`    ${r.id}: ${r.reason}`);
}

if (!WRITE) {
  console.log('\n  Dry run only. Re-run with --write to apply.');
  process.exit(0);
}

if (!result.filesWritten.length) {
  console.log('\n  Nothing written.');
  process.exit(0);
}

console.log('\n---------------- WRITTEN ----------------');
for (const f of result.filesWritten) console.log(`  ${f.file}: ${f.splices} splice(s)`);
console.log('\n  Now re-run the gates:');
console.log('    pnpm typecheck && pnpm build && pnpm claims-audit');
console.log('  Then re-extract so the manifest matches the new source:');
console.log('    pnpm review-doc');
