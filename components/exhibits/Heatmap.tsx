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

/**
 * Diverging colour ramp. Negative values use a desaturated near-black on
 * pale, positives use the green family. We deliberately keep the green ramp
 * since it is the data, not the chrome.
 */
const RAMP = [
  { stop: -10, hex: '#404040', text: '#faf6ee' },
  { stop: -6, hex: '#7c7c7c', text: '#faf6ee' },
  { stop: -2, hex: '#d8d3c4', text: '#111110' },
  { stop: 0, hex: '#ece6d4', text: '#6b6862' },
  { stop: 2, hex: '#cee0d6', text: '#003d2b' },
  { stop: 4, hex: '#a8c2b4', text: '#003d2b' },
  { stop: 8, hex: '#6b9f88', text: '#faf6ee' },
  { stop: 16, hex: '#1f5a45', text: '#faf6ee' },
  { stop: 30, hex: '#003d2b', text: '#faf6ee' },
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
    <div className="my-2 overflow-x-auto">
      <div className="min-w-[640px]">
        <div
          className="grid gap-1 items-stretch font-sans text-[10px] uppercase tracking-[1.2px] text-mute font-medium mb-2"
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
            <div className="px-2 py-3 text-[14px] text-ink flex items-center font-serif">
              {r.label}
            </div>
            {r.cells.map((c, ci) => {
              const { bg, fg } = colorFor(c.value);
              return (
                <div
                  key={ci}
                  className="px-2 py-3 text-center font-sans text-[13px] font-semibold flex items-center justify-center min-h-12 tabular-nums"
                  style={{ background: bg, color: fg, fontVariantNumeric: 'tabular-nums' }}
                >
                  {c.display}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {legend ? (
        <div className="flex items-center gap-2.5 mt-5 text-[11px] text-mute flex-wrap font-sans">
          <span className="text-[11px] text-ink">{legend.label ?? 'Δ score'}</span>
          <div className="flex items-center h-3.5 border border-rule">
            {RAMP.map((r, i) => (
              <span key={i} className="block w-[28px] h-[12px]" style={{ background: r.hex }} />
            ))}
          </div>
          <span>{legend.min}</span>
          <span>0</span>
          <span>+{legend.max}</span>
        </div>
      ) : null}
    </div>
  );
}
