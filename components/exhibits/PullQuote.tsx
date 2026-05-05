import type { ReactNode } from 'react';

interface PullQuoteProps {
  children: ReactNode;
  cite?: string;
  /** Retained for backward compatibility, ignored visually. */
  dark?: boolean;
}

/**
 * Asterisk-style pull quote. Indented from the left, larger italic serif,
 * no quote marks, optional small attribution underneath. No top/bottom rules.
 */
export function PullQuote({ children, cite }: PullQuoteProps) {
  return (
    <figure className="my-14 ml-8 pl-6 border-l border-green max-w-[40ch] max-[640px]:ml-0">
      <blockquote className="font-serif italic text-[28px] leading-[1.3] text-ink m-0 -tracking-[0.2px] max-[640px]:text-[22px]">
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
