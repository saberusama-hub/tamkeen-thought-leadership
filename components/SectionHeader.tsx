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
 * Section header.
 *
 *   ── § 04 · The 2024 break
 *   The most consequential year of the
 *   decade was a methodology year, not
 *   an institutional one.
 *
 * Section number marker in dark green (the single page accent point),
 * kicker label in muted gray. No box, no coloured fill, no border-top rule.
 */
export function SectionHeader({ id, number, kicker, title, italic, children }: SectionHeaderProps) {
  return (
    <div id={id} className="mb-10 max-[640px]:mb-7">
      <div className="flex items-center gap-3 mb-4">
        <span aria-hidden className="block h-px w-8 bg-green-light" />
        <div className="font-sans text-[11px] tracking-[2px] uppercase font-semibold text-green">
          § {number}
        </div>
        {kicker ? (
          <>
            <span aria-hidden className="block h-px w-3 bg-green-light/60" />
            <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium">
              {kicker}
            </div>
          </>
        ) : null}
      </div>
      <h2 className="font-serif font-medium text-[40px] leading-[1.15] -tracking-[0.4px] text-ink m-0 max-w-[26ch] max-[760px]:text-[30px]">
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
