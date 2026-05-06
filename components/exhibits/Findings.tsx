'use client';

import { useEffect, useRef, useState } from 'react';

interface Finding {
  title: string;
  body: string;
}

interface FindingsProps {
  items: Finding[];
}

/**
 * Numbered findings, two columns on desktop, single on mobile.
 * No cards, no borders, single hairline between items inside each column.
 * Each finding fades in with a small stagger as the panel enters the viewport.
 */
export function Findings({ items }: FindingsProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-stagger my-12 grid grid-cols-2 gap-x-12 gap-y-10 max-[880px]:grid-cols-1 max-[880px]:gap-y-8${
        visible ? ' is-visible' : ''
      }`}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{ '--i': i } as React.CSSProperties}
          className="pt-6 border-t border-green/25 first:pt-0 first:border-t-0 max-[880px]:[&:nth-child(2)]:border-t max-[880px]:[&:nth-child(2)]:pt-6"
        >
          <div className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase text-green font-semibold mb-2">
            Finding {String(i + 1).padStart(2, '0')}
          </div>
          <h4 className="m-0 mb-2 font-serif text-[19px] font-semibold normal-case tracking-[-0.1px] text-green leading-[1.3]">
            {item.title}
          </h4>
          <p className="m-0 text-[15px] leading-[1.55] text-ink/85 max-w-none">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
