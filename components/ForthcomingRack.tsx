import Link from 'next/link';
import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryId } from '@/types/article';

interface ForthcomingRackProps {
  /** Categories that ARE live — these get filtered out of the "in commission" cards */
  liveCategories: CategoryId[];
}

/**
 * Two rows of four cards. The 7 non-live, non-Overall categories go in as
 * "Forthcoming · In commission". The Overall card sits in the second row as an
 * editorial line, no top border.
 */
export function ForthcomingRack({ liveCategories }: ForthcomingRackProps) {
  const liveSet = new Set(liveCategories);
  const others = CATEGORY_KEYS.filter((k) => k !== 'overall' && !liveSet.has(k));
  const firstRow = others.slice(0, 4);
  const secondRow = others.slice(4);

  return (
    <section className="py-12 pb-8 border-b border-rule">
      <div className="flex justify-between items-baseline mb-6 max-[640px]:flex-col max-[640px]:gap-2">
        <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0">
          The forthcoming volumes
        </h2>
        <span className="font-serif text-sm italic text-ink-soft">
          Drafts in commission across the portfolio
        </span>
      </div>

      <div className="grid grid-cols-4 gap-8 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
        {firstRow.map((key) => (
          <RackCard key={key} categoryKey={key} />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-8 mt-8 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
        {secondRow.map((key) => (
          <RackCard key={key} categoryKey={key} />
        ))}
        <Link
          href="/category/overall"
          className="border-t border-transparent pt-3.5 flex flex-col gap-2.5 min-h-[130px] group"
        >
          <span className="font-sans text-[9.5px] tracking-[1.6px] uppercase font-bold text-accent-deep">
            Overall
          </span>
          <span className="font-serif text-[19px] leading-[1.3] font-medium text-tamkeen group-hover:text-accent-deep transition-colors">
            An annual review of the system, December 2026.
          </span>
          <span className="font-mono text-[10.5px] text-accent-deep mt-auto tracking-[0.5px] inline-flex items-center gap-2">
            <span aria-hidden className="block w-[5px] h-[5px] bg-accent rounded-full -translate-y-px" />
            Editorial
          </span>
        </Link>
      </div>
    </section>
  );
}

function RackCard({ categoryKey }: { categoryKey: CategoryId }) {
  const meta = CATEGORY_LABELS[categoryKey];
  return (
    <Link
      href={`/category/${categoryKey}`}
      className="border-t border-rule pt-3.5 flex flex-col gap-2.5 min-h-[130px] transition-colors duration-200 hover:border-t-tamkeen group"
    >
      <span className="font-sans text-[9.5px] tracking-[1.6px] uppercase font-bold text-ink-soft">
        {meta.label}
      </span>
      <span className="font-serif text-[19px] leading-[1.3] font-normal italic text-ink-mid">
        Forthcoming
      </span>
      <span className="font-mono text-[10.5px] text-accent-deep mt-auto tracking-[0.5px] inline-flex items-center gap-2">
        <span aria-hidden className="block w-[5px] h-[5px] bg-accent rounded-full -translate-y-px" />
        In commission
      </span>
    </Link>
  );
}
