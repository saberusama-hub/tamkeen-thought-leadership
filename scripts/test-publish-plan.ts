/**
 * scripts/test-publish-plan.ts
 *
 * Proves the exact bytes a publish would commit, without touching GitHub.
 *
 * `planEdits` is the whole substance of the production write path: everything
 * after it is thin GitHub plumbing. So this checks the part that can actually
 * corrupt an article — that the right bytes change, that nothing else moves,
 * that a shared block reaches both files, and that a source which has shifted
 * is refused rather than written at the wrong offset.
 *
 * Run: pnpm test:publish-plan
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  filesTouched,
  loadManifestFromDisk,
  planEdits,
  spliceFile,
  type ManifestBlock,
} from '../lib/editorial/splice';

const ROOT = process.cwd();
let fail = 0;
const ok = (label: string, cond: boolean, extra = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  — ' + extra : ''}`);
  if (!cond) fail++;
};

const blocks = loadManifestFromDisk().blocks;
const byId = new Map(blocks.map((b) => [b.id, b]));
const read = (files: string[]) =>
  new Map(files.map((f) => [f, readFileSync(path.join(ROOT, f), 'utf-8')]));

console.log('================ PUBLISH PLAN ================');

// ── 1. A shared block reaches both files, and only where intended ───────────
console.log('\n── shared block, two files, one commit ──');
{
  const shared = blocks.find((b) => b.shared && b.locations.length === 2)!;
  const NEW = 'A rewritten line used only by this test.';
  const sources = read(filesTouched({ [shared.id]: NEW }, blocks));
  const plan = planEdits({ [shared.id]: NEW }, blocks, sources);

  ok('the edit is accepted', plan.applied.length === 1, shared.id);
  ok('no stale ranges', plan.stale.length === 0);
  ok('it touches exactly two files', plan.splices.size === 2);

  let totalDelta = 0;
  for (const [file, splices] of plan.splices) {
    const before = sources.get(file)!;
    const after = spliceFile(before, splices);
    ok(`${path.basename(file)}: new text present`, after.includes(NEW));
    ok(`${path.basename(file)}: old text gone`, !after.includes(shared.text.trim()));

    // Everything outside the spliced range must be byte-identical.
    const loc = shared.locations.find((l) => l.file === file)!;
    ok(
      `${path.basename(file)}: bytes before the edit unchanged`,
      after.slice(0, loc.start) === before.slice(0, loc.start),
    );
    const deltaLen = after.length - before.length;
    ok(
      `${path.basename(file)}: bytes after the edit unchanged`,
      after.slice(loc.end + deltaLen) === before.slice(loc.end),
    );
    totalDelta += Math.abs(deltaLen);
  }
  ok('the change is small and local', totalDelta < 400, `${totalDelta} bytes across both`);
}

// ── 2. Escaping for the delimiter the block lives in ────────────────────────
console.log('\n── quoting ──');
{
  const single = blocks.find((b) => b.quote === "'")!;
  const NEW = "Asia's decade, in the editor's words.";
  const sources = read(filesTouched({ [single.id]: NEW }, blocks));
  const plan = planEdits({ [single.id]: NEW }, blocks, sources);
  const file = [...plan.splices.keys()][0];
  const after = spliceFile(sources.get(file)!, plan.splices.get(file)!);
  ok('apostrophes are escaped inside a single-quoted literal', after.includes("Asia\\'s decade"));
  ok('and the raw form is not written', !after.includes("'Asia's decade"));
}

// ── 3. Refusals ─────────────────────────────────────────────────────────────
console.log('\n── refusals ──');
{
  const b = blocks.find((x) => x.kind === 'prose')!;
  const sources = read(filesTouched({ [b.id]: 'x' }, blocks));
  const cases: [string, string, RegExp][] = [
    ['empty text', '   ', /empty/],
    ['a line break', 'one\ntwo', /line break/],
    ['foreign markup', 'a <script>alert(1)</script> b', /markup/],
    ['over-long text', 'x'.repeat(7000), /longer than/],
  ];
  for (const [label, value, reason] of cases) {
    const plan = planEdits({ [b.id]: value }, blocks, sources);
    const r = plan.rejected[0];
    ok(`refuses ${label}`, plan.applied.length === 0 && !!r && reason.test(r.reason), r?.reason);
  }
  const unknown = planEdits({ 'Z-999': 'hello' }, blocks, sources);
  ok('refuses an unknown block id', unknown.unknown.length === 1 && unknown.applied.length === 0);

  // <strong> is legitimate for a block whose source already carries it.
  const withMarkup = blocks.find((x) => /<strong>/.test(x.display))!;
  const s2 = read(filesTouched({ [withMarkup.id]: 'x' }, blocks));
  const okMarkup = planEdits({ [withMarkup.id]: '<strong>Kept.</strong> And the rest.' }, blocks, s2);
  ok('allows <strong> where the source already had it', okMarkup.applied.length === 1);
}

// ── 4. The stale guard ──────────────────────────────────────────────────────
console.log('\n── stale source ──');
{
  const b = byId.get(blocks.find((x) => x.kind === 'prose')!.id)!;
  const files = filesTouched({ [b.id]: 'new text' }, blocks);
  const sources = read(files);
  // Simulate someone pushing before this publish landed: insert bytes ahead of
  // the block so every offset after it shifts.
  const file = files[0];
  const shifted = new Map(sources);
  shifted.set(file, '\n\n' + sources.get(file)!);

  const plan = planEdits({ [b.id]: 'new text' }, blocks, shifted);
  ok('a shifted source is detected', plan.stale.length === 1, plan.stale[0]?.id);
  ok('and nothing is planned for writing', plan.applied.length === 0 && plan.splices.size === 0);
}

// ── 5. Every block in the manifest is currently writable ────────────────────
console.log('\n── whole-manifest precondition ──');
{
  // Blocks carrying markup beyond <strong>/<em> are deliberately not offered
  // to the browser editor, so exclude them the same way the client does.
  const offered = blocks.filter((b) => !/<(?!\/?(?:strong|em)\b)[^>]*>/.test(b.display));
  const all: Record<string, string> = {};
  for (const b of offered) all[b.id] = b.display + ' (probe)';
  const sources = read(filesTouched(all, blocks));
  const plan = planEdits(all, blocks, sources);
  ok(
    'no block in the manifest is stale against the working tree',
    plan.stale.length === 0,
    `${plan.applied.length} of ${offered.length} plannable`,
  );
  ok('every offered block is writable', plan.rejected.length === 0, `${plan.rejected.length} rejected`);
  ok(
    'the non-offered blocks are exactly the markup-bearing ones',
    blocks.length - offered.length === 2,
    `${blocks.length - offered.length} withheld`,
  );
}

console.log();
if (fail > 0) {
  console.error(`================ ${fail} FAILURE(S) ================`);
  process.exit(1);
}
console.log('================ PUBLISH PLAN VERIFIED ================');
