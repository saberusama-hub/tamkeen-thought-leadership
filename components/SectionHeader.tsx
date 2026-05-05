import type { ReactNode } from 'react';

interface SectionHeaderProps {
  id?: string;
  number: string;
  kicker?: string;
  title: string;
  italic?: string;
  children?: ReactNode;
  /** @deprecated dark sections were collapsed into a single neutral surface. */
  dark?: boolean;
}

/**
 * Section header in the new minimalist system.
 *
 *   § 04
 *   The 2024 break                       <- optional kicker, small sans, muted
 *   The most consequential year of the
 *   decade was a <em>methodology</em>    <- italic emphasis, no colour
 *   year, not an institutional one.
 *
 * No box. No coloured fill. No border-top rule. The marker sits above the h2
 * in tracked-out muted Inter.
 */
export function SectionHeader({ id, number, kicker, title, italic, children }: SectionHeaderProps) {
  return (
    <div id={id} className="mb-10 max-[640px]:mb-7">
      <div className="font-sans text-[11px] tracking-[2px] uppercase text-mute mb-3 font-medium">
        § {number}
        {kicker ? (
          <>
            <span className="opacity-60 mx-2.5">·</span>
            {kicker}
          </>
        ) : null}
      </div>
      <h2 className="font-serif font-medium text-[42px] leading-[1.15] -tracking-[0.4px] text-ink m-0 max-w-[30ch] max-[760px]:text-[32px]">
        {renderTitleParts(title, italic)}
      </h2>
      {children}
    </div>
  );
}

function renderTitleParts(title: string, italic?: string) {
  if (!italic) return title;
  const idx = title.toLowerCase().indexOf(italic.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic font-medium">{title.slice(idx, idx + italic.length)}</em>
      {title.slice(idx + italic.length)}
    </>
  );
}
