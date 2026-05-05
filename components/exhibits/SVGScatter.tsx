interface ScatterPoint {
  x: number;
  y: number;
  r?: number;
}

interface ScatterOutlier {
  x: number;
  y: number;
  label: string;
  labelX?: number;
  labelY?: number;
}

interface SVGScatterProps {
  title?: string;
  points: ScatterPoint[];
  outliers?: ScatterOutlier[];
  diagonal?: boolean;
  diagonalLabel?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xTicks?: { x: number; label: string }[];
  yTicks?: { y: number; label: string }[];
}

export function SVGScatter({
  title = 'Scatter chart',
  points,
  outliers = [],
  diagonal = false,
  diagonalLabel,
  xAxisLabel,
  yAxisLabel,
  xTicks,
  yTicks,
}: SVGScatterProps) {
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
          <line x1={0} y1={0} x2={820} y2={0} />
          <line x1={0} y1={80} x2={820} y2={80} />
          <line x1={0} y1={160} x2={820} y2={160} />
          <line x1={0} y1={240} x2={820} y2={240} />
          <line x1={0} y1={320} x2={820} y2={320} />
          <line x1={0} y1={0} x2={0} y2={320} />
          <line x1={164} y1={0} x2={164} y2={320} />
          <line x1={328} y1={0} x2={328} y2={320} />
          <line x1={492} y1={0} x2={492} y2={320} />
          <line x1={656} y1={0} x2={656} y2={320} />
          <line x1={820} y1={0} x2={820} y2={320} />
        </g>

        {diagonal ? (
          <>
            <line
              x1={0}
              y1={0}
              x2={820}
              y2={320}
              stroke="var(--color-ink-soft)"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            {diagonalLabel ? (
              <text x={700} y={278} fontSize={10.5} fill="var(--color-ink-soft)" fontStyle="italic">
                {diagonalLabel}
              </text>
            ) : null}
          </>
        ) : null}

        <g fill="var(--color-tamkeen-mid)" opacity={0.6}>
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r ?? 3.5} />
          ))}
        </g>

        <g fill="#A0342A">
          {outliers.map((o, i) => (
            <circle key={`f${i}`} cx={o.x} cy={o.y} r={4} />
          ))}
        </g>
        <g fill="none" stroke="#A0342A" strokeWidth={1.4}>
          {outliers.map((o, i) => (
            <circle key={`r${i}`} cx={o.x} cy={o.y} r={8} />
          ))}
        </g>
        {outliers.map((o, i) => (
          <text
            key={`t${i}`}
            x={o.labelX ?? o.x + 14}
            y={o.labelY ?? o.y - 4}
            fontSize={10.5}
            fill="var(--color-ink)"
          >
            {o.label}
          </text>
        ))}

        <g stroke="var(--color-rule)" strokeWidth={1} fill="var(--color-ink-soft)" fontSize={11}>
          <line x1={0} y1={320} x2={820} y2={320} />
          <line x1={0} y1={0} x2={0} y2={320} />
          {(
            xTicks ?? [
              { x: 0, label: '1' },
              { x: 164, label: '100' },
              { x: 328, label: '200' },
              { x: 492, label: '300' },
              { x: 656, label: '400' },
              { x: 820, label: '500' },
            ]
          ).map((t, i) => (
            <text key={`x${i}`} x={t.x} y={340} textAnchor="middle" stroke="none">
              {t.label}
            </text>
          ))}
          {(
            yTicks ?? [
              { y: 4, label: '1' },
              { y: 84, label: '100' },
              { y: 164, label: '200' },
              { y: 244, label: '300' },
              { y: 324, label: '400' },
            ]
          ).map((t, i) => (
            <text key={`y${i}`} x={-12} y={t.y} textAnchor="end" stroke="none">
              {t.label}
            </text>
          ))}
        </g>
        {xAxisLabel ? (
          <text x={410} y={370} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--color-ink)">
            {xAxisLabel}
          </text>
        ) : null}
        {yAxisLabel ? (
          <text
            transform="translate(-50,160) rotate(-90)"
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill="var(--color-ink)"
          >
            {yAxisLabel}
          </text>
        ) : null}
      </g>
    </svg>
  );
}
