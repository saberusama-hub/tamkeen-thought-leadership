import type { ReactNode } from 'react';

export interface StakeItem {
  title: string;
  body?: string;
  bullets?: string[];
}

interface StakeholderGridProps {
  items: StakeItem[];
  cols?: 2 | 3;
  dark?: boolean;
}

function renderBullet(bullet: string): ReactNode {
  // Allow simple <strong>...</strong> markup
  const parts = bullet.split(/(<strong>[^<]*<\/strong>)/g);
  return parts.map((p, i) => {
    const m = /^<strong>([^<]*)<\/strong>$/.exec(p);
    if (m) return <strong key={i} className="text-tamkeen font-semibold">{m[1]}</strong>;
    return <span key={i}>{p}</span>;
  });
}

export function StakeholderGrid({ items, cols = 3, dark = false }: StakeholderGridProps) {
  const colsClass = cols === 2 ? 'grid-cols-2 max-[780px]:grid-cols-1' : 'grid-cols-3 max-[920px]:grid-cols-2 max-[600px]:grid-cols-1';
  return (
    <div className={`grid ${colsClass} gap-5 my-8`}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`p-6 border border-rule border-t-[3px] ${
            dark ? 'bg-paper/[.04] border-paper/20 border-t-tamkeen-light' : 'bg-paper border-t-tamkeen'
          }`}
        >
          <h4
            className={`m-0 mb-3.5 font-sans text-[11.5px] font-bold tracking-[1.6px] uppercase ${
              dark ? 'text-paper' : 'text-tamkeen'
            }`}
          >
            {it.title}
          </h4>
          {it.body ? (
            <p
              className={`text-[13.5px] m-0 leading-[1.6] font-serif max-w-none ${
                dark ? 'text-paper/80' : 'text-ink-mid'
              }`}
            >
              {it.body}
            </p>
          ) : null}
          {it.bullets ? (
            <ul
              className={`m-0 pl-[18px] text-[13.5px] leading-[1.6] font-serif ${
                dark ? 'text-paper/80' : 'text-ink-mid'
              }`}
            >
              {it.bullets.map((b, j) => (
                <li key={j} className="mb-2 last:mb-0">
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
