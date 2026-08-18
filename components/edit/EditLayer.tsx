'use client';

/**
 * components/edit/EditLayer.tsx
 *
 * In-browser editing for every text block in an article.
 *
 * The article is server-rendered from MDX, and roughly half its reader-visible
 * copy lives in JSX props rather than paragraphs, so there is no way to wrap
 * each string in an editable element without rewriting every exhibit
 * component. Instead this layer reuses the manifest the Word round-trip
 * already builds: each block carries the exact text it renders as, so at
 * runtime we can walk the DOM, match blocks to the elements that contain
 * them, and tag those elements with their block id.
 *
 * That means zero changes to any component or to the MDX, and edits map back
 * to exact byte ranges in the source with no fuzzy matching.
 *
 * Inert until switched on. Readers never download the manifest and never see
 * a control: edit mode opens only via ?edit=1, a prior session in this
 * browser, or Ctrl/Cmd+Shift+E.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ClientBlock {
  id: string;
  kind: string;
  path: string;
  display: string;
  shared: boolean;
  minor: boolean;
}

interface Props {
  slug: string;
}

const LS_EDITS = (slug: string) => `theindex:edits:${slug}`;
const LS_ON = 'theindex:edit-mode';

/** Collapse whitespace and smart punctuation so source and DOM compare equal. */
function norm(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Does this block's *source* carry inline markup? */
function sourceHasMarkup(display: string): boolean {
  return /<(?:strong|em)\b/i.test(display);
}

/**
 * Serialise an edited element back to source form.
 *
 * The source is the authority on markup, not the DOM. Several components
 * decorate their output with markup that the source never had: ArticleHero,
 * SectionHeader and Headline each wrap the `emphasis` word in <em> to render
 * the italic accent. Preserving that would rewrite `title: "A decade in the
 * rankings"` as `A <em>decade</em> in the rankings` the moment a headline was
 * focused and blurred, corrupting frontmatter nobody meant to touch.
 *
 * So markup survives only for blocks whose source already contains it; for
 * every other block the element is read as plain text.
 */
function serialise(el: HTMLElement, allowMarkup: boolean): string {
  if (!allowMarkup) return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const e = node as HTMLElement;
    const inner = Array.from(e.childNodes).map(walk).join('');
    const tag = e.tagName.toLowerCase();
    if (tag === 'strong' || tag === 'b') return `<strong>${inner}</strong>`;
    if (tag === 'em' || tag === 'i') return `<em>${inner}</em>`;
    if (tag === 'br') return ' ';
    return inner;
  };
  return Array.from(el.childNodes).map(walk).join('').replace(/\s+/g, ' ').trim();
}

/** Read an element the way its block's source form allows. */
function readEl(el: HTMLElement): string {
  return serialise(el, el.dataset.eidMarkup === '1');
}

/** Write text into an element, respecting whether its source allows markup. */
function writeEl(el: HTMLElement, text: string): void {
  if (el.dataset.eidMarkup === '1') {
    el.innerHTML = text
      .replace(/&/g, '&amp;')
      .replace(/<(?!\/?(?:strong|em)>)/g, '&lt;');
  } else {
    el.textContent = text;
  }
}

