/**
 * scripts/extract-article-text.ts
 *
 * Extracts every editable text run from the article MDX files into a manifest
 * of addressable blocks, each pinned to an exact byte range in its source file.
 *
 * The manifest is the contract for the editing round-trip:
 *   extract  ->  author edits by block ID  ->  apply-article-edits.ts
 *
 * Because every block carries { file, start, end }, applying an edit is an
 * exact byte-range splice rather than a search-and-replace. Nothing is matched
 * fuzzily and nothing is re-serialised, so JSX structure cannot be disturbed.
 *
 * Blocks whose text is byte-identical across both articles are marked
 * `shared: true` and given a single S-prefixed ID with multiple locations, so
 * the author edits shared exhibit captions once rather than twice.
 *
 * Run: pnpm extract-text
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'editorial');

const ARTICLES = [
  {
    key: 'A',
    slug: 'decade-that-reshaped-higher-education',
    label: "Asia's rise, and the rest",
  },
  {
    key: 'B',
    slug: 'rankings-decade-told-straight',
    label: 'A decade in the rankings',
  },
] as const;

/** Props whose string values are prose the editor should see. */
const TEXT_PROPS = new Set([
  'title',
  'dek',
  'kicker',
  'sub',
  'source',
  'label',
  'desc',
  'body',
  'caption',
  'cite',
  'caveat',
  'tag',
  'name',
  'value',
  'data',
  'lesson',
  'diagonalLabel',
  'xAxisLabel',
  'yAxisLabel',
  'ariaLabel',
  'prob',
]);

/**
 * Props that are structural rather than prose. `label` and `name` are
 * overloaded in this codebase: they carry real caption text on KPI cards and
 * footprint rows, but also chart-internal axis keys and colour-segment names.
 * We keep them, but flag the short ones so the docx can group them separately.
 */
const STRUCTURAL_HINT_MAX_LEN = 24;

/** JSX elements whose children are prose. */
const TEXT_ELEMENTS = ['p', 'h3', 'h4', 'li', 'Callout', 'PullQuote', 'Handoff', 'FullDivider'];

export interface Block {
  id: string;
  /** 'prose' | 'prop' | 'bullet' | 'frontmatter' */
  kind: string;
  /** Human-readable trail, e.g. "06 Spotlight · UAE > Exhibit > sub". */
  path: string;
  sectionId: string;
  text: string;
  /** True when the identical string appears in both articles. */
  shared: boolean;
  /** Every place this text lives. One entry unless shared. */
  locations: { file: string; start: number; end: number; line: number }[];
  /** Short structural strings (axis labels, colour keys) an editor usually skips. */
  minor: boolean;
  /**
   * The delimiter this text sits inside: '"' or "'" for string literals, or
   * 'jsx' for element children. Write-back MUST escape the edited text for
   * this delimiter, or an apostrophe typed into a single-quoted prop would
   * terminate the literal and break the build.
   */
  quote: '"' | "'" | 'jsx';
  /**
   * The human-readable form shown to the editor: trimmed, and with source
   * escaping resolved (\\' becomes '). Edits come back in this form and are
   * re-escaped for `quote` on write-back. Keeping display and source distinct
   * is what stops a round-trip from double-escaping an apostrophe.
   */
  display: string;
}

