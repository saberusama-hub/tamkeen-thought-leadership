interface HandoffProps {
  href: string;
  label?: string;
  children: string;
}

export function Handoff({ href, label = 'Continue Reading', children }: HandoffProps) {
  return (
    <div className="text-center mx-auto mt-14 mb-0 pt-10 border-t border-rule max-w-[600px]">
      <div className="font-sans text-[10.5px] tracking-[2.2px] uppercase text-ink-soft mb-3.5 font-bold">
        {label}
      </div>
      <a
        href={href}
        className="inline-flex items-center gap-1.5 font-serif text-2xl text-tamkeen border-none italic font-medium hover:text-copper-deep hover:bg-transparent"
      >
        {children}
        <span aria-hidden className="not-italic text-copper">↓</span>
      </a>
    </div>
  );
}
