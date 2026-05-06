import type { ReactNode } from 'react';

export interface StakeItem {
  title: string;
  body?: string;
  bullets?: string[];
}

interface StakeholderGridProps {
  items: StakeItem[];
  cols?: 2 | 3;
  /** Retained for backward compatibility, ignored. */
  dark?: boolean;
}

function renderBullet(bullet: string): ReactNode {
  // Allow simple <strong>...</strong> markup
  const parts = bullet.split(/(<strong>[^<]*<\/strong>)/g);
  return parts.map((p, i) => {
    const m = /^<strong>([^<]*)<\/strong>$/.exec(p);
    if (m) return <strong key={i} className="text-ink font-semibold">{m[1]}</strong>;
    return <span key={i}>{p}</span>;
  });
}

/**
 * Stakeholder list. No card. Just a hairline above each block, the title in
 * tracked sans, and the body or bullet list beneath.
 */
export function StakeholderGrid({ items, cols = 3 }: StakeholderGridProps) {
  const colsClass =
    cols === 2 ? 'grid-cols-2 max-[760px]:grid-cols-1' : 'grid-cols-3 max-[920px]:grid-cols-2 max-[600px]:grid-cols-1';
  return (
    <div className={`my-12 grid ${colsClass} gap-x-10 gap-y-10`}>
      {items.map((it, i) => (
        <div key={i} className="pt-5 border-t border-green/25 max-[600px]:first:border-t-0 max-[600px]:first:pt-0">
          <h4 className="m-0 mb-3 font-sans text-[11px] tracking-[1.6px] uppercase font-semibold text-ink">
            {it.title}
          </h4>
          {it.body ? (
            <p className="text-[15px] leading-[1.55] m-0 max-w-none font-serif text-ink/85">
              {it.body}
            </p>
          ) : null}
          {it.bullets ? (
            <ul className="m-0 pl-4 text-[15px] leading-[1.55] font-serif text-ink/85 list-disc marker:text-mute">
              {it.bullets.map((b, j) => (
                <li key={j} className="mb-2 last:mb-0 pl-1">
                  {renderBullet(b)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
