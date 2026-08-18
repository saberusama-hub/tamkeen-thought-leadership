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
 * Readers are never affected. The article page stays statically prerendered —
 * the session is checked only once edit mode is switched on, so an ordinary
 * visit makes no extra request and its HTML contains no trace of any of this.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ClientBlock {
  id: string;
  kind: string;
  path: string;
  display: string;
  shared: boolean;
  minor: boolean;
  /** False for blocks carrying markup a browser edit cannot round-trip. */
  editable?: boolean;
}

interface Props {
  slug: string;
}

const LS_EDITS = (slug: string) => `theindex:edits:${slug}`;
const LS_ON = 'theindex:edit-mode';
const LS_SEEN_INTRO = 'theindex:edit-intro';

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

function readEl(el: HTMLElement): string {
  return serialise(el, el.dataset.eidMarkup === '1');
}

function writeEl(el: HTMLElement, text: string): void {
  if (el.dataset.eidMarkup === '1') {
    el.innerHTML = text.replace(/&/g, '&amp;').replace(/<(?!\/?(?:strong|em)>)/g, '&lt;');
  } else {
    el.textContent = text;
  }
}

/** Strip inline markup for anything shown back to the editor as plain prose. */
function plain(s: string): string {
  return s.replace(/<[^>]+>/g, '');
}

type Phase = 'editing' | 'confirming' | 'publishing' | 'published' | 'error';

