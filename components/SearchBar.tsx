'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SearchEntry } from '@/lib/search';

interface SearchBarProps {
  open: boolean;
  onClose: () => void;
  entries: SearchEntry[];
}

export function SearchBar({ open, onClose, entries }: SearchBarProps) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setQ('');
  }, [open]);

  const filtered = useMemo(() => {
    if (!q.trim()) return entries;
    const needle = q.toLowerCase();
    return entries.filter((r) =>
      [
        r.type === 'article' ? r.title : r.title,
        r.type === 'article' ? r.blob : r.blob,
        r.categoryLabel,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [q, entries]);

  const articles = filtered.filter((r): r is Extract<SearchEntry, { type: 'article' }> => r.type === 'article');
  const forthcoming = filtered.filter((r): r is Extract<SearchEntry, { type: 'forthcoming' }> => r.type === 'forthcoming');

  return (
    <div
      id="masthead-search"
      aria-hidden={!open}
      className="bg-paper border-b border-rule-soft overflow-hidden"
      style={{
        maxHeight: open ? '80vh' : 0,
        transition: 'max-height 0.32s cubic-bezier(0.65,0,0.35,1)',
      }}
    >
      <div className="mx-auto max-w-[1240px] px-8 flex items-center gap-[18px]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search articles, sections, topics…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 font-serif text-[28px] italic font-light bg-transparent outline-none border-none text-ink py-[22px] tracking-[-0.3px] placeholder:text-ink-soft placeholder:opacity-60"
          aria-label="Search articles, sections, topics"
        />
        <button
          type="button"
          onClick={onClose}
          className="font-sans text-[10px] tracking-[1.6px] uppercase font-semibold text-ink-soft py-2 px-3 border border-rule rounded-none transition-all duration-[180ms] hover:border-tamkeen hover:text-tamkeen"
        >
          Esc
        </button>
      </div>

      {open ? (
        <div className="mx-auto max-w-[1240px] px-8 pb-8 grid grid-cols-2 gap-x-12 gap-y-3 max-[760px]:grid-cols-1">
          <div>
            <div className="font-sans text-[10px] tracking-[1.6px] uppercase font-bold text-ink-soft py-2.5 pb-1.5 border-b border-tamkeen">
              Published
            </div>
            {articles.length === 0 ? (
              <div className="py-6 font-serif text-[17px] italic text-ink-soft">
                Nothing in the archive matches.
              </div>
            ) : (
              articles.map((r) => (
                <Link
                  key={r.slug}
                  href={`/articles/${r.slug}`}
                  onClick={onClose}
                  className="py-3.5 border-t border-rule-soft grid grid-cols-[auto_1fr_auto] gap-4 items-baseline group"
                >
                  <span className="font-sans text-[9.5px] tracking-[1.6px] uppercase font-bold text-accent-deep min-w-[130px]">
                    {r.categoryLabel}
                  </span>
                  <span className="font-serif text-[17px] text-tamkeen leading-[1.35] transition-colors duration-[180ms] group-hover:text-accent-deep">
                    {r.title}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink-soft tabular-nums">
                    {r.minutes}′ · {r.date}
                  </span>
                </Link>
              ))
            )}
          </div>
          <div>
            <div className="font-sans text-[10px] tracking-[1.6px] uppercase font-bold text-ink-soft py-2.5 pb-1.5 border-b border-tamkeen">
              In other categories
            </div>
            {forthcoming.length === 0 ? (
              <div className="py-6 font-serif text-[17px] italic text-ink-soft">—</div>
            ) : (
              forthcoming.map((r) => (
                <Link
                  key={r.categoryKey}
                  href={`/category/${r.categoryKey}`}
                  onClick={onClose}
                  className="py-3.5 border-t border-rule-soft grid grid-cols-[auto_1fr_auto] gap-4 items-baseline group"
                >
                  <span className="font-sans text-[9.5px] tracking-[1.6px] uppercase font-bold text-accent-deep min-w-[130px]">
                    {r.categoryLabel}
                  </span>
                  <span className="font-serif text-[17px] italic text-ink-soft leading-[1.35] transition-colors duration-[180ms] group-hover:text-accent-deep">
                    {r.title}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink-soft">—</span>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
