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
 * If the user prefers reduced motion (or JS is disabled), the chart renders
 * fully unclipped from the start.
 */
export function ScrollReveal2DChart({
  children,
  pinTop = 0.6,
  ariaLabel,
}: ScrollReveal2DChartProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const onChange = () => setReduced(m.matches);
    m.addEventListener?.('change', onChange);
    return () => m.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    function compute() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // Map: when chart top hits viewport bottom → progress = 0
      //      when chart bottom hits pinTop * viewport height → progress = 1
      const start = vh; // viewport bottom
      const end = vh * pinTop;
      const visiblePoint = rect.top; // px from top of viewport to top of chart
      // We want progress 0 when visiblePoint === start, 1 when visiblePoint === -rect.height + end
      const span = start - end + rect.height;
      const traveled = start - visiblePoint;
      const p = Math.min(1, Math.max(0, traveled / span));
      setProgress(p);
    }
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [pinTop, reduced]);

  const insetRight = (1 - progress) * 100;
  const clip = `inset(0 ${insetRight}% 0 0)`;

  return (
    <div ref={ref} aria-label={ariaLabel} className="relative">
      <div
        style={{
          clipPath: reduced ? 'none' : clip,
          WebkitClipPath: reduced ? 'none' : clip,
          transition: reduced ? 'none' : 'clip-path 0.06s linear',
        }}
      >
        {children}
      </div>
    </div>
  );
}
