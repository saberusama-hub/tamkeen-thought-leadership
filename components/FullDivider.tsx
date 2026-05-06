import type { ReactNode } from 'react';

interface FullDividerProps {
  children: ReactNode;
}

/**
 * Section break used between the executive brief and the full report.
 * Hairline green rule, small uppercase label, that's it. Sits inside the
 * 820px article column.
 */
export function FullDivider({ children }: FullDividerProps) {
  return (
    <div className="my-12">
      <div className="text-center font-sans text-[11px] tracking-[1.8px] uppercase font-semibold text-green border-y border-green/30 py-4">
        {children}
      </div>
    </div>
  );
}
