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

/**
 * Two columns. Hairline above each. Tabular numerals on the values.
 */
export function UAEFootprint({ cards }: UAEFootprintProps) {
  return (
    <div className="my-12 grid grid-cols-2 gap-x-10 gap-y-10 max-[760px]:grid-cols-1">
      {cards.map((c, i) => (
        <div key={i} className="pt-5 border-t border-green/25 max-[760px]:first:border-t-0 max-[760px]:first:pt-0">
          <h4 className="m-0 mb-3 font-sans text-[11px] tracking-[1.6px] uppercase font-semibold text-ink">
            {c.title}
          </h4>
          {c.body ? (
            <p className="text-[15px] text-ink/85 m-0 mb-3 max-w-none font-serif">{c.body}</p>
          ) : null}
          <ul className="m-0 mt-3 p-0 list-none">
            {c.rows.map((r, j) => (
              <li
                key={j}
                className="grid grid-cols-[1fr_auto] gap-3 items-baseline py-2.5 border-b border-rule last:border-b-0 text-[15px]"
              >
                <span className="text-ink font-serif">{r.name}</span>
                <span
                  className="font-sans text-[13px] text-right font-semibold text-green tabular-nums"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
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
