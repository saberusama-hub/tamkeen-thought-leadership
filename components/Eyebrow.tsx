import type { ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = '' }: EyebrowProps) {
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
