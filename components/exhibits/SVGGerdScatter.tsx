interface GerdBubble {
  code: string;
  x: number;
  y: number;
  r: number;
  fill: string;
  fillOpacity?: number;
  labelDx?: number;
  labelDy?: number;
  labelTextAnchor?: 'start' | 'middle' | 'end';
  labelStrong?: boolean;
}

interface Annotation {
  x: number;
  y: number;
  text: string;
  fill?: string;
  textAnchor?: 'start' | 'middle' | 'end';
}

interface SVGGerdScatterProps {
  title?: string;
  bubbles: GerdBubble[];
  annotations?: Annotation[];
}

/**
 * Vertical scale factor applied to all incoming y-coordinates and to the
 * chart's internal layout. Stretches the plot area vertically so bubble
 * separation along the citation-gain axis is more readable; circle radii
 * stay unscaled so bubbles remain round, not oval.
 */
const Y_SCALE = 1.5;
const sy = (y: number) => y * Y_SCALE;

export function SVGGerdScatter({
  title = 'GERD vs citation gain',
  bubbles,
  annotations = [],
}: SVGGerdScatterProps) {
  return (
    <svg
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      className="block w-full h-auto font-sans"
    >
      <title>{title}</title>
      <desc>{title}</desc>
      <g transform="translate(80,40)">
        <g stroke="var(--color-rule-soft)" strokeWidth={1} fill="none">
          <line x1={0} y1={sy(0)} x2={800} y2={sy(0)} />
          <line x1={0} y1={sy(58)} x2={800} y2={sy(58)} />
          <line x1={0} y1={sy(116)} x2={800} y2={sy(116)} />
          <line x1={0} y1={sy(174)} x2={800} y2={sy(174)} />
          <line x1={0} y1={sy(232)} x2={800} y2={sy(232)} />
          <line x1={0} y1={sy(290)} x2={800} y2={sy(290)} />
        </g>
        <line x1={0} y1={sy(256)} x2={800} y2={sy(256)} stroke="#3F4818" strokeWidth={1.2} />
        <text
          x={796}
          y={sy(256) - 5}
          textAnchor="end"
          fontSize={10.5}
          fontStyle="italic"
          fill="var(--color-ink-soft)"
        >
          No change
        </text>

        <g fontSize={11} fill="var(--color-ink-soft)" stroke="var(--color-rule)" strokeWidth={1}>
          <text x={-8} y={sy(0) + 4} textAnchor="end" stroke="none">+40</text>
          <text x={-8} y={sy(58) + 4} textAnchor="end" stroke="none">+30</text>
          <text x={-8} y={sy(116) + 4} textAnchor="end" stroke="none">+20</text>
          <text x={-8} y={sy(174) + 4} textAnchor="end" stroke="none">+10</text>
          <text x={-8} y={sy(256) + 4} textAnchor="end" stroke="none">0</text>
          <text x={-8} y={sy(290) + 4} textAnchor="end" stroke="none">-10</text>
          <line x1={0} y1={0} x2={0} y2={sy(320)} />
          <line x1={0} y1={sy(320)} x2={800} y2={sy(320)} />
          <text x={0} y={sy(320) + 20} textAnchor="middle" stroke="none">0</text>
          <text x={133} y={sy(320) + 20} textAnchor="middle" stroke="none">1%</text>
          <text x={266} y={sy(320) + 20} textAnchor="middle" stroke="none">2%</text>
          <text x={399} y={sy(320) + 20} textAnchor="middle" stroke="none">3%</text>
          <text x={532} y={sy(320) + 20} textAnchor="middle" stroke="none">4%</text>
          <text x={665} y={sy(320) + 20} textAnchor="middle" stroke="none">5%</text>
          <text x={798} y={sy(320) + 20} textAnchor="middle" stroke="none">6%</text>
        </g>
        <text
          x={400}
          y={sy(320) + 42}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="var(--color-ink)"
        >
          R&amp;D expenditure (% of GDP), latest available year
        </text>
        <text
          transform={`translate(-50,${sy(160)}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="var(--color-ink)"
        >
          Δ mean citation score, 2016 to 2026
        </text>

        {bubbles.map((b, i) => (
          <g key={i}>
            <circle
              cx={b.x}
              cy={sy(b.y)}
              r={b.r}
              fill={b.fill}
              fillOpacity={b.fillOpacity ?? 0.7}
            />
            <text
              x={b.x + (b.labelDx ?? 14)}
              y={sy(b.y) + (b.labelDy ?? 3)}
              textAnchor={b.labelTextAnchor ?? 'start'}
              fontFamily="JetBrains Mono, ui-monospace, monospace"
              fontSize={b.labelStrong ? 15 : 13}
              fontWeight={b.labelStrong ? 700 : 600}
              fill="var(--color-ink)"
            >
              {b.code}
            </text>
          </g>
        ))}

        {annotations.map((a, i) => (
          <text
            key={i}
            x={a.x}
            y={sy(a.y)}
            fontSize={10.5}
            fontStyle="italic"
            fill={a.fill ?? 'var(--color-ink-soft)'}
            textAnchor={a.textAnchor ?? 'start'}
          >
            {a.text}
          </text>
        ))}

        <g transform={`translate(580,${sy(250)})`}>
          <text x={0} y={-8} fontSize={10} fill="var(--color-ink-soft)" fontWeight={700}>
            Bubble size = Top-500 count
          </text>
          <circle cx={14} cy={6} r={4} fill="none" stroke="var(--color-ink-soft)" />
          <text x={22} y={9} fontSize={10} fill="var(--color-ink-soft)">10</text>
          <circle cx={58} cy={6} r={7} fill="none" stroke="var(--color-ink-soft)" />
          <text x={70} y={9} fontSize={10} fill="var(--color-ink-soft)">30</text>
          <circle cx={106} cy={6} r={11} fill="none" stroke="var(--color-ink-soft)" />
          <text x={122} y={9} fontSize={10} fill="var(--color-ink-soft)">70+</text>
          <rect x={0} y={22} width={10} height={10} fill="#A6B340" opacity={0.95} />
          <text x={14} y={31} fontSize={10} fill="var(--color-ink-soft)">
            Highlighted (UAE / Gulf / outlier)
          </text>
        </g>
      </g>
    </svg>
  );
}
