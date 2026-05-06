interface RiserRow {
  label: string;
  fromRank: number;
  toRank: number;
}

interface SVGRisersProps {
  title?: string;
  rows: RiserRow[];
}

const FROM_X = 0;
const TO_X = 600;
const RANK_TO_PX = 3;

export function SVGRisers({ title = 'Top risers slope chart', rows }: SVGRisersProps) {
  return (
    <svg
      viewBox="0 0 1000 540"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      className="block w-full h-auto font-sans"
    >
      <title>{title}</title>
      <desc>{title}</desc>
      <g transform="translate(280,30)">
        <line x1={FROM_X} y1={0} x2={FROM_X} y2={490} stroke="var(--color-rule)" />
        <line x1={TO_X} y1={0} x2={TO_X} y2={490} stroke="var(--color-rule)" />
        <text x={FROM_X} y={-12} fontSize={11} fill="var(--color-ink)" textAnchor="middle">
          From rank ↓
        </text>
        <text x={TO_X} y={-12} fontSize={11} fill="var(--color-ink)" textAnchor="middle">
          → To rank
        </text>
        <text x={FROM_X} y={510} fontSize={10} textAnchor="middle" fill="var(--color-ink-soft)">
          low number = better
        </text>
        <text x={TO_X} y={510} fontSize={10} textAnchor="middle" fill="var(--color-ink-soft)">
          low number = better
        </text>

        {rows.map((r, i) => {
          const y = 10 + i * 30;
          const startX = FROM_X + r.fromRank * RANK_TO_PX;
          const endX = FROM_X + r.toRank * RANK_TO_PX;
          return (
            <g key={i} transform={`translate(0,${y})`}>
              <text
                x={-10}
                y={4}
                textAnchor="end"
                fontSize={12}
                fontWeight={600}
                fill="var(--color-ink)"
              >
                {r.label}
              </text>
              <line x1={startX} y1={0} x2={endX - 36} y2={0} stroke="#3F4818" strokeWidth={2} />
              <polygon points={`${startX},0 ${startX + 10},-5 ${startX + 10},5`} fill="#3F4818" />
              <circle cx={startX} cy={0} r={4} fill="#3F4818" />
              <circle cx={endX - 36} cy={0} r={4} fill="var(--color-ink-soft)" />
              <text
                x={startX - 5}
                y={-7}
                textAnchor="end"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize={10}
                fill="#3F4818"
              >
                {r.fromRank}
              </text>
              <text
                x={endX - 31}
                y={-7}
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize={10}
                fill="var(--color-ink-soft)"
              >
                {r.toRank}
              </text>
            </g>
          );
        })}

        <g transform="translate(0,470)">
          <circle cx={0} cy={0} r={4} fill="var(--color-ink-soft)" />
          <text x={10} y={4} fontSize={10} fill="var(--color-ink-soft)">
            First appearance (decade-start rank)
          </text>
          <circle cx={220} cy={0} r={4} fill="#3F4818" />
          <text x={230} y={4} fontSize={10} fill="var(--color-ink-soft)">
            Most recent rank (2026)
          </text>
        </g>
      </g>
    </svg>
  );
}
