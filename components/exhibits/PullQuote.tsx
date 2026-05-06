import type { ReactNode } from 'react';

interface PullQuoteProps {
  children: ReactNode;
  cite?: string;
  /** Retained for backward compatibility, ignored visually. */
  dark?: boolean;
}

/**
 * Pull quote: indented from the left with a vertical green-light rule.
 * On tablet (≤880px) the indent collapses so the quote aligns with body
 * copy rather than floating off to the right.
 */
export function PullQuote({ children, cite }: PullQuoteProps) {
  return (
    <figure className="my-14 ml-8 pl-6 border-l-2 border-green-light max-w-[44ch] max-[880px]:ml-0 max-[880px]:max-w-none">
      <blockquote className="font-serif italic text-[28px] leading-[1.3] text-green m-0 -tracking-[0.2px] max-[640px]:text-[22px]">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="not-italic font-sans text-[11px] tracking-[1.5px] uppercase text-mute font-medium mt-4">
          {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}