/** Resolve source-level escaping into the plain text a human should read. */
export function toDisplay(raw: string, quote: '"' | "'" | 'jsx'): string {
  const trimmed = raw.trim();
  if (quote === 'jsx') return trimmed;
  return trimmed.replace(/\\(['"\\])/g, '$1');
}

/**
 * Reads a JS/JSX string literal starting at the opening quote.
 * Handles backslash escapes correctly (the codebase has `that\'s`).
 * Returns the inner byte range, exclusive of the quotes.
 */
function readStringLiteral(
  src: string,
  quoteIdx: number,
): { innerStart: number; innerEnd: number; value: string } | null {
  const quote = src[quoteIdx];
  if (quote !== '"' && quote !== "'") return null;
  let i = quoteIdx + 1;
  let out = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      out += src[i] + src[i + 1];
      i += 2;
      continue;
    }
    if (ch === quote) {
      return { innerStart: quoteIdx + 1, innerEnd: i, value: out };
    }
    if (ch === '\n') return null; // unterminated on this line; not a prose literal
    out += ch;
    i++;
  }
  return null;
}

function lineOf(src: string, idx: number): number {
  let line = 1;
  for (let i = 0; i < idx; i++) if (src[i] === '\n') line++;
  return line;
}

/** Track which ArticleSection / SectionHeader an offset falls inside. */
function buildSectionIndex(src: string): { start: number; id: string; label: string }[] {
  const marks: { start: number; id: string; label: string }[] = [];
  const re = /<ArticleSection\s+id="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const id = m[1];
    // Look ahead for the SectionHeader number + kicker to label it nicely.
    const tail = src.slice(m.index, m.index + 900);
    const num = /number="([^"]+)"/.exec(tail)?.[1] ?? '';
    const kicker = /kicker="([^"]+)"/.exec(tail)?.[1] ?? '';
    marks.push({ start: m.index, id, label: [num, kicker].filter(Boolean).join(' ') || id });
  }
  return marks;
}

function sectionAt(
  marks: { start: number; id: string; label: string }[],
  idx: number,
): { id: string; label: string } {
  let cur = { id: 'front', label: 'Front matter' };
  for (const mk of marks) {
    if (mk.start <= idx) cur = { id: mk.id, label: mk.label };
    else break;
  }
  return cur;
}

/**
 * Nearest enclosing component name for an offset, used to build the path trail.
 * Scans backwards for the most recent unclosed `<ComponentName`.
 */
function enclosingComponent(src: string, idx: number): string {
  const head = src.slice(Math.max(0, idx - 4000), idx);
  const matches = [...head.matchAll(/<([A-Z][A-Za-z0-9]*)[\s>]/g)];
  if (matches.length === 0) return '';
  return matches[matches.length - 1][1];
}

interface RawBlock {
  kind: string;
  path: string;
  sectionId: string;
  text: string;
  file: string;
  start: number;
  end: number;
  line: number;
  minor: boolean;
  quote: '"' | "'" | 'jsx';
}

