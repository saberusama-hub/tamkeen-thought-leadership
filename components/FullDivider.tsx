import type { ReactNode } from 'react';

interface FullDividerProps {
  children: ReactNode;
}

/**
 * Section break used between the executive brief and the full report.
 * Hairline rule, small uppercase label, that's it.
 */
export function FullDivider({ children }: FullDividerProps) {
  return (
    <div className="mx-auto max-w-[1240px] px-8 py-10 my-6 max-[640px]:px-5 max-[640px]:py-8">
      <div className="text-center font-sans text-[11px] tracking-[1.8px] uppercase font-medium text-mute border-y border-rule py-4">
        {children}
      </div>
    </div>
  );
}
