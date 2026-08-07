/**
 * scripts/apply-article-edits.ts
 *
 * The write-back half of the editorial round-trip.
 *
 * Reads the edited review .docx, resolves each [BLOCK-ID] anchor against
 * editorial/manifest.json, and splices changed text into the exact byte range
 * it came from. Tracked changes are accepted on read (insertions kept,
 * deletions dropped), so the text applied is the document's "final" view.
 *
 * Safety properties:
 *   - Edits are byte-range splices, applied per file in descending offset
 *     order, so no edit can shift another's coordinates.
 *   - Text is re-escaped for the delimiter it lives inside. A straight
 *     apostrophe typed into a single-quoted JSX prop becomes \' rather than
 *     terminating the literal.
 *   - Original leading/trailing whitespace is preserved, so JSX indentation
 *     survives untouched.
 *   - Structural edits the format cannot express (splitting one block into
 *     two paragraphs) are reported and skipped, never guessed at.
 *   - Dry run by default. Nothing is written without --write.
 *
 * Usage:
 *   pnpm apply-edits                  # dry run, prints the change report
 *   pnpm apply-edits -- --write       # actually write the MDX files
 *   pnpm apply-edits -- --docx path/to/file.docx
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const docxArgIdx = argv.indexOf('--docx');
const DOCX =
  docxArgIdx >= 0 && argv[docxArgIdx + 1]
    ? path.resolve(argv[docxArgIdx + 1])
    : path.join(ROOT, 'editorial', 'the-index-editorial-review.docx');

interface Block {
  id: string;
  kind: string;
  path: string;
  sectionId: string;
  text: string;
  shared: boolean;
  minor: boolean;
  quote: '"' | "'" | 'jsx';
  display: string;
  locations: { file: string; start: number; end: number; line: number }[];
}

const manifest = JSON.parse(
  readFileSync(path.join(ROOT, 'editorial', 'manifest.json'), 'utf-8'),
) as { blocks: Block[] };

const byId = new Map(manifest.blocks.map((b) => [b.id, b]));

// ── Read the docx ───────────────────────────────────────────────────────────

if (!existsSync(DOCX)) {
  console.error(`No such file: ${DOCX}`);
  console.error('Pass --docx <path> if the edited copy lives elsewhere.');
  process.exit(1);
}

function unzipPart(file: string, part: string): string | null {
  try {
    return execFileSync('unzip', ['-p', file, part], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

const documentXml = unzipPart(DOCX, 'word/document.xml');
if (!documentXml) {
  console.error(`Could not read word/document.xml from ${DOCX}`);
  process.exit(1);
}
const commentsXml = unzipPart(DOCX, 'word/comments.xml');

function decodeEntities(s: string): string {
  return s
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br\/>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Text of one paragraph in two views:
 *   final    — tracked changes accepted (w:t kept, w:delText dropped)
 *   original — tracked changes rejected (w:delText kept, w:ins dropped)
 */
function paragraphText(p: string): {
  final: string;
  original: string;
  hasTracked: boolean;
  style: string;
} {
  const hasTracked = /<w:ins[\s>]|<w:del[\s>]/.test(p);
  const style = /<w:pStyle\s+w:val="([^"]+)"/.exec(p)?.[1] ?? '';

  // final: every <w:t>, including inside <w:ins>; skip <w:delText>
  const final = decodeEntities(
    [...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]).join(''),
  );

  // original: drop <w:ins> blocks entirely, then take <w:t> + <w:delText>
  const withoutIns = p.replace(/<w:ins[\s>][\s\S]*?<\/w:ins>/g, '');
  const original = decodeEntities(
    [...withoutIns.matchAll(/<w:(?:t|delText)(?:\s[^>]*)?>([\s\S]*?)<\/w:(?:t|delText)>/g)]
      .map((m) => m[1])
      .join(''),
  );

  return { final, original, hasTracked, style };
}

const paras = [...documentXml.matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>|<w:p\/>/g)].map(
  (m) => m[0],
);

// ── Walk paragraphs, pairing [ID] anchors with the text that follows ────────

interface Found {
  id: string;
  paragraphs: { final: string; original: string; hasTracked: boolean; style: string }[];
}

const found: Found[] = [];
let current: Found | null = null;

for (const p of paras) {
  const t = paragraphText(p);
  const anchor = /^\s*\[([ABS]-\d{3})\]/.exec(t.final);
  if (anchor) {
    current = { id: anchor[1], paragraphs: [] };
    found.push(current);
    continue;
  }
  if (!current) continue;
  // Only paragraphs carrying the EditableText style are article text. Headings,
  // instructions and any notes the editor adds elsewhere are ignored, so they
  // can never be misread as a block having been split in two.
  if (t.style !== 'EditableText') {
    if (t.style.startsWith('Heading')) current = null;
    continue;
  }
  if (t.final.trim()) current.paragraphs.push(t);
}

// ── Escaping ────────────────────────────────────────────────────────────────

function escapeFor(text: string, quote: Block['quote']): { out: string; warn?: string } {
  if (quote === 'jsx') {
    // JSX children: raw < is fine here (the source already carries <strong>),
    // but { and } open expressions and would be a syntax error.
    if (/[{}]/.test(text)) {
      return {
        out: text,
        warn: 'contains { or } which JSX reads as an expression; left unescaped, review before build',
      };
    }
    return { out: text };
  }
  // String literal: escape backslashes first, then the delimiter itself.
  const out = text.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), '\\' + quote);
  return { out };
}

