interface FootprintRow {
  name: string;
  value: string;
}

interface UAECard {
  title: string;
  body?: string;
  rows: FootprintRow[];
}

interface UAEFootprintProps {
  cards: UAECard[];
}

export function UAEFootprint({ cards }: UAEFootprintProps) {
  return (
    <div className="grid grid-cols-2 gap-6 my-7 max-[780px]:grid-cols-1">
      {cards.map((c, i) => (
        <div key={i} className="bg-paper border border-rule p-6 border-l-[3px] border-l-copper">
          <h4 className="m-0 mb-2 font-sans text-[11px] tracking-[1.6px] uppercase text-tamkeen font-bold">
            {c.title}
          </h4>
          {c.body ? (
            <p className="text-[14.5px] text-ink-mid m-0 max-w-none font-serif">{c.body}</p>
          ) : null}
          <ul className="m-0 mt-[18px] p-0 list-none">
            {c.rows.map((r, j) => (
              <li
                key={j}
                className="grid grid-cols-[1fr_60px] gap-2.5 items-baseline py-[11px] border-b border-rule-soft last:border-b-0 text-[14.5px]"
              >
                <span className="text-ink font-medium font-serif">{r.name}</span>
                <span className="font-mono text-[13px] text-right font-semibold text-tamkeen tabular-nums">
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
