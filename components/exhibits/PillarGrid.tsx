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

export function PillarGrid({ cards }: PillarGridProps) {
  return (
    <div className="grid grid-cols-2 gap-[30px] my-7 max-[780px]:grid-cols-1">
      {cards.map((c, i) => (
        <div key={i} className="bg-paper border border-rule border-t-[3px] border-t-tamkeen p-[26px]">
          <div className="font-sans text-[10px] tracking-[1.8px] uppercase text-copper-deep font-bold mb-1.5">
            {c.tag}
          </div>
          <h3 className="font-serif text-xl font-semibold text-tamkeen mt-0 mb-3 leading-[1.3] -tracking-[0.2px]">
            {c.title}
          </h3>
          <p className="text-[14.5px] text-ink-mid m-0 max-w-none">{c.body}</p>
          <div className="flex h-[38px] my-[18px] mb-3 border border-rule overflow-hidden" title="Pillar weights">
            {c.segments.map((s, j) => (
              <div
                key={j}
                className={`flex items-center justify-center text-paper text-[10.5px] font-semibold text-center px-1 leading-[1.2] border-r last:border-r-0 border-paper/40 font-sans ${
                  s.textLight ? 'text-paper' : 'text-paper'
                }`}
                style={{ width: `${s.weight}%`, background: s.color }}
              >
                {s.label}
                <br />
                {s.weight}%
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3.5 text-xs mt-3 font-sans">
            {c.legend.map((l, j) => (
              <div
                key={j}
                className={`flex items-start gap-2 text-ink-mid leading-[1.4] ${
                  l.full ? 'col-span-2' : ''
                }`}
              >
                <span
                  className="block w-[11px] h-[11px] flex-none mt-0.5"
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
