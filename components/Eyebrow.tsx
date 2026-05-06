import type { ReactNode } from 'react';

interface EyebrowProps {
  children?: ReactNode;
  parts?: string[];
  className?: string;
}

/**
 * Small tracked-out muted label. Used on the about / 404 pages.
 */
export function Eyebrow({ children, parts, className = '' }: EyebrowProps) {
  const text = children ?? parts?.join(' · ');
  return (
    <div
      className={`font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium mb-6 ${className}`}
    >
      {text}
    </div>
  );
}
