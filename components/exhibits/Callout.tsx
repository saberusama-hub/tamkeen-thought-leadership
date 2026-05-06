import type { ReactNode } from 'react';

interface CalloutProps {
  /** Small uppercase label rendered above the body. e.g. "Five-minute reading guide". */
  label?: string;
  /** Body of the callout. Plain prose is fine; renders in italic serif by default. */
  children: ReactNode;
}

/**
 * Callout: an italic mid-article emphasis block. No card, no fill. Vertical
 * green-light rule on the left, faint green-pale wash, optional label on top.
 * Used for "five-minute reading guide", "counter to consensus", and similar
 * editorial pull-outs that the prototype reference articles use.
 */
export function Callout({ label, children }: CalloutProps) {
  return (
    <aside className="my-12 ml-0 pl-6 py-3 border-l-2 border-green-light bg-green-pale/30 max-[640px]:pl-5">
      {label ? (
        <div className="ui-caps font-sans text-[10.5px] tracking-[1.8px] uppercase font-semibold text-green mb-2">
          {label}
        </div>
      ) : null}
      <div className="font-serif italic text-[19px] leading-[1.5] text-ink/90 max-w-[60ch] m-0 max-[640px]:text-[17px]">
        {children}
      </div>
    </aside>
  );
}
