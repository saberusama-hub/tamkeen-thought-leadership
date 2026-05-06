interface CountryBar {
  name: string;
  value: number;
  /** -25 to +25 scale; 1 unit = 10px on the bar */
  fill: string;
  textColor?: string;
}

interface SVGGainersDeclinersProps {
  title?: string;
  axisLabel?: string;
  gainers: CountryBar[];
  decliners: CountryBar[];
  /** Country name to highlight with a thin dotted box across the row. */
  highlightName?: string;
}

const ZERO_X = 350;
const UNIT = 10;

export function SVGGainersDecliners({
  title = 'Country gainers and decliners',
  axisLabel = 'Net change in Top-500 institution count (THE), 2016 to 2026',
  gainers,
  decliners,
  highlightName,
}: SVGGainersDeclinersProps) {
  const gainerHighlightIdx = highlightName
    ? gainers.findIndex((g) => g.name === highlightName)
    : -1;
  const declinerHighlightIdx = highlightName
    ? decliners.findIndex((d) => d.name === highlightName)
    : -1;
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
      <g transform="translate(200,30)">
        <line x1={ZERO_X} y1={0} x2={ZERO_X} y2={490} stroke="#3F4818" strokeWidth={1.2} />
        <text x={ZERO_X} y={-14} textAnchor="middle" fontSize={12} fontWeight={600} fill="#3F4818">
          {axisLabel}
        </text>

        <g stroke="var(--color-rule-soft)" strokeWidth={1} strokeDasharray="2,3" fill="none">
          <line x1={100} y1={0} x2={100} y2={490} />
          <line x1={200} y1={0} x2={200} y2={490} />
          <line x1={500} y1={0} x2={500} y2={490} />
          <line x1={600} y1={0} x2={600} y2={490} />
        </g>
        <g fontSize={10} fill="var(--color-ink-soft)">
          <text x={100} y={502} textAnchor="middle">-25</text>
          <text x={200} y={502} textAnchor="middle">-15</text>
          <text x={350} y={502} textAnchor="middle">0</text>
          <text x={500} y={502} textAnchor="middle">+15</text>
          <text x={600} y={502} textAnchor="middle">+25</text>
        </g>

        {gainers.map((g, i) => {
          const y = 10 + i * 32;
          const w = g.value * UNIT;
          return (
            <g key={`g${i}`}>
              <rect x={ZERO_X} y={y} width={w} height={22} fill={g.fill} />
              <text x={-12} y={y + 16} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--color-ink)">
                {g.name}
              </text>
              <text
                x={ZERO_X + w + 6}
                y={y + 16}
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontWeight={600}
                fontSize={11}
                fill="#3F4818"
              >
                +{g.value}
              </text>
            </g>
          );
        })}

        {decliners.map((d, i) => {
          const y = 266 + i * 32;
          const w = d.value * UNIT;
          const x = ZERO_X - w;
          return (
            <g key={`d${i}`}>
              <rect x={x} y={y} width={w} height={22} fill={d.fill} />
              <text x={-12} y={y + 16} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--color-ink)">
                {d.name}
              </text>
              <text
                x={x - 5}
                y={y + 16}
                textAnchor="end"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontWeight={600}
                fontSize={11}
                fill="#A0342A"
              >
                -{d.value}
              </text>
            </g>
          );
        })}

        <text x={600} y={2} fontSize={10.5} fill="#3F4818" fontStyle="italic">
          ↑ Gainers
        </text>
        <text x={105} y={2} fontSize={10.5} fill="#A0342A" fontStyle="italic">
          ↑ Decliners
        </text>

        {gainerHighlightIdx >= 0 ? (
          <g>
            <rect
              x={-205}
              y={10 + gainerHighlightIdx * 32 - 4}
              width={825}
              height={30}
              fill="none"
              stroke="var(--color-neg)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
            <text
              x={-205}
              y={10 + gainerHighlightIdx * 32 - 9}
              fontSize={9.5}
              fontStyle="italic"
              fontWeight={600}
              fill="var(--color-neg)"
              letterSpacing={1.2}
            >
              SPOTLIGHT
            </text>
          </g>
        ) : null}
        {declinerHighlightIdx >= 0 ? (
          <g>
            <rect
              x={-205}
              y={266 + declinerHighlightIdx * 32 - 4}
              width={825}
              height={30}
              fill="none"
              stroke="var(--color-neg)"
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
            <text
              x={-205}
              y={266 + declinerHighlightIdx * 32 - 9}
              fontSize={9.5}
              fontStyle="italic"
              fontWeight={600}
              fill="var(--color-neg)"
              letterSpacing={1.2}
            >
              SPOTLIGHT
            </text>
          </g>
        ) : null}
      </g>
    </svg>
  );
}
