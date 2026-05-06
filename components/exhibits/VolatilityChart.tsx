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

/**
 * Simple paired-bar chart. Two stripes per row (QS green, THE near-black).
 * No card. No background.
 */
export function VolatilityChart({ tiers, caveat }: VolatilityChartProps) {
  return (
    <div className="my-6">
      {tiers.map((t, i) => {
        const qsPct = Math.max(3, (t.qs / MAX) * 100);
        const thePct = Math.max(3, (t.the / MAX) * 100);
        return (
          <div key={i} className="grid grid-cols-[80px_1fr_60px] gap-3.5 items-center py-2.5 max-[480px]:grid-cols-[64px_1fr_48px] max-[480px]:gap-2">
            <div className="text-[14px] text-ink font-serif">{t.label}</div>
            <div className="relative h-7 border-b border-rule">
              <div
                className="absolute left-0 top-1 h-2.5 bg-green"
                style={{ width: `${qsPct}%` }}
                aria-label={`QS ${t.qs}`}
              />
              <div
                className="absolute left-0 top-[14px] h-2.5 bg-ink/85"
                style={{ width: `${thePct}%` }}
                aria-label={`THE ${t.the}`}
              />
            </div>
            <div
              className="font-sans text-[13px] font-medium text-right text-ink tabular-nums"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {t.qs} / {t.the}
            </div>
          </div>
        );
      })}
      <div className="flex gap-5 mt-4 text-[11.5px] text-mute items-center font-sans flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-2 bg-green" aria-hidden />
          QS
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-2 bg-ink/85" aria-hidden />
          THE
        </div>
        {caveat ? <div className="ml-auto italic">{caveat}</div> : null}
      </div>
    </div>
  );
}
