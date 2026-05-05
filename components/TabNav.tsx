'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SearchBar } from './SearchBar';
import type { SearchEntry } from '@/lib/search';

interface Tab {
  key: string;
  label: string;
  href: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeKey?: string;
  searchEntries: SearchEntry[];
}

export function TabNav({ tabs, activeKey, searchEntries }: TabNavProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0, visible: false });
  const [searchOpen, setSearchOpen] = useState(false);

  useLayoutEffect(() => {
    function measure() {
      if (!navRef.current || !activeKey) {
        setUnderline((u) => ({ ...u, visible: false }));
        return;
      }
      const el = navRef.current.querySelector(`[data-key="${activeKey}"]`) as HTMLElement | null;
      if (!el) {
        setUnderline((u) => ({ ...u, visible: false }));
        return;
      }
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setUnderline({
        left: elRect.left - navRect.left + navRef.current.scrollLeft,
        width: elRect.width,
        visible: true,
      });
    }
    measure();
    window.addEventListener('resize', measure);
    const navEl = navRef.current;
    navEl?.addEventListener('scroll', measure);
    return () => {
      window.removeEventListener('resize', measure);
      navEl?.removeEventListener('scroll', measure);
    };
  }, [activeKey]);

  // close search on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) setSearchOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  return (
    <>
      <nav
        ref={navRef}
        className="mx-auto max-w-[1240px] px-8 flex items-stretch relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Section navigation"
      >
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            data-key={t.key}
            className={`font-sans text-[11px] tracking-[1.6px] uppercase font-semibold py-3.5 mr-7 last:mr-0 whitespace-nowrap relative transition-colors duration-[180ms] ${
              activeKey === t.key ? 'text-tamkeen' : 'text-ink-mid hover:text-tamkeen'
            }`}
          >
            {t.label}
          </Link>
        ))}

        <button
          type="button"
          className="ml-auto py-3.5 flex items-center gap-2 text-ink-mid hover:text-tamkeen font-sans text-[11px] tracking-[1.6px] uppercase font-semibold transition-colors duration-[180ms]"
          onClick={() => setSearchOpen((s) => !s)}
          aria-expanded={searchOpen}
          aria-controls="masthead-search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-[13px] h-[13px]" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.5-4.5" />
          </svg>
          {searchOpen ? 'Close' : 'Search'}
        </button>

        <span
          aria-hidden
          className="absolute bottom-0 h-[2px] bg-tamkeen pointer-events-none"
          style={{
            left: underline.left,
            width: underline.width,
            opacity: underline.visible ? 1 : 0,
            transition:
              'left 0.32s cubic-bezier(0.65, 0, 0.35, 1), width 0.32s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.18s',
          }}
        />
      </nav>

      <SearchBar
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        entries={searchEntries}
      />
    </>
  );
}
