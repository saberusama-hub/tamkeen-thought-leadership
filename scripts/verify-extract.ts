/**
 * scripts/verify-extract.ts
 *
 * Proves the extraction manifest is safe to apply edits through:
 *
 *   1. No two blocks claim overlapping byte ranges in the same file.
 *   2. Every block's recorded text is byte-identical to what actually sits at
 *      its recorded range (the manifest is not stale).
 *   3. Splicing every block back over itself reproduces each source file
 *      byte-for-byte (the round-trip is lossless).
 *   4. Shared blocks really are identical at every location.
 *
 * Exits non-zero on any failure. Run after every extract.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const manifest = JSON.parse(
  readFileSync(path.join(ROOT, 'editorial', 'manifest.json'), 'utf-8'),
) as {
  blocks: {
    id: string;
    text: string;
    shared: boolean;
    path: string;
    locations: { file: string; start: number; end: number; line: number }[];
  }[];
};

let fail = 0;
const files = new Set<string>();
for (const b of manifest.blocks) for (const l of b.locations) files.add(l.file);

const srcs = new Map<string, string>();
for (const f of files) srcs.set(f, readFileSync(path.join(ROOT, f), 'utf-8'));

console.log('================ EXTRACT VERIFICATION ================');

// ── 1 + 2: range fidelity and overlap ───────────────────────────────────────
const byFile = new Map<string, { id: string; start: number; end: number; text: string }[]>();
for (const b of manifest.blocks) {
  for (const l of b.locations) {
    if (!byFile.has(l.file)) byFile.set(l.file, []);
    byFile.get(l.file)!.push({ id: b.id, start: l.start, end: l.end, text: b.text });
  }
}

for (const [file, entries] of byFile) {
  const src = srcs.get(file)!;
  entries.sort((a, b) => a.start - b.start);

  // fidelity
  let mismatched = 0;
  for (const e of entries) {
    const actual = src.slice(e.start, e.end);
    if (actual !== e.text) {
      mismatched++;
      if (mismatched <= 3) {
        console.log(`  FAIL  ${e.id} text does not match bytes ${e.start}..${e.end} in ${file}`);
        console.log(`        manifest: ${JSON.stringify(e.text.slice(0, 70))}`);
        console.log(`        source  : ${JSON.stringify(actual.slice(0, 70))}`);
      }
    }
  }
  if (mismatched === 0) console.log(`  PASS  ${entries.length} ranges match source exactly  (${file})`);
  else {
    fail += mismatched;
    console.log(`  FAIL  ${mismatched} range mismatches in ${file}`);
  }

  // overlap
  let overlaps = 0;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].start < entries[i - 1].end) {
      overlaps++;
      if (overlaps <= 3) {
        console.log(
          `  FAIL  overlap: ${entries[i - 1].id} [${entries[i - 1].start}..${entries[i - 1].end}] ` +
            `and ${entries[i].id} [${entries[i].start}..${entries[i].end}] in ${file}`,
        );
      }
    }
  }
  if (overlaps === 0) console.log(`  PASS  no overlapping ranges           (${file})`);
  else fail += overlaps;

  // ── 3: lossless splice round-trip ─────────────────────────────────────────
  let rebuilt = '';
  let cursor = 0;
  for (const e of entries) {
    rebuilt += src.slice(cursor, e.start) + e.text;
    cursor = e.end;
  }
  rebuilt += src.slice(cursor);
  if (rebuilt === src) {
    console.log(`  PASS  splice round-trip is byte-identical (${file})`);
  } else {
    fail++;
    console.log(`  FAIL  splice round-trip differs from source (${file})`);
  }
}

// ── 4: shared blocks genuinely identical everywhere ─────────────────────────
let sharedBad = 0;
for (const b of manifest.blocks) {
  if (!b.shared) continue;
  for (const l of b.locations) {
    const actual = srcs.get(l.file)!.slice(l.start, l.end);
    if (actual !== b.text) sharedBad++;
  }
}
if (sharedBad === 0) {
  console.log(`  PASS  all ${manifest.blocks.filter((b) => b.shared).length} shared blocks identical at every location`);
} else {
  fail += sharedBad;
  console.log(`  FAIL  ${sharedBad} shared-block locations disagree`);
}

// ── Coverage: prose in source not claimed by any block ──────────────────────
console.log('\n---------------- COVERAGE ----------------');
for (const [file, entries] of byFile) {
  const src = srcs.get(file)!;
  entries.sort((a, b) => a.start - b.start);
  const gaps: string[] = [];
  let cursor = 0;
  for (const e of entries) {
    const gap = src.slice(cursor, e.start);
    // A gap is "unclaimed prose" if it contains a run of 6+ words of letters
    // outside of any tag, import, or style block.
    const stripped = gap
      .replace(/<[^>]*>/g, ' ')
      .replace(/\bimport[\s\S]*?from\s+'[^']*';/g, ' ')
      .replace(/\{[\s\S]*?\}/g, ' ');
    const wordRun = /(?:\b[A-Za-z][A-Za-z'’-]{2,}\b[\s,.]+){6,}/.exec(stripped);
    if (wordRun) gaps.push(`line ~${1 + (src.slice(0, e.start).match(/\n/g)?.length ?? 0)}: ${wordRun[0].trim().slice(0, 90)}`);
    cursor = e.end;
  }
  console.log(`  ${file}`);
  if (gaps.length === 0) console.log('    no unclaimed prose runs found');
  else {
    console.log(`    ${gaps.length} possible unclaimed prose run(s):`);
    for (const g of gaps.slice(0, 12)) console.log(`      ${g}`);
  }
}

console.log();
if (fail > 0) {
  console.error(`================ ${fail} VERIFICATION FAILURE(S) ================`);
  process.exit(1);
}
console.log('================ EXTRACT VERIFIED ================');
