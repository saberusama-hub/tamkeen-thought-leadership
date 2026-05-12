interface KPI {
  num: string;
  unit?: string;
  label: string;
  desc: string;
  tone?: 'pos' | 'neg' | 'default';
  /** Optional direction indicator. Renders a small ▲/▼/− next to the number. */
  trend?: 'up' | 'down' | 'flat';
}

interface KpiStripProps {
  kpis: KPI[];
}

function TrendArrow({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  const symbol = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '–';
  const colour =
    direction === 'up' ? 'text-green' : direction === 'down' ? 'text-ink' : 'text-mute';
  return (
    <span
      aria-hidden
      className={`inline-block ml-1.5 align-middle text-[12px] -translate-y-1 ${colour}`}
    >
      {symbol}
    </span>
  );
}

/**
 * Four KPIs. Single dark green hairline on top, single rule beneath, no
 * card chrome between cells. Numbers carry the weight in dark green
 * (negative tone in ink). Stacks responsively at 920px and 540px.
 *
 * Number font sizing is fluid via clamp() so longer values like "4 → 12"
 * or "1 vs 20" do not overflow tight 4-column columns at desktop article
 * widths (~159px usable per column). whitespace-nowrap prevents intra-
 * number wrapping.
 */
export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <div className="my-12 border-t border-green/30 border-b border-rule pt-7 pb-7 grid grid-cols-4 gap-x-8 gap-y-8 max-[920px]:grid-cols-2 max-[540px]:grid-cols-1">
      {kpis.map((k, i) => (
        <div key={i} className="min-w-0">
          <div
            className={`font-serif font-medium leading-none -tracking-[0.6px] mb-3 tabular-nums whitespace-nowrap ${
              k.tone === 'neg' ? 'text-ink' : 'text-green'
            }`}
            style={{
              fontFeatureSettings: '"lnum" 1, "tnum" 1',
              fontSize: 'clamp(28px, 4.2vw, 40px)',
            }}
          >
            {k.num}
            {k.unit ? <span className="text-[0.5em] tracking-normal font-normal text-mute ml-1">{k.unit}</span> : null}
            {k.trend ? <TrendArrow direction={k.trend} /> : null}
          </div>
          <div className="ui-caps font-sans text-[11px] tracking-[1.5px] uppercase font-semibold text-ink mb-2 leading-[1.35] max-[540px]:text-[10.5px] max-[540px]:tracking-[1.3px]">
            {k.label}
          </div>
          <div className="font-serif text-[14px] text-mute leading-[1.5]">{k.desc}</div>
        </div>
      ))}
    </div>
  );
}
