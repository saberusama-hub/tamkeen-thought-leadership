interface FeaturedKpi {
  num: string;
  unit?: string;
  label: string;
  desc: string;
  tone?: 'pos' | 'neg' | 'default';
}

interface FeaturedKpiStripProps {
  kpis: FeaturedKpi[];
  className?: string;
}

/**
 * Lighter weight than the article KPI strip — used on the Rankings section front.
 * Number in Source Serif 44 weight 300, Inter 10.5 label, italic 13.5 desc.
 */
export function FeaturedKpiStrip({ kpis, className = '' }: FeaturedKpiStripProps) {
  return (
    <div
      className={`mt-9 grid grid-cols-4 border-t-2 border-tamkeen border-b border-rule max-[760px]:grid-cols-2 ${className}`}
    >
      {kpis.map((k, i) => (
        <div
          key={i}
          className="py-[22px] pr-[18px] border-r border-rule-soft last:border-r-0 last:pr-0 max-[760px]:[&:nth-child(2n)]:border-r-0 max-[760px]:[&:nth-child(2n)]:pr-0 max-[760px]:[&:nth-last-child(-n+2)]:pb-[22px] max-[760px]:border-b max-[760px]:border-rule-soft max-[760px]:last:border-b-0"
        >
          <div
            className={`font-serif font-light text-[44px] leading-none -tracking-[1.5px] mb-1 tabular-nums ${
              k.tone === 'neg' ? 'text-neg' : 'text-tamkeen'
            }`}
            style={{ fontFeatureSettings: '"lnum" 1, "tnum" 1' }}
          >
            {k.num}
            {k.unit ? (
              <span className="font-mono text-[14px] font-medium text-ink-mid tracking-normal ml-1">
                {k.unit}
              </span>
            ) : null}
          </div>
          <div className="font-sans text-[10.5px] tracking-[1.5px] uppercase font-bold text-ink mt-2 leading-[1.4]">
            {k.label}
          </div>
          <div className="font-serif text-[13.5px] text-ink-soft leading-[1.45] mt-1.5 italic">
            {k.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
