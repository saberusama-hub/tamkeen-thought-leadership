/**
 * lib/editorial/splice.ts
 *
 * Applies a map of block id -> new text back into the MDX sources by exact
 * byte-range splice. This is the same mechanism the Word round-trip uses; it
 * is factored out here so the in-browser edit layer and the CLI share one
 * implementation rather than drifting apart.
 *
 * Server-only: reads and writes the repository working tree.
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

export interface ApplyResult {
  applied: { id: string; before: string; after: string; locations: number; warn?: string }[];
  unchanged: string[];
  unknown: string[];
  rejected: { id: string; reason: string }[];
  filesWritten: { file: string; splices: number }[];
}

const ROOT = process.cwd();

export function loadManifest(): { blocks: ManifestBlock[] } {
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

/**
 * Only these inline tags may survive an edit. Anything else a browser's
 * contenteditable might invent (<div>, <span style>, <br>, pasted markup) is
 * refused rather than written into the source.
 */
const ALLOWED_MARKUP = /<(?!\/?(?:strong|em)\b)[^>]*>/;

export function applyEdits(
  edits: Record<string, string>,
  opts: { write: boolean } = { write: false },
): ApplyResult {
  const manifest = loadManifest();
  const byId = new Map(manifest.blocks.map((b) => [b.id, b]));

  const result: ApplyResult = {
    applied: [],
    unchanged: [],
    unknown: [],
    rejected: [],
    filesWritten: [],
  };

  interface Splice {
    start: number;
    end: number;
    text: string;
  }
  const perFile = new Map<string, Splice[]>();

  for (const [id, rawNext] of Object.entries(edits)) {
    const block = byId.get(id);
    if (!block) {
      result.unknown.push(id);
      continue;
    }

    const next = rawNext.trim();
    if (next === block.display) {
      result.unchanged.push(id);
      continue;
    }
    if (next.length === 0) {
      result.rejected.push({ id, reason: 'empty text; refusing to blank a block' });
      continue;
    }
    if (ALLOWED_MARKUP.test(next)) {
      result.rejected.push({
        id,
        reason: 'contains markup other than <strong>/<em>',
      });
      continue;
    }
    if (/\n/.test(next)) {
      result.rejected.push({
        id,
        reason: 'contains a line break; a byte range cannot express a split block',
      });
      continue;
    }

    const { out, warn } = escapeFor(next, block.quote);
    const { lead, tail } = splitWhitespace(block.text);

    for (const loc of block.locations) {
      if (!perFile.has(loc.file)) perFile.set(loc.file, []);
      perFile.get(loc.file)!.push({ start: loc.start, end: loc.end, text: lead + out + tail });
    }
    result.applied.push({
      id,
      before: block.display,
      after: next,
      locations: block.locations.length,
      warn,
    });
  }

  if (!opts.write || result.applied.length === 0) return result;

  for (const [file, splices] of perFile) {
    const abs = path.join(ROOT, file);
    let src = readFileSync(abs, 'utf-8');
    // Descending by offset so earlier splices never invalidate later ones.
    splices.sort((a, b) => b.start - a.start);
    for (const s of splices) src = src.slice(0, s.start) + s.text + src.slice(s.end);
    writeFileSync(abs, src);
    result.filesWritten.push({ file, splices: splices.length });
  }

  return result;
}
