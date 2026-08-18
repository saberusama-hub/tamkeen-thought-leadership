/**
 * lib/editorial/splice.ts
 *
 * Applies a map of block id -> new text back into the MDX sources by exact
 * byte-range splice. This is the same mechanism the Word round-trip uses; it
 * is factored out here so the CLI, the local dev loop and the live web editor
 * share one implementation rather than drifting apart.
 *
 * `planEdits` is pure: it takes the current source text and returns the splices
 * to perform, refusing anything it cannot express safely. The callers decide
 * where those splices land — the working tree in development, a GitHub commit
 * in production.
 *
 * Byte ranges rather than search-and-replace is a deliberate choice: 43 of the
 * 511 block/location pairs have source text that occurs more than once in its
 * own file (one appears ten times), so replacement would be ambiguous.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface ManifestBlock {
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

export interface Applied {
  id: string;
  before: string;
  after: string;
  locations: number;
  warn?: string;
}

export interface Rejected {
  id: string;
  reason: string;
}

export interface Splice {
  start: number;
  end: number;
  text: string;
  id: string;
}

export interface EditPlan {
  applied: Applied[];
  unchanged: string[];
  unknown: string[];
  rejected: Rejected[];
  /** Byte splices keyed by repo-relative file path, sorted descending. */
  splices: Map<string, Splice[]>;
  /**
   * Blocks whose recorded byte range no longer holds the text we expected.
   * The manifest is bundled at build time, so any push since then shifts every
   * offset after it. Non-empty means: refuse the whole publish.
   */
  stale: { id: string; file: string }[];
}

const ROOT = process.cwd();

/** Only inline tags a contenteditable edit may legitimately carry. */
const DISALLOWED_MARKUP = /<(?!\/?(?:strong|em)\b)[^>]*>/;

const MAX_BLOCK_CHARS = 6000;
export const MAX_EDITS_PER_PUBLISH = 250;

export function loadManifestFromDisk(): { blocks: ManifestBlock[] } {
  return JSON.parse(
    readFileSync(path.join(ROOT, 'editorial', 'manifest.json'), 'utf-8'),
  ) as { blocks: ManifestBlock[] };
}

/**
 * Re-escape edited text for the delimiter the block lives inside. 160 blocks
 * sit in single-quoted literals, where a typed apostrophe would otherwise
 * terminate the string and break the build.
 */
export function escapeFor(
  text: string,
  quote: ManifestBlock['quote'],
): { out: string; warn?: string } {
  if (quote === 'jsx') {
    if (/[{}]/.test(text)) {
      return {
        out: text,
        warn: 'contains { or } which JSX reads as an expression; review before build',
      };
    }
    return { out: text };
  }
  return { out: text.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), '\\' + quote) };
}

function splitWhitespace(raw: string): { lead: string; tail: string } {
  const lead = /^\s*/.exec(raw)![0];
  const tail = /\s*$/.exec(raw)![0];
  return { lead, tail };
}

/** Which repo-relative files a set of edits would touch. */
export function filesTouched(
  edits: Record<string, string>,
  blocks: ManifestBlock[],
): string[] {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const files = new Set<string>();
  for (const id of Object.keys(edits)) {
    const b = byId.get(id);
    if (!b) continue;
    for (const l of b.locations) files.add(l.file);
  }
  return [...files];
}

/**
 * Work out what to write, without writing anything.
 *
 * `sources` must contain the *current* text of every file the edits touch.
 * Every block is checked against its recorded byte range before being spliced,
 * so a stale manifest produces a clean refusal instead of a corrupted file.
 */
export function planEdits(
  edits: Record<string, string>,
  blocks: ManifestBlock[],
  sources: Map<string, string>,
): EditPlan {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const plan: EditPlan = {
    applied: [],
    unchanged: [],
    unknown: [],
    rejected: [],
    splices: new Map(),
    stale: [],
  };

  for (const [id, rawNext] of Object.entries(edits)) {
    const block = byId.get(id);
    if (!block) {
      plan.unknown.push(id);
      continue;
    }

    if (typeof rawNext !== 'string') {
      plan.rejected.push({ id, reason: 'value is not text' });
      continue;
    }
    const next = rawNext.trim();

    if (next === block.display) {
      plan.unchanged.push(id);
      continue;
    }
    if (next.length === 0) {
      plan.rejected.push({ id, reason: 'empty; refusing to blank a block' });
      continue;
    }
    if (next.length > MAX_BLOCK_CHARS) {
      plan.rejected.push({ id, reason: `longer than ${MAX_BLOCK_CHARS} characters` });
      continue;
    }
    if (/[\r\n]/.test(next)) {
      plan.rejected.push({
        id,
        reason: 'contains a line break; a single byte range cannot split a block in two',
      });
      continue;
    }
    if (DISALLOWED_MARKUP.test(next)) {
      plan.rejected.push({ id, reason: 'contains markup other than <strong> or <em>' });
      continue;
    }

    // Precondition: the bytes we are about to overwrite must still be exactly
    // what the manifest says they are.
    let fresh = true;
    for (const loc of block.locations) {
      const src = sources.get(loc.file);
      if (src === undefined) {
        plan.rejected.push({ id, reason: `source for ${loc.file} was not provided` });
        fresh = false;
        break;
      }
      if (src.slice(loc.start, loc.end) !== block.text) {
        plan.stale.push({ id, file: loc.file });
        fresh = false;
        break;
      }
    }
    if (!fresh) continue;

    const { out, warn } = escapeFor(next, block.quote);
    const { lead, tail } = splitWhitespace(block.text);

    for (const loc of block.locations) {
      if (!plan.splices.has(loc.file)) plan.splices.set(loc.file, []);
      plan.splices.get(loc.file)!.push({
        start: loc.start,
        end: loc.end,
        text: lead + out + tail,
        id: block.id,
      });
    }
    plan.applied.push({
      id,
      before: block.display,
      after: next,
      locations: block.locations.length,
      warn,
    });
  }

  // Descending by offset so earlier splices never invalidate later ones.
  for (const list of plan.splices.values()) list.sort((a, b) => b.start - a.start);
  return plan;
}

/** Produce the new text for one file by applying its splices. */
export function spliceFile(source: string, splices: Splice[]): string {
  let out = source;
  for (const s of splices) out = out.slice(0, s.start) + s.text + out.slice(s.end);
  return out;
}

// ── Local working-tree helpers (development and the CLI) ────────────────────

export function readSourcesFromDisk(files: string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const f of files) m.set(f, readFileSync(path.join(ROOT, f), 'utf-8'));
  return m;
}

export interface ApplyResult extends Omit<EditPlan, 'splices'> {
  filesWritten: { file: string; splices: number }[];
}

/** Plan and, optionally, write to the local working tree. */
export function applyEdits(
  edits: Record<string, string>,
  opts: { write: boolean } = { write: false },
): ApplyResult {
  const blocks = loadManifestFromDisk().blocks;
  const sources = readSourcesFromDisk(filesTouched(edits, blocks));
  const plan = planEdits(edits, blocks, sources);

  const result: ApplyResult = { ...plan, filesWritten: [] };
  if (!opts.write || plan.applied.length === 0 || plan.stale.length > 0) return result;

  for (const [file, splices] of plan.splices) {
    const abs = path.join(ROOT, file);
    writeFileSync(abs, spliceFile(sources.get(file)!, splices));
    result.filesWritten.push({ file, splices: splices.length });
  }
  return result;
}
