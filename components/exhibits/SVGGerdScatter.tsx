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

export function SVGGerdScatter({
  title = 'GERD vs citation gain',
  bubbles,
  annotations = [],
}: SVGGerdScatterProps) {
  return (
    <svg
      viewBox="0 0 1000 460"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      className="block w-full h-auto font-sans"
    >
      <title>{title}</title>
      <desc>{title}</desc>
      <g transform="translate(80,40)">
        <g stroke="var(--color-rule-soft)" strokeWidth={1} fill="none">
          <line x1={0} y1={0} x2={800} y2={0} />
          <line x1={0} y1={58} x2={800} y2={58} />
          <line x1={0} y1={116} x2={800} y2={116} />
          <line x1={0} y1={174} x2={800} y2={174} />
          <line x1={0} y1={232} x2={800} y2={232} />
          <line x1={0} y1={290} x2={800} y2={290} />
        </g>
        <line x1={0} y1={256} x2={800} y2={256} stroke="#3F4818" strokeWidth={1.2} />
        <text x={796} y={251} textAnchor="end" fontSize={10.5} fontStyle="italic" fill="var(--color-ink-soft)">
          No change
        </text>

        <g fontSize={11} fill="var(--color-ink-soft)" stroke="var(--color-rule)" strokeWidth={1}>
          <text x={-8} y={4} textAnchor="end" stroke="none">+40</text>
          <text x={-8} y={62} textAnchor="end" stroke="none">+30</text>
          <text x={-8} y={120} textAnchor="end" stroke="none">+20</text>
          <text x={-8} y={178} textAnchor="end" stroke="none">+10</text>
          <text x={-8} y={260} textAnchor="end" stroke="none">0</text>
          <text x={-8} y={294} textAnchor="end" stroke="none">-10</text>
          <line x1={0} y1={0} x2={0} y2={320} />
          <line x1={0} y1={320} x2={800} y2={320} />
          <text x={0} y={340} textAnchor="middle" stroke="none">0</text>
          <text x={133} y={340} textAnchor="middle" stroke="none">1%</text>
          <text x={266} y={340} textAnchor="middle" stroke="none">2%</text>
          <text x={399} y={340} textAnchor="middle" stroke="none">3%</text>
          <text x={532} y={340} textAnchor="middle" stroke="none">4%</text>
          <text x={665} y={340} textAnchor="middle" stroke="none">5%</text>
          <text x={798} y={340} textAnchor="middle" stroke="none">6%</text>
        </g>
        <text x={400} y={362} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-ink)">
          R&amp;D expenditure (% of GDP), latest available year
        </text>
        <text
          transform="translate(-50,160) rotate(-90)"
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="var(--color-ink)"
        >
          Δ mean citation score, 2016 to 2026
        </text>

        {bubbles.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.r} fill={b.fill} fillOpacity={b.fillOpacity ?? 0.7} />
            <text
              x={b.x + (b.labelDx ?? 14)}
              y={b.y + (b.labelDy ?? 3)}
              textAnchor={b.labelTextAnchor ?? 'start'}
              fontFamily="JetBrains Mono, ui-monospace, monospace"
              fontSize={b.labelStrong ? 11 : 10}
              fontWeight={b.labelStrong ? 700 : 500}
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
            y={a.y}
            fontSize={10.5}
            fontStyle="italic"
            fill={a.fill ?? 'var(--color-ink-soft)'}
            textAnchor={a.textAnchor ?? 'start'}
          >
            {a.text}
          </text>
        ))}

        <g transform="translate(580,250)">
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
