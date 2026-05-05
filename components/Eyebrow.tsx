import type { ReactNode } from 'react';

interface EyebrowProps {
  children?: ReactNode;
  number?: string;
  parts?: string[];
  className?: string;
  animate?: boolean;
}

/**
 * Eyebrow with the magazine pattern: [mono number] [hairline] [text] [hairline] [text]
 * Usage A — single label (legacy): <Eyebrow>The Education Series · No. 01</Eyebrow>
 * Usage B — magazine: <Eyebrow number="No. 01" parts={["Rankings", "The lead"]} />
 */
export function Eyebrow({ children, number, parts, className = '', animate = false }: EyebrowProps) {
  const animClass = animate ? 'anim-up' : '';
  const base = `flex items-center gap-3 font-sans text-[10.5px] tracking-[2.4px] uppercase font-bold text-accent-deep mb-[22px] ${animClass} ${className}`;

  if (number || parts) {
    return (
      <div className={base}>
        {number ? (
          <span className="font-mono font-semibold text-tamkeen tracking-normal">{number}</span>
        ) : null}
        {(parts ?? []).map((p, i) => (
          <span key={i} className="flex items-center gap-3">
            <span aria-hidden className="block w-6 h-px bg-accent" />
            {p}
          </span>
        ))}
      </div>
    );
  }

  // Legacy single-label pattern (still used in About / 404 / category empty states)
  return (
    <div
      className={`flex items-center gap-3.5 mb-6 font-sans text-[11px] tracking-[2.2px] uppercase text-tamkeen font-bold ${className}`}
    >
      <span aria-hidden className="block h-px w-[30px] flex-none bg-tamkeen" />
      <span>{children}</span>
      <span aria-hidden className="block h-px flex-1 bg-tamkeen" />
    </div>
  );
}
