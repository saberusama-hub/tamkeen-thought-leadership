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

/**
 * Four KPIs. No card. No background. No borders. Numbers carry the weight,
 * label and short description sit underneath in muted sans / serif.
 * Stacks responsively at 760px.
 */
export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="my-12 grid grid-cols-4 gap-12 max-[920px]:grid-cols-2 max-[920px]:gap-10 max-[540px]:grid-cols-1 max-[540px]:gap-8">
      {kpis.map((k, i) => (
        <div key={i}>
          <div
            className={`font-serif font-medium text-[44px] leading-none -tracking-[0.5px] mb-3 tabular-nums ${
              k.tone === 'neg' ? 'text-ink' : 'text-green'
            }`}
            style={{ fontFeatureSettings: '"lnum" 1, "tnum" 1' }}
          >
            {k.num}
            {k.unit ? <span className="text-[22px] tracking-normal font-normal">{k.unit}</span> : null}
          </div>
          <div className="font-sans text-[11px] tracking-[1.6px] uppercase font-medium text-ink mb-2">
            {k.label}
          </div>
          <div className="font-serif text-[14px] text-mute leading-[1.5]">{k.desc}</div>
        </div>
      ))}
    </div>
  );
}
