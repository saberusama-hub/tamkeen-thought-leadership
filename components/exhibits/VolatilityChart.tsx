interface Tier {
  label: string;
  qs: number;
  the: number;
}

interface VolatilityChartProps {
  tiers: Tier[];
  caveat?: string;
}

const MAX = 18;

export function VolatilityChart({ tiers, caveat }: VolatilityChartProps) {
  return (
    <div className="mt-2">
      {tiers.map((t, i) => {
        // Floor each bar at 3% so a value of 1 isn't visually invisible.
        const qsPct = Math.max(3, (t.qs / MAX) * 100);
        const thePct = Math.max(3, (t.the / MAX) * 100);
        return (
          <div
            key={i}
            className="grid grid-cols-[90px_1fr_60px] gap-3.5 items-center py-2"
          >
            <div className="text-[13.5px] font-semibold text-ink font-serif">{t.label}</div>
            <div className="relative h-8 bg-paper border border-rule">
              <div
                className="absolute left-0 top-1 h-[11px] bg-tamkeen"
                style={{ width: `${qsPct}%` }}
                aria-label={`QS ${t.qs}`}
              />
              <div
                className="absolute left-0 top-[17px] h-[11px] bg-copper"
                style={{ width: `${thePct}%` }}
                aria-label={`THE ${t.the}`}
              />
            </div>
            <div className="font-mono text-[13px] font-semibold text-right text-ink tabular-nums">
              {t.qs} / {t.the}
            </div>
          </div>
        );
      })}
      <div className="flex gap-5 mt-[18px] text-[11.5px] text-ink-soft items-center font-sans flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-2 bg-tamkeen" aria-hidden />
          QS
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-2 bg-copper" aria-hidden />
          THE
        </div>
        {caveat ? <div className="ml-auto italic">{caveat}</div> : null}
      </div>
    </div>
  );
}
