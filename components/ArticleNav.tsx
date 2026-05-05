'use client';

import { useEffect, useState } from 'react';
import type { ArticleSection } from '@/types/article';

interface ArticleNavProps {
  sections: ArticleSection[];
}

export function ArticleNav({ sections }: ArticleNavProps) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

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
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-140px 0px -60% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Article sections"
      className="mx-auto max-w-[1180px] px-8 py-2.5 flex gap-7 font-sans text-[11px] uppercase tracking-[1.6px] font-semibold border-t border-rule-soft max-[760px]:gap-[18px] max-[760px]:overflow-x-auto max-[760px]:px-6 max-[760px]:whitespace-nowrap"
    >
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`no-underline border-none py-1 relative hover:bg-transparent ${
            active === s.id ? 'text-tamkeen' : 'text-ink-soft hover:text-tamkeen'
          }`}
        >
          {s.label ?? s.title}
          {active === s.id ? (
            <span className="absolute left-0 right-0 -bottom-[11px] h-[2px] bg-tamkeen" aria-hidden />
          ) : null}
        </a>
      ))}
    </nav>
  );
}