export function EditLayer({ slug }: Props) {
  const [on, setOn] = useState(false);
  const [authorised, setAuthorised] = useState<boolean | null>(null);
  const [blocks, setBlocks] = useState<ClientBlock[] | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [matched, setMatched] = useState(0);
  const [review, setReview] = useState(false);
  const [phase, setPhase] = useState<Phase>('editing');
  const [message, setMessage] = useState<string | null>(null);
  const [intro, setIntro] = useState(false);
  const originals = useRef(new Map<string, string>());
  const elements = useRef(new Map<string, HTMLElement>());

  // ── Activation ────────────────────────────────────────────────────────────
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    if (url.get('edit') === '1' || localStorage.getItem(LS_ON) === '1') setOn(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.editMode = on ? 'on' : '';
    if (on) localStorage.setItem(LS_ON, '1');
    else localStorage.removeItem(LS_ON);
  }, [on]);

  // Confirm the session only once editing is requested, so readers never pay
  // for this and the page can stay statically prerendered.
  useEffect(() => {
    if (!on || authorised !== null) return;
    fetch('/api/editorial/session')
      .then((r) => r.json())
      .then((d: { signedIn: boolean }) => {
        setAuthorised(d.signedIn);
        if (!d.signedIn) {
          window.location.href = '/edit';
          return;
        }
        if (!localStorage.getItem(LS_SEEN_INTRO)) setIntro(true);
      })
      .catch(() => setAuthorised(false));
  }, [on, authorised]);

  // ── Restore unpublished work from a previous sitting ──────────────────────
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

  // Don't let unpublished work be closed away silently.
  useEffect(() => {
    const n = Object.keys(edits).length;
    if (!on || n === 0 || phase === 'published') return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [on, edits, phase]);

  // ── Manifest, fetched only in edit mode ───────────────────────────────────
  useEffect(() => {
    if (!on || !authorised || blocks) return;
    let cancelled = false;
    fetch('/editorial-manifest.json')
      .then((r) => r.json())
      .then((d: { pages: Record<string, ClientBlock[]> }) => {
        if (!cancelled) setBlocks(d.pages[slug] ?? []);
      })
      .catch(() => setMessage('Could not load the page for editing. Try reloading.'));
    return () => {
      cancelled = true;
    };
  }, [on, authorised, blocks, slug]);

  // ── Match blocks onto DOM elements ────────────────────────────────────────
  useEffect(() => {
    if (!on || !blocks) return;
    const root = document.querySelector('main');
    if (!root) return;

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
    const tagged: HTMLElement[] = [];
    let hits = 0;
    elements.current.clear();
    originals.current.clear();

    for (const b of blocks) {
      if (b.editable === false) continue;
      const key = norm(b.display);
      const cands = index.get(key);
      if (!cands) continue;
      // Deepest element is the tightest wrapper around exactly this text; ties
      // break by document order, and each element is claimed once, so repeated
      // strings map to successive occurrences.
      const free = cands.filter((c) => !used.has(c.el));
      if (free.length === 0) continue;
      const maxDepth = Math.max(...free.map((c) => c.depth));
      const pick = free.filter((c) => c.depth === maxDepth).sort((a, z) => a.order - z.order)[0];
      used.add(pick.el);
      tagged.push(pick.el);
      pick.el.dataset.eid = b.id;
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
        delete el.dataset.eidShared;
        delete el.dataset.eidMarkup;
        el.removeAttribute('contenteditable');
        el.classList.remove('eid-dirty');
      }
    };
  }, [on, blocks]);

  // ── Re-apply stored edits once matching has run ───────────────────────────
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
    if (!on || matched === 0 || phase !== 'editing') return;

    const target = (e: Event): HTMLElement | null =>
      ((e.target as HTMLElement | null)?.closest?.('[data-eid]') as HTMLElement) ?? null;

    const onClick = (e: MouseEvent) => {
      const el = target(e);
      if (!el) return;
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
        writeEl(el, edits[id] ?? originals.current.get(id) ?? '');
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
  }, [on, matched, commit, edits, phase]);

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

  const publish = async () => {
    setPhase('publishing');
    setMessage(null);
    try {
      const res = await fetch('/api/editorial/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ edits }),
      });
      const d = (await res.json()) as {
        error?: string;
        applied?: number;
        rejected?: string[];
        mode?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          setMessage('Your session has expired. Sign in again to publish.');
          setPhase('error');
          setTimeout(() => (window.location.href = '/edit'), 2500);
          return;
        }
        setMessage(d.error ?? 'Could not publish. Nothing has been changed on the site.');
        setPhase('error');
        return;
      }
      setEdits({});
      localStorage.removeItem(LS_EDITS(slug));
      setReview(false);
      setPhase('published');
      const n = d.applied ?? 0;
      setMessage(
        `Published ${n} change${n === 1 ? '' : 's'}.` +
          (d.mode === 'github'
            ? ' The live site updates in about a minute.'
            : ' Written to the local files.') +
          (d.rejected?.length ? ` ${d.rejected.length} could not be applied.` : ''),
      );
    } catch {
      setMessage('Could not reach the site. Nothing has been changed.');
      setPhase('error');
    }
  };

  const rows = useMemo(
    () =>
      Object.entries(edits).map(([id, after]) => ({
        id,
        after,
        before: originals.current.get(id) ?? '',
        shared: elements.current.get(id)?.dataset.eidShared === '1',
      })),
    [edits],
  );

  if (!on || authorised === false) return null;

  return (
    <>
      <div className="eid-bar" role="region" aria-label="Editing">
        <span className="eid-dot" aria-hidden />
        <span className="eid-bar-label">Editing this page</span>
        <span className="eid-sep" aria-hidden />
        <span className={count ? 'eid-count eid-count-live' : 'eid-count'}>
          {count === 0
            ? 'No changes yet'
            : `${count} change${count === 1 ? '' : 's'} not yet published`}
        </span>

        <div className="eid-actions">
          <button type="button" onClick={() => setReview((v) => !v)} disabled={count === 0}>
            {review ? 'Hide changes' : 'See changes'}
          </button>
          <button type="button" onClick={revertAll} disabled={count === 0}>
            Undo all
          </button>
          <button
            type="button"
            className="eid-primary"
            onClick={() => setPhase('confirming')}
            disabled={count === 0 || phase === 'publishing'}
          >
            {phase === 'publishing' ? 'Publishing…' : 'Publish'}
          </button>
          <a className="eid-exit" href="/edit">
            Done
          </a>
        </div>
      </div>

      {message ? (
        <div className={phase === 'error' ? 'eid-status eid-status-bad' : 'eid-status'} role="status">
          {message}
        </div>
      ) : null}

      {intro ? (
        <div className="eid-modal-wrap" role="dialog" aria-modal="true" aria-label="How editing works">
          <div className="eid-modal">
            <h2>You can edit this page</h2>
            <ol>
              <li>Click any piece of text and type over it.</li>
              <li>
                Nothing is public until you press <strong>Publish</strong>.
              </li>
              <li>Your changes are kept if you close the page and come back.</li>
            </ol>
            <button
              type="button"
              className="eid-primary"
              onClick={() => {
                localStorage.setItem(LS_SEEN_INTRO, '1');
                setIntro(false);
              }}
            >
              Start editing
            </button>
          </div>
        </div>
      ) : null}

      {phase === 'confirming' ? (
        <div className="eid-modal-wrap" role="dialog" aria-modal="true" aria-label="Confirm publishing">
          <div className="eid-modal">
            <h2>
              Publish {count} change{count === 1 ? '' : 's'}?
            </h2>
            <p>
              This updates the public website. Everyone will see it about a minute after you
              publish.
            </p>
            {rows.some((r) => r.shared) ? (
              <p className="eid-note">
                Some of these lines also appear in the other article. Publishing updates both, so
                the two stay consistent.
              </p>
            ) : null}
            <div className="eid-modal-actions">
              <button type="button" onClick={() => setPhase('editing')}>
                Not yet
              </button>
              <button type="button" className="eid-primary" onClick={publish}>
                Yes, publish
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {review ? (
        <aside className="eid-review" aria-label="Your changes">
          <h2>Your changes</h2>
          {rows.map((r) => (
            <div key={r.id} className="eid-row">
              <div className="eid-row-head">
                {r.shared ? (
                  <span className="eid-chip">Also appears in the other article</span>
                ) : (
                  <span className="eid-chip eid-chip-quiet">Changed</span>
                )}
                <button type="button" onClick={() => revertOne(r.id)}>
                  undo
                </button>
              </div>
              <p className="eid-before">{plain(r.before)}</p>
              <p className="eid-after">{plain(r.after)}</p>
            </div>
          ))}
        </aside>
      ) : null}
    </>
  );
}
