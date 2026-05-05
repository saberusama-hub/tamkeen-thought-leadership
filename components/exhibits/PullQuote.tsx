import type { ReactNode } from 'react';

interface PullQuoteProps {
  children: ReactNode;
  cite?: string;
  dark?: boolean;
}

export function PullQuote({ children, cite, dark = false }: PullQuoteProps) {
  return (
    <figure
      className={`my-[60px] mx-auto max-w-[920px] py-[30px] text-center border-y ${
        dark ? 'border-paper/30' : 'border-tamkeen'
      }`}
    >
      <blockquote
        className={`font-serif italic text-[32px] leading-[1.32] font-normal -tracking-[0.3px] m-0 mb-4 max-[760px]:text-[24px] ${
          dark ? 'text-paper' : 'text-tamkeen'
        }`}
      >
        {children}
      </blockquote>
      {cite ? (
        <figcaption
          className={`not-italic font-sans text-[10.5px] tracking-[1.8px] uppercase font-semibold ${
            dark ? 'text-paper/65' : 'text-ink-soft'
          }`}
        >
          {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}
