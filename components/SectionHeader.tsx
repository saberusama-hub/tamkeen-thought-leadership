import type { ReactNode } from 'react';

interface SectionHeaderProps {
  id?: string;
  number: string;
  kicker?: string;
  title: string;
  italic?: string;
  dark?: boolean;
  children?: ReactNode;
}

function renderTitleParts(title: string, italic?: string): ReactNode {
  if (!italic) return title;
  const idx = title.toLowerCase().indexOf(italic.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic text-copper-deep font-medium">{title.slice(idx, idx + italic.length)}</em>
      {title.slice(idx + italic.length)}
    </>
  );
}

export function SectionHeader({ id, number, kicker, title, italic, dark = false, children }: SectionHeaderProps) {
  return (
    <div
      id={id}
      className={`flex items-start gap-7 mb-9 pb-[18px] border-b ${dark ? 'border-paper/20' : 'border-rule'} max-[760px]:flex-col max-[760px]:gap-3.5`}
    >
      <div
        className={`flex-none basis-[90px] font-mono text-[11px] tracking-[1.5px] font-semibold uppercase pt-3.5 border-t-2 ${
          dark ? 'text-tamkeen-light border-tamkeen-light' : 'text-tamkeen border-tamkeen'
        } max-[760px]:pt-2.5`}
      >
        § {number}
      </div>
      <div className="flex-1">
        {kicker ? (
          <div
            className={`font-sans text-[11px] tracking-[1.8px] uppercase font-bold mb-2.5 ${
              dark ? 'text-tamkeen-light' : 'text-ink-soft'
            }`}
          >
            {kicker}
          </div>
        ) : null}
        <h2
          className={`font-serif font-medium text-[42px] leading-[1.18] -tracking-[0.4px] m-0 mb-3.5 max-w-[920px] max-[760px]:text-[30px] ${
            dark ? 'text-paper' : 'text-tamkeen'
          }`}
        >
          {renderTitleParts(title, italic)}
        </h2>
        {children}
      </div>
    </div>
  );
}
