import type { ReactNode } from 'react';

interface ExhibitProps {
  number: string;
  title: string;
  sub?: string;
  source?: string;
  /** Retained for backward compatibility, ignored visually. */
  numberTone?: 'tamkeen' | 'copper';
  /** Retained for backward compatibility, ignored visually. */
  dark?: boolean;
  children: ReactNode;
}

/**
 * Exhibit wrapper. No card. No background. No top border. The chart sits
 * in the flow, prefaced by a small tracked sans label, an italic serif
 * caption, and concluded by a muted source note.
 */
export function Exhibit({ number, title, sub, source, children }: ExhibitProps) {
  return (
    <figure className="my-12 max-w-none">
      <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium mb-2">
        {number}
      </div>
      <h3 className="font-serif text-[22px] font-medium leading-[1.3] -tracking-[0.2px] m-0 mb-1.5 text-green">
        {title}
      </h3>
      {sub ? (
        <p className="font-serif italic text-[16px] text-mute m-0 mb-7 max-w-[60ch]">{sub}</p>
      ) : null}
      <div className="my-2">{children}</div>
      {source ? (
        <figcaption className="font-sans text-[11.5px] text-mute mt-5 leading-[1.55] max-w-[68ch]">
          {source}
        </figcaption>
      ) : null}
    </figure>
  );
}