/** Split raw stored text into leading whitespace, body, trailing whitespace. */
function splitWhitespace(raw: string): { lead: string; body: string; tail: string } {
  const lead = /^\s*/.exec(raw)![0];
  const tail = /\s*$/.exec(raw)![0];
  const body = raw.slice(lead.length, raw.length - tail.length);
  return { lead, body, tail };
}

// ── Diff each anchored block ────────────────────────────────────────────────

interface Change {
  block: Block;
  before: string;
  after: string;
  tracked: boolean;
  warn?: string;
}

const changes: Change[] = [];
const structural: { id: string; count: number }[] = [];
const unknownIds: string[] = [];
const seen = new Set<string>();

for (const f of found) {
  const block = byId.get(f.id);
  if (!block) {
    unknownIds.push(f.id);
    continue;
  }
  seen.add(f.id);
  if (f.paragraphs.length === 0) continue;

  if (f.paragraphs.length > 1) {
    // The editor split one block across multiple paragraphs. A single byte
    // range cannot express that; it needs a real MDX structure change.
    structural.push({ id: f.id, count: f.paragraphs.length });
    continue;
  }

  const edited = f.paragraphs[0];
  const after = edited.final.trim();

  // `display` is the same human-readable form the document was built from, so
  // an untouched paragraph compares equal and never round-trips through the
  // escaper. Only genuine edits are re-escaped for the source delimiter.
  if (after === block.display) continue;

  const { out, warn } = escapeFor(after, block.quote);
  changes.push({ block, before: block.display, after: out, tracked: edited.hasTracked, warn });
}

const missing = manifest.blocks.filter((b) => !seen.has(b.id)).map((b) => b.id);

// ── Comments ────────────────────────────────────────────────────────────────

const comments: { author: string; text: string }[] = [];
if (commentsXml) {
  for (const m of commentsXml.matchAll(/<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g)) {
    const author = /w:author="([^"]*)"/.exec(m[1])?.[1] ?? 'unknown';
    const text = decodeEntities(
      [...m[2].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((x) => x[1]).join(''),
    ).trim();
    if (text) comments.push({ author, text });
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

function clip(s: string, n = 100): string {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n) + '…' : one;
}

console.log('================ EDIT APPLICATION ================');
console.log(`  source : ${path.relative(ROOT, DOCX)}`);
console.log(`  mode   : ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to apply)'}`);
console.log(`  anchors found in document : ${found.length} of ${manifest.blocks.length}`);
console.log();

if (changes.length === 0) {
  console.log('  No text changes detected.');
} else {
  console.log(`---------------- ${changes.length} CHANGED BLOCK(S) ----------------`);
  for (const c of changes) {
    const tag = c.block.shared ? ` SHARED ×${c.block.locations.length}` : '';
    console.log(`\n  [${c.block.id}]${tag}  ${c.block.path}`);
    console.log(`     -  ${clip(c.before)}`);
    console.log(`     +  ${clip(c.after)}`);
    if (!c.tracked) console.log('     !  changed without a tracked revision');
    if (c.warn) console.log(`     !  ${c.warn}`);
  }
  console.log();
}

if (structural.length > 0) {
  console.log(`---------------- ${structural.length} STRUCTURAL EDIT(S), SKIPPED ----------------`);
  console.log('  These blocks were split into multiple paragraphs. A byte-range splice');
  console.log('  cannot express that; they need a real MDX edit. Nothing was applied.');
  for (const s of structural) {
    const b = byId.get(s.id)!;
    console.log(`    [${s.id}] now ${s.count} paragraphs — ${b.path}`);
  }
  console.log();
}

if (unknownIds.length > 0) {
  console.log(`  ${unknownIds.length} unrecognised anchor(s): ${unknownIds.join(', ')}`);
}
if (missing.length > 0 && missing.length < manifest.blocks.length) {
  console.log(`  ${missing.length} block(s) had no anchor in the document (first few: ${missing.slice(0, 6).join(', ')})`);
}
if (comments.length > 0) {
  console.log(`\n---------------- ${comments.length} COMMENT(S) ----------------`);
  for (const c of comments) console.log(`    ${c.author}: ${clip(c.text, 160)}`);
}

// ── Apply ───────────────────────────────────────────────────────────────────

if (!WRITE) {
  console.log('\n  Dry run only. Re-run with --write to apply.');
  process.exit(0);
}

if (changes.length === 0) {
  console.log('\n  Nothing to write.');
  process.exit(0);
}

// Expand shared blocks to every location, group by file, splice descending.
interface Splice {
  start: number;
  end: number;
  text: string;
  id: string;
}
const perFile = new Map<string, Splice[]>();
for (const c of changes) {
  const { lead, tail } = splitWhitespace(c.block.text);
  for (const loc of c.block.locations) {
    if (!perFile.has(loc.file)) perFile.set(loc.file, []);
    perFile.get(loc.file)!.push({
      start: loc.start,
      end: loc.end,
      text: lead + c.after + tail,
      id: c.block.id,
    });
  }
}

console.log('\n---------------- WRITING ----------------');
for (const [file, splices] of perFile) {
  const abs = path.join(ROOT, file);
  let src = readFileSync(abs, 'utf-8');
  splices.sort((a, b) => b.start - a.start); // descending keeps offsets valid
  for (const s of splices) {
    src = src.slice(0, s.start) + s.text + src.slice(s.end);
  }
  writeFileSync(abs, src);
  console.log(`  ${file}: ${splices.length} splice(s) applied`);
}

console.log('\n  Written. Now re-run the gates:');
console.log('    pnpm typecheck && pnpm build && pnpm claims-audit');
console.log('  Then re-extract so the manifest matches the new source:');
console.log('    pnpm extract-text && pnpm verify-extract');
