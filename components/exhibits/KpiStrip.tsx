interface KPI {
  num: string;
  unit?: string;
  label: string;
  desc: string;
  tone?: 'pos' | 'neg' | 'default';
}

interface KpiStripProps {
  kpis: KPI[];
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="grid grid-cols-4 my-9 mb-3 border-t-2 border-tamkeen border-b border-rule max-[920px]:grid-cols-2 max-[540px]:grid-cols-1">
      {kpis.map((k, i) => {
        const lastInRow = (i + 1) % 4 === 0;
        return (
          <div
            key={i}
            className={`px-6 pt-[26px] pb-6 bg-paper border-r border-rule ${
              lastInRow ? 'last:border-r-0 max-[920px]:border-r' : ''
            } max-[920px]:[&:nth-child(2n)]:border-r-0 max-[920px]:[&:nth-last-child(-n+2)]:border-b-0 max-[920px]:border-b max-[540px]:border-r-0`}
          >
            <div
              className={`font-serif text-[48px] font-semibold leading-none mb-2.5 -tracking-[1.5px] tabular-nums ${
                k.tone === 'neg' ? 'text-neg' : 'text-tamkeen'
              }`}
              style={{ fontFeatureSettings: '"lnum" 1, "tnum" 1' }}
            >
              {k.num}
              {k.unit ? <span className="text-[24px] tracking-normal font-medium">{k.unit}</span> : null}
            </div>
            <div className="font-sans text-[10.5px] text-ink-soft uppercase tracking-[1.5px] font-bold mb-2">
              {k.label}
            </div>
            <div className="text-[13.5px] text-ink-mid leading-[1.5] font-serif">{k.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