function extractFromFile(file: string, relFile: string): RawBlock[] {
  const src = readFileSync(file, 'utf-8');
  const marks = buildSectionIndex(src);
  const out: RawBlock[] = [];
  const claimed: [number, number][] = [];

  const overlaps = (s: number, e: number) =>
    claimed.some(([cs, ce]) => s < ce && e > cs);

  // ── 1. Frontmatter title + dek ────────────────────────────────────────────
  const fmEnd = src.indexOf('\n---', 4);
  const fm = src.slice(0, fmEnd > 0 ? fmEnd : 0);
  for (const key of ['title', 'dek']) {
    const re = new RegExp(`^${key}:\\s*"`, 'm');
    const m = re.exec(fm);
    if (!m) continue;
    const q = m.index + m[0].length - 1;
    const lit = readStringLiteral(src, q);
    if (!lit) continue;
    out.push({
      kind: 'frontmatter',
      path: `Headline > ${key}`,
      sectionId: 'front',
      text: lit.value,
      file: relFile,
      start: lit.innerStart,
      end: lit.innerEnd,
      line: lineOf(src, lit.innerStart),
      minor: false,
      quote: '"',
    });
    claimed.push([lit.innerStart, lit.innerEnd]);
  }

  // ── 2. JSX text elements (children are prose) ─────────────────────────────
  for (const tag of TEXT_ELEMENTS) {
    // Opening tag, possibly with attributes spanning lines, then children up to </tag>
    const re = new RegExp(`<${tag}(\\s[^>]*?)?>([\\s\\S]*?)</${tag}>`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const inner = m[2];
      const innerStart = m.index + m[0].length - inner.length - (`</${tag}>`).length;
      const innerEnd = innerStart + inner.length;
      if (overlaps(innerStart, innerEnd)) continue;
      const trimmed = inner.trim();
      if (!trimmed) continue;
      // Skip children that are pure JSX (e.g. <p> wrapping only components).
      if (/^<[A-Z]/.test(trimmed)) continue;
      const sec = sectionAt(marks, innerStart);
      out.push({
        kind: 'prose',
        path: `${sec.label} > <${tag}>`,
        sectionId: sec.id,
        text: inner,
        file: relFile,
        start: innerStart,
        end: innerEnd,
        line: lineOf(src, innerStart),
        minor: false,
        quote: 'jsx',
      });
      claimed.push([innerStart, innerEnd]);
    }
  }

  // ── 3. Bullet arrays: bullets: [ '...', '...' ] ───────────────────────────
  {
    const re = /\bbullets:\s*\[/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      let i = m.index + m[0].length;
      let depth = 1;
      let n = 0;
      while (i < src.length && depth > 0) {
        const ch = src[i];
        if (ch === '[') depth++;
        else if (ch === ']') depth--;
        else if (ch === '"' || ch === "'") {
          const lit = readStringLiteral(src, i);
          if (lit) {
            const sec = sectionAt(marks, lit.innerStart);
            const comp = enclosingComponent(src, m.index);
            n++;
            if (!overlaps(lit.innerStart, lit.innerEnd)) {
              out.push({
                kind: 'bullet',
                path: `${sec.label} > ${comp} > bullet ${n}`,
                sectionId: sec.id,
                text: lit.value,
                file: relFile,
                start: lit.innerStart,
                end: lit.innerEnd,
                line: lineOf(src, lit.innerStart),
                minor: false,
                quote: src[i] as '"' | "'",
              });
              claimed.push([lit.innerStart, lit.innerEnd]);
            }
            i = lit.innerEnd + 1;
            continue;
          }
        }
        i++;
      }
    }
  }

  // ── 4. Text-bearing props: name="..." and name: '...' ─────────────────────
  {
    const re = /\b([a-zA-Z][a-zA-Z0-9]*)\s*[=:]\s*(?=["'])/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const prop = m[1];
      if (!TEXT_PROPS.has(prop)) continue;
      const q = m.index + m[0].length;
      const lit = readStringLiteral(src, q);
      if (!lit) continue;
      if (overlaps(lit.innerStart, lit.innerEnd)) continue;
      const value = lit.value.trim();
      if (!value) continue;
      // Skip pure-numeric / pure-symbol values (chart data, not prose).
      if (/^[\d\s.,%+\-–—→×]*$/.test(value)) continue;
      const sec = sectionAt(marks, lit.innerStart);
      const comp = enclosingComponent(src, lit.innerStart);
      out.push({
        kind: 'prop',
        path: `${sec.label} > ${comp || 'root'} > ${prop}`,
        sectionId: sec.id,
        text: lit.value,
        file: relFile,
        start: lit.innerStart,
        end: lit.innerEnd,
        line: lineOf(src, lit.innerStart),
        minor: value.length <= STRUCTURAL_HINT_MAX_LEN,
        quote: src[q] as '"' | "'",
      });
      claimed.push([lit.innerStart, lit.innerEnd]);
    }
  }

  out.sort((a, b) => a.start - b.start);
  return out;
}

// ── Build the manifest ──────────────────────────────────────────────────────

const perFile = ARTICLES.map((a) => ({
  ...a,
  rel: `content/articles/${a.slug}.mdx`,
  blocks: extractFromFile(
    path.join(ROOT, 'content', 'articles', `${a.slug}.mdx`),
    `content/articles/${a.slug}.mdx`,
  ),
}));

// Group byte-identical text across the two articles into shared blocks.
const byText = new Map<string, RawBlock[]>();
for (const f of perFile) {
  for (const b of f.blocks) {
    const key = b.text;
    if (!byText.has(key)) byText.set(key, []);
    byText.get(key)!.push(b);
  }
}

const blocks: Block[] = [];
let sharedN = 0;
const perArticleN: Record<string, number> = { A: 0, B: 0 };
const emitted = new Set<RawBlock>();

// Walk article A in document order, then article B, so the docx reads naturally.
for (const f of perFile) {
  for (const b of f.blocks) {
    if (emitted.has(b)) continue;
    const group = byText.get(b.text)!;
    const files = new Set(group.map((g) => g.file));
    const isShared = files.size > 1;
    let id: string;
    if (isShared) {
      sharedN++;
      id = `S-${String(sharedN).padStart(3, '0')}`;
    } else {
      perArticleN[f.key]++;
      id = `${f.key}-${String(perArticleN[f.key]).padStart(3, '0')}`;
    }
    for (const g of group) emitted.add(g);
    blocks.push({
      id,
      kind: b.kind,
      path: b.path,
      sectionId: b.sectionId,
      text: b.text,
      shared: isShared,
      minor: b.minor,
      quote: b.quote,
      display: toDisplay(b.text, b.quote),
      locations: group.map((g) => ({
        file: g.file,
        start: g.start,
        end: g.end,
        line: g.line,
      })),
    });
  }
}

mkdirSync(OUT_DIR, { recursive: true });

const manifest = {
  generatedFrom: perFile.map((f) => ({ key: f.key, slug: f.slug, label: f.label, file: f.rel })),
  blockCount: blocks.length,
  sharedCount: blocks.filter((b) => b.shared).length,
  blocks,
};

writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

// ── Client manifest ─────────────────────────────────────────────────────────
// A slim, per-page projection of the same blocks, written to public/ so the
// in-browser edit layer can fetch it on demand. Readers never download it:
// it is requested only when edit mode is switched on.
//
// Blocks are ordered by their byte offset within that page's own file, which
// is the same order they appear in the rendered DOM. The edit layer relies on
// that to disambiguate the handful of blocks whose text is not unique.
const pages: Record<string, unknown[]> = {};
for (const f of perFile) {
  pages[f.slug] = blocks
    .map((b) => {
      const loc = b.locations.find((l) => l.file === f.rel);
      return loc ? { b, start: loc.start } : null;
    })
    .filter((x): x is { b: (typeof blocks)[number]; start: number } => x !== null)
    .sort((x, y) => x.start - y.start)
    .map(({ b }) => ({
      id: b.id,
      kind: b.kind,
      path: b.path,
      display: b.display,
      shared: b.shared,
      minor: b.minor,
      // A block carrying markup beyond <strong>/<em> — the FullDivider spans
      // hold a JSX style expression — cannot survive a contenteditable round
      // trip, so the browser editor must not offer it. Flagged here rather
      // than refused at publish time, so nothing looks editable that isn't.
      editable: !/<(?!\/?(?:strong|em)\b)[^>]*>/.test(b.display),
    }));
}

mkdirSync(path.join(ROOT, 'public'), { recursive: true });
writeFileSync(
  path.join(ROOT, 'public', 'editorial-manifest.json'),
  JSON.stringify({ blockCount: blocks.length, pages }),
);

// ── Report ──────────────────────────────────────────────────────────────────
const words = blocks.reduce((n, b) => n + b.text.trim().split(/\s+/).length, 0);
console.log('================ TEXT EXTRACTION ================');
for (const f of perFile) {
  console.log(`  ${f.key}  ${f.label}`);
  console.log(`     ${f.blocks.length} text runs from ${f.rel}`);
}
console.log('---');
console.log(`  unique editable blocks : ${blocks.length}`);
console.log(`  shared across both     : ${manifest.sharedCount}`);
console.log(`  article A only         : ${blocks.filter((b) => b.id.startsWith('A-')).length}`);
console.log(`  article B only         : ${blocks.filter((b) => b.id.startsWith('B-')).length}`);
console.log(`  minor/structural       : ${blocks.filter((b) => b.minor).length}`);
console.log(`  total words            : ~${words.toLocaleString()}`);
console.log(`\n  manifest -> editorial/manifest.json`);
console.log(`  client   -> public/editorial-manifest.json`);
