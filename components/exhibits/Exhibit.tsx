import type { ReactNode } from 'react';

interface ExhibitProps {
  number: string;
  title: string;
  sub?: string;
  source?: string;
  numberTone?: 'tamkeen' | 'copper';
  dark?: boolean;
  children: ReactNode;
}

export function Exhibit({
  number,
  title,
  sub,
  source,
  numberTone = 'tamkeen',
  dark = false,
  children,
}: ExhibitProps) {
  return (
    <figure
      className={`my-11 mb-9 pt-[30px] pb-[22px] border-t-2 border-b ${
        dark ? 'border-tamkeen-light border-b-paper/20' : 'border-tamkeen border-b-rule'
      }`}
    >
      <div
        className={`font-mono text-[10.5px] tracking-[2px] uppercase font-bold mb-1.5 ${
          numberTone === 'copper' ? 'text-copper-deep' : dark ? 'text-tamkeen-light' : 'text-tamkeen'
        }`}
      >
        {number}
      </div>
      <h3
        className={`font-serif text-[23px] font-semibold m-0 mb-1 leading-[1.25] -tracking-[0.3px] ${
          dark ? 'text-paper' : 'text-tamkeen'
        }`}
      >
        {title}
      </h3>
      {sub ? (
        <p
          className={`text-sm m-0 mb-6 italic font-serif ${dark ? 'text-paper/70' : 'text-ink-mid'}`}
        >
          {sub}
        </p>
      ) : null}
      <div>{children}</div>
      {source ? (
        <figcaption
          className={`text-[11.5px] mt-[18px] pt-3.5 border-t leading-[1.55] font-sans not-italic ${
            dark ? 'text-paper/55 border-paper/20' : 'text-ink-soft border-rule-soft'
          }`}
        >
          {source}
        </figcaption>
      ) : null}
    </figure>
  );
}
