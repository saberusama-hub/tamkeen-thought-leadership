interface PillarSegment {
  label: string;
  weight: number;
  color: string;
  textLight?: boolean;
}

interface PillarCardData {
  tag: string;
  title: string;
  body: string;
  segments: PillarSegment[];
  legend: { label: string; color: string; full?: boolean }[];
}

interface PillarGridProps {
  cards: PillarCardData[];
}

/**
 * Two side-by-side pillar breakdowns. Hairline above each, no card chrome,
 * keep the coloured weight bar (it is the data).
 */
export function PillarGrid({ cards }: PillarGridProps) {
  return (
    <div className="my-12 grid grid-cols-2 gap-x-10 gap-y-10 max-[760px]:grid-cols-1">
      {cards.map((c, i) => (
        <div key={i} className="pt-5 border-t border-green/25 max-[760px]:first:border-t-0 max-[760px]:first:pt-0">
          <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium mb-2">
            {c.tag}
          </div>
          <h4 className="font-serif text-[20px] font-medium text-ink mt-0 mb-3 leading-[1.3] -tracking-[0.1px]">
            {c.title}
          </h4>
          <p className="font-serif text-[15px] text-ink/85 m-0 mb-5 max-w-none">{c.body}</p>
          <div
            className="flex h-7 mb-3 overflow-hidden border border-rule"
            title="Pillar weights"
          >
            {c.segments.map((s, j) => (
              <div
                key={j}
                className="flex items-center justify-center text-paper text-[10px] font-medium text-center px-1 leading-[1.2] border-r last:border-r-0 border-paper/30 font-sans"
                style={{ width: `${s.weight}%`, background: s.color }}
              >
                {s.weight}%
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[12px] font-sans">
            {c.legend.map((l, j) => (
              <div
                key={j}
                className={`flex items-start gap-2 text-mute leading-[1.4] ${
                  l.full ? 'col-span-2' : ''
                }`}
              >
                <span
                  className="block w-2.5 h-2.5 flex-none mt-0.5"
                  style={{ background: l.color }}
                  aria-hidden
                />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
