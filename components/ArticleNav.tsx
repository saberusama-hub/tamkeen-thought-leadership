'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ArticleSection } from '@/types/article';

interface ArticleNavProps {
  sections: ArticleSection[];
}

/**
 * Intra-article TOC. Sticky underneath the masthead. The active section is
 * highlighted by a hairline underline that slides as you scroll. Inter sans,
 * tracked, muted.
 */
export function ArticleNav({ sections }: ArticleNavProps) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);
  const navRef = useRef<HTMLElement | null>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    if (sections.length === 0) return;
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-160px 0px -60% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  useLayoutEffect(() => {
    function measure() {
      if (!navRef.current || !active) {
        setUnderline((u) => ({ ...u, visible: false }));
        return;
      }
      const el = navRef.current.querySelector(`[data-id="${active}"]`) as HTMLElement | null;
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
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="Article sections"
      className="border-b border-green/25 bg-green/[0.05]"
    >
      <div className="mx-auto max-w-[1240px] px-8 flex items-stretch relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[640px]:px-5">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-id={s.id}
            className={`font-sans text-[11px] tracking-[1.5px] uppercase font-medium py-3.5 mr-7 last:mr-0 whitespace-nowrap transition-colors duration-150 border-none ${
              active === s.id ? 'text-green' : 'text-mute hover:text-green'
            }`}
          >
            {s.label ?? s.title}
          </a>
        ))}
        <span
          aria-hidden
          className="absolute bottom-0 h-[2px] bg-green pointer-events-none"
          style={{
            left: underline.left,
            width: underline.width,
            opacity: underline.visible ? 1 : 0,
            transition: underline.visible
              ? 'left 0.32s cubic-bezier(0.65, 0, 0.35, 1), width 0.32s cubic-bezier(0.65, 0, 0.35, 1)'
              : 'none',
          }}
        />
      </div>
    </nav>
  );
}
