'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Element tag to render. Defaults to a generic <div>; pass 'h2' / 'figure'
   *  etc. when wrapping semantic blocks. */
  as?: ElementType;
  /** Extra class names applied to the wrapper. */
  className?: string;
  /** When the wrapper enters the viewport more than this fraction of itself,
   *  it reveals. Default 0.15. */
  threshold?: number;
  /** A small delay (ms) before triggering the reveal. Use to stagger sibling
   *  reveals. Default 0. */
  delayMs?: number;
}

/**
 * Reveals its children with a subtle opacity + translate when they enter the
 * viewport. Once revealed, stays revealed (does not toggle on exit). Honours
 * the user's prefers-reduced-motion preference (the .reveal class itself
 * short-circuits via the global stylesheet).
 *
 * Usage:
 *   <ScrollReveal as="h2" className="text-green text-[42px]">…</ScrollReveal>
 *   <ScrollReveal>{children}</ScrollReveal>
 */
export function ScrollReveal({
  children,
  as,
  className = '',
  threshold = 0.15,
  delayMs = 0,
}: ScrollRevealProps) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (delayMs > 0) {
            const t = setTimeout(() => setVisible(true), delayMs);
            return () => clearTimeout(t);
          }
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, delayMs]);

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </Tag>
  );
}
