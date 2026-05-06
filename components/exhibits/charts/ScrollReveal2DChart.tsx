'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollReveal2DChartProps {
  children: ReactNode;
  /** When the chart is fully past this fraction of viewport height, reveal is 100%. */
  pinTop?: number;
  /** Aria description used as a fallback for screen readers and reduced-motion users. */
  ariaLabel?: string;
}

/**
 * Wraps a static SVG chart and reveals it left-to-right as the user scrolls
 * through it. Uses scroll position relative to the chart's bounding box to
 * compute a 0–1 progress, then drives a CSS clip-path inset.
 *
 * SSR / no-JS: the clip is not applied, so the chart renders fully visible.
 * Once mounted on the client, the first measurement is taken before the
 * clip is enabled — no flash from "fully revealed" to "hidden" on hydration.
 */
export function ScrollReveal2DChart({
  children,
  pinTop = 0.6,
  ariaLabel,
}: ScrollReveal2DChartProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(1);
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const onChange = () => setReduced(m.matches);
    m.addEventListener?.('change', onChange);
    return () => m.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    function compute() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh;
      const end = vh * pinTop;
      const visiblePoint = rect.top;
      const span = start - end + rect.height;
      const traveled = start - visiblePoint;
      const p = Math.min(1, Math.max(0, traveled / span));
      setProgress(p);
    }
    if (reduced) {
      setProgress(1);
      setMounted(true);
      return;
    }
    compute();
    setMounted(true);
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [pinTop, reduced]);

  const applyClip = mounted && !reduced;
  const insetRight = (1 - progress) * 100;
  const clip = `inset(0 ${insetRight}% 0 0)`;

  return (
    <div ref={ref} aria-label={ariaLabel} className="relative">
      <div
        style={{
          clipPath: applyClip ? clip : 'none',
          WebkitClipPath: applyClip ? clip : 'none',
          transition: applyClip ? 'clip-path 0.06s linear' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
