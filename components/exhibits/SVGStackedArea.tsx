interface StackedAreaPath {
  d: string;
  fill: string;
}

interface SVGStackedAreaProps {
  title?: string;
  paths: StackedAreaPath[];
  legend: { label: string; color: string }[];
  years: string[];
  yTicks?: { y: number; label: string }[];
  breakLine?: { x: number; label: string };
  inlineLabels?: { x: number; y: number; text: string }[];
}

export function SVGStackedArea({
  title = 'Stacked area',
  paths,
  legend,
  years,
  yTicks = [
    { y: 304, label: '0%' },
    { y: 244, label: '20' },
    { y: 184, label: '40' },
    { y: 124, label: '60' },
    { y: 64, label: '80' },
    { y: 4, label: '100' },
  ],
  breakLine,
  inlineLabels = [],
}: SVGStackedAreaProps) {
  const xStep = 820 / (years.length - 1);
  return (
    <svg
      viewBox="0 0 1000 380"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      className="block w-full h-auto font-sans"
    >
      <title>{title}</title>
      <desc>{title}</desc>
      <g transform="translate(70,30)">
        <g stroke="var(--color-rule-soft)" strokeWidth={1} fill="none">
          <line x1={0} y1={0} x2={820} y2={0} />
          <line x1={0} y1={60} x2={820} y2={60} />
          <line x1={0} y1={120} x2={820} y2={120} />
          <line x1={0} y1={180} x2={820} y2={180} />
          <line x1={0} y1={240} x2={820} y2={240} />
          <line x1={0} y1={300} x2={820} y2={300} />
        </g>
        <g fontSize={11} fill="var(--color-ink-soft)">
          {yTicks.map((t) => (
            <text key={t.y} x={-12} y={t.y} textAnchor="end">
              {t.label}
            </text>
          ))}
        </g>

        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} />
        ))}

        {breakLine ? (
          <>
            <line
              x1={breakLine.x}
              y1={-4}
              x2={breakLine.x}
              y2={304}
              stroke="#A0342A"
              strokeWidth={1.2}
              strokeDasharray="3,3"
            />
            <text
              x={breakLine.x + 4}
              y={-8}
              fontSize={10.5}
              fill="#A0342A"
              fontStyle="italic"
            >
              {breakLine.label}
            </text>
          </>
        ) : null}

        {inlineLabels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} fontSize={12.5} fontWeight={600} fill="var(--color-paper)">
            {l.text}
          </text>
        ))}

        <g fill="var(--color-ink-soft)" fontSize={11}>
          <line
            x1={0}
            y1={300}
            x2={820}
            y2={300}
            stroke="var(--color-rule)"
            strokeWidth={1}
          />
          {years.map((y, i) => (
            <text key={y} x={i * xStep} y={320} textAnchor="middle">
              {y}
            </text>
          ))}
        </g>
      </g>

      <g transform="translate(70,360)" fontSize={11} fontFamily="Inter, sans-serif">
        {legend.map((l, i) => {
          const x = i * 130;
          return (
            <g key={l.label}>
              <rect x={x} y={-10} width={11} height={11} fill={l.color} />
              <text x={x + 18} y={0} fill="var(--color-ink-soft)">
                {l.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
