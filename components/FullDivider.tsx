import type { ReactNode } from 'react';

interface FullDividerProps {
  children: ReactNode;
}

export function FullDivider({ children }: FullDividerProps) {
  return (
    <div className="bg-tamkeen text-paper px-8 py-3.5 text-center font-sans text-[11px] tracking-[2.5px] uppercase font-bold">
      {children}
    </div>
  );
}
