interface HandoffProps {
  href: string;
  label?: string;
  children: string;
}

/**
 * "Continue reading" deep link, used at the end of the executive brief.
 * Pure typography, no boxes.
 */
export function Handoff({ href, label = 'Continue Reading', children }: HandoffProps) {
  return (
    <div className="text-center mx-auto mt-14 pt-10 border-t border-rule max-w-[600px]">
      <div className="font-sans text-[11px] tracking-[1.8px] uppercase text-mute mb-4 font-medium">
        {label}
      </div>
      <a
        href={href}
        className="inline-flex items-center gap-1.5 font-serif text-[22px] italic text-green hover:text-green-deep transition-colors no-underline border-none"
      >
        {children}
        <span aria-hidden className="not-italic">↓</span>
      </a>
    </div>
  );
}