export function EditLayer({ slug }: Props) {
  const [on, setOn] = useState(false);
  const [blocks, setBlocks] = useState<ClientBlock[] | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [matched, setMatched] = useState(0);
  const [review, setReview] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const originals = useRef(new Map<string, string>());
  const elements = useRef(new Map<string, HTMLElement>());

  // ── Activation ────────────────────────────────────────────────────────────
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    if (url.get('edit') === '1' || localStorage.getItem(LS_ON) === '1') setOn(true);

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setOn((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.editMode = on ? 'on' : '';
    if (on) localStorage.setItem(LS_ON, '1');
    else localStorage.removeItem(LS_ON);
  }, [on]);

  // ── Restore any edits from a previous session ─────────────────────────────
  useEffect(() => {
    if (!on) return;
    try {
      const raw = localStorage.getItem(LS_EDITS(slug));
      if (raw) setEdits(JSON.parse(raw) as Record<string, string>);
    } catch {
      /* corrupt payload: start clean rather than block editing */
    }
  }, [on, slug]);

  useEffect(() => {
    if (!on) return;
    localStorage.setItem(LS_EDITS(slug), JSON.stringify(edits));
  }, [edits, on, slug]);

  // ── Fetch the manifest, only once edit mode is switched on ────────────────
  useEffect(() => {
    if (!on || blocks) return;
    let cancelled = false;
    fetch('/editorial-manifest.json')
      .then((r) => r.json())
      .then((d: { pages: Record<string, ClientBlock[]> }) => {
        if (!cancelled) setBlocks(d.pages[slug] ?? []);
      })
      .catch(() => setStatus('Could not load the block manifest.'));
    return () => {
      cancelled = true;
    };
  }, [on, blocks, slug]);

  // ── Match blocks onto DOM elements ────────────────────────────────────────
  useEffect(() => {
    if (!on || !blocks) return;
    const root = document.querySelector('main');
    if (!root) return;

    // Index every element by its normalised text content. An element whose
    // text equals a block's text is a candidate to *be* that block.
    const index = new Map<string, { depth: number; el: HTMLElement; order: number }[]>();
    let order = 0;
    const walk = (el: Element, depth: number) => {
      const t = norm(el.textContent ?? '');
      if (t.length >= 2 && t.length <= 4000) {
        if (!index.has(t)) index.set(t, []);
        index.get(t)!.push({ depth, el: el as HTMLElement, order: order++ });
      }
      for (const c of Array.from(el.children)) walk(c, depth + 1);
    };
    walk(root, 0);

    const used = new WeakSet<HTMLElement>();
    // Kept locally as well as on the ref, so cleanup untags exactly the
    // elements this run tagged even if the ref has since been repopulated.
    const tagged: HTMLElement[] = [];
    let hits = 0;
    elements.current.clear();
    originals.current.clear();

    for (const b of blocks) {
      const key = norm(b.display);
      const cands = index.get(key);
      if (!cands) continue;
      // Deepest element is the tightest wrapper around exactly this text.
      // Ties break by document order, and each element is claimed once, so
      // repeated strings map to successive occurrences.
      const free = cands.filter((c) => !used.has(c.el));
      if (free.length === 0) continue;
      const maxDepth = Math.max(...free.map((c) => c.depth));
      const pick = free.filter((c) => c.depth === maxDepth).sort((a, z) => a.order - z.order)[0];
      used.add(pick.el);
      tagged.push(pick.el);
      pick.el.dataset.eid = b.id;
      pick.el.dataset.eidKind = b.kind;
      if (b.shared) pick.el.dataset.eidShared = '1';
      if (sourceHasMarkup(b.display)) pick.el.dataset.eidMarkup = '1';
      elements.current.set(b.id, pick.el);
      originals.current.set(b.id, b.display);
      hits++;
    }
    setMatched(hits);

    return () => {
      for (const el of tagged) {
        delete el.dataset.eid;
        delete el.dataset.eidKind;
        delete el.dataset.eidShared;
        delete el.dataset.eidMarkup;
        el.removeAttribute('contenteditable');
        el.classList.remove('eid-dirty');
      }
    };
  }, [on, blocks]);

  // ── Re-apply stored edits to the DOM once matching has run ────────────────
  useEffect(() => {
    if (!on || matched === 0) return;
    for (const [id, text] of Object.entries(edits)) {
      const el = elements.current.get(id);
      if (!el) continue;
      if (readEl(el) !== text) writeEl(el, text);
      el.classList.add('eid-dirty');
    }
  }, [on, matched, edits]);

  // ── Editing interactions ──────────────────────────────────────────────────
  const commit = useCallback((el: HTMLElement) => {
    const id = el.dataset.eid;
    if (!id) return;
    const next = readEl(el);
    const before = originals.current.get(id) ?? '';
    setEdits((prev) => {
      const copy = { ...prev };
      if (next === before) {
        delete copy[id];
        el.classList.remove('eid-dirty');
      } else {
        copy[id] = next;
        el.classList.add('eid-dirty');
      }
      return copy;
    });
  }, []);

  useEffect(() => {
    if (!on || matched === 0) return;

    const target = (e: Event): HTMLElement | null => {
      const el = (e.target as HTMLElement | null)?.closest?.('[data-eid]');
      return (el as HTMLElement) ?? null;
    };

    const onClick = (e: MouseEvent) => {
      const el = target(e);
      if (!el) return;
      // Suppress link navigation and chart interaction while editing.
      e.preventDefault();
      e.stopPropagation();
      if (el.getAttribute('contenteditable') === 'true') return;
      el.setAttribute('contenteditable', 'true');
      el.spellcheck = true;
      el.focus();
    };
    const onBlur = (e: FocusEvent) => {
      const el = target(e);
      if (!el) return;
      el.removeAttribute('contenteditable');
      commit(el);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = target(e);
      if (!el) return;
      if (e.key === 'Enter') {
        // A block is one byte range; it cannot become two paragraphs.
        e.preventDefault();
        el.blur();
      }
      if (e.key === 'Escape') {
        const id = el.dataset.eid!;
        el.textContent = edits[id] ?? originals.current.get(id) ?? el.textContent;
        el.blur();
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      const el = target(e);
      if (!el) return;
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain')?.replace(/\s+/g, ' ') ?? '';
      document.execCommand('insertText', false, text);
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('blur', onBlur, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('paste', onPaste, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('blur', onBlur, true);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('paste', onPaste, true);
    };
  }, [on, matched, commit, edits]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const count = Object.keys(edits).length;

  const revertOne = (id: string) => {
    const el = elements.current.get(id);
    const before = originals.current.get(id);
    if (el && before !== undefined) {
      writeEl(el, before);
      el.classList.remove('eid-dirty');
    }
    setEdits((p) => {
      const c = { ...p };
      delete c[id];
      return c;
    });
  };

  const revertAll = () => {
    for (const id of Object.keys(edits)) revertOne(id);
    setReview(false);
  };

  const save = async () => {
    setStatus('Saving…');
    try {
      const res = await fetch('/api/editorial/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ edits }),
      });
      if (res.ok) {
        const d = (await res.json()) as { applied: number; files: number; rejected: string[] };
        setStatus(
          `Written to source: ${d.applied} block(s) across ${d.files} file(s).` +
            (d.rejected.length ? ` ${d.rejected.length} rejected.` : ''),
        );
        return;
      }
    } catch {
      /* no dev server route: fall through to download */
    }
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `edits-${slug}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('Downloaded edits.json — apply it with: pnpm apply-json-edits -- --write');
  };

  const reviewRows = useMemo(
    () =>
      Object.entries(edits).map(([id, after]) => ({
        id,
        after,
        before: originals.current.get(id) ?? '',
        shared: elements.current.get(id)?.dataset.eidShared === '1',
      })),
    [edits],
  );

  if (!on) return null;

  return (
    <>
      <div className="eid-bar" role="region" aria-label="Edit mode">
        <span className="eid-dot" aria-hidden />
        <span className="eid-bar-label">Edit mode</span>
        <span className="eid-sep" aria-hidden />
        <span className="eid-meta">
          {matched} editable block{matched === 1 ? '' : 's'}
        </span>
        <span className="eid-sep" aria-hidden />
        <span className={count ? 'eid-count eid-count-live' : 'eid-count'}>
          {count} change{count === 1 ? '' : 's'}
        </span>

        <div className="eid-actions">
          <button type="button" onClick={() => setReview((v) => !v)} disabled={count === 0}>
            {review ? 'Hide' : 'Review'}
          </button>
          <button type="button" onClick={revertAll} disabled={count === 0}>
            Revert all
          </button>
          <button type="button" className="eid-primary" onClick={save} disabled={count === 0}>
            Save
          </button>
          <button type="button" className="eid-close" onClick={() => setOn(false)} aria-label="Leave edit mode">
            ✕
          </button>
        </div>
      </div>

      {status ? (
        <div className="eid-status" role="status">
          {status}
        </div>
      ) : null}

      {review ? (
        <aside className="eid-review" aria-label="Pending changes">
          <h2>Pending changes</h2>
          {reviewRows.map((r) => (
            <div key={r.id} className="eid-row">
              <div className="eid-row-head">
                <code>{r.id}</code>
                {r.shared ? <span className="eid-chip">SHARED · lands in both articles</span> : null}
                <button type="button" onClick={() => revertOne(r.id)}>
                  revert
                </button>
              </div>
              <p className="eid-before">{r.before}</p>
              <p className="eid-after">{r.after}</p>
            </div>
          ))}
        </aside>
      ) : null}
    </>
  );
}
