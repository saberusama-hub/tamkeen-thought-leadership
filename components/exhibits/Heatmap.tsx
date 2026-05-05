interface HeatCell {
  value: number;
  display: string;
}

interface HeatRow {
  label: string;
  cells: HeatCell[];
}

interface HeatmapProps {
  rows: HeatRow[];
  cols: string[];
  legend?: { min: number; max: number; label?: string };
}

const RAMP = [
  { stop: -10, hex: '#A0342A', text: '#FAF6EE' },
  { stop: -6, hex: '#D6A19A', text: '#FAF6EE' },
  { stop: -2, hex: '#E8C7C2', text: '#A0342A' },
  { stop: 0, hex: '#F2EBDC', text: '#6F6A5A' },
  { stop: 2, hex: '#D4E4DD', text: '#003D2B' },
  { stop: 4, hex: '#C4D8CC', text: '#003D2B' },
  { stop: 8, hex: '#7AAB94', text: '#FAF6EE' },
  { stop: 16, hex: '#1F5A45', text: '#FAF6EE' },
  { stop: 30, hex: '#003D2B', text: '#FAF6EE' },
];

function colorFor(v: number): { bg: string; fg: string } {
  let pick = RAMP[0];
  for (const r of RAMP) {
    if (v >= r.stop) pick = r;
  }
  return { bg: pick.hex, fg: pick.text };
}

export function Heatmap({ rows, cols, legend }: HeatmapProps) {
  return (
    <div className="mt-2">
      <div
        className="grid gap-1 items-stretch font-sans text-[10.5px] uppercase tracking-[1.2px] text-ink-soft font-bold mb-2"
        style={{ gridTemplateColumns: `160px repeat(${cols.length}, 1fr)` }}
      >
        <div />
        {cols.map((c, i) => (
          <div
            key={i}
            className="px-2 text-center leading-[1.3] self-end pb-1.5 border-b border-rule"
            dangerouslySetInnerHTML={{ __html: c }}
          />
        ))}
      </div>
      {rows.map((r, ri) => (
        <div
          key={ri}
          className="grid gap-1 items-stretch mt-1"
          style={{ gridTemplateColumns: `160px repeat(${cols.length}, 1fr)` }}
        >
          <div className="px-2.5 py-3.5 text-[13.5px] font-semibold text-ink flex items-center font-serif">
            {r.label}
          </div>
          {r.cells.map((c, ci) => {
            const { bg, fg } = colorFor(c.value);
            return (
              <div
                key={ci}
                className="px-2.5 py-3.5 text-center font-mono text-sm font-semibold flex items-center justify-center min-h-12 tabular-nums"
                style={{ background: bg, color: fg, fontFeatureSettings: '"tnum" 1' }}
              >
                {c.display}
              </div>
            );
          })}
        </div>
      ))}

      {legend ? (
        <div className="flex items-center gap-2.5 mt-[18px] text-[11px] text-ink-soft flex-wrap font-sans">
          <span className="font-mono text-[11px] text-ink">{legend.label ?? 'Δ score'}</span>
          <div className="flex items-center h-4 border border-rule">
            {RAMP.map((r, i) => (
              <span key={i} className="block w-[30px] h-[14px]" style={{ background: r.hex }} />
            ))}
          </div>
          <span className="font-mono text-[11px] text-ink">{legend.min}</span>
          <span className="font-mono text-[11px] text-ink">0</span>
          <span className="font-mono text-[11px] text-ink">+{legend.max}</span>
        </div>
      ) : null}
    </div>
  );
}
