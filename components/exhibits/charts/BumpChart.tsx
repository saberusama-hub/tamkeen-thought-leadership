'use client';

import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line, curveMonotoneX } from 'd3-shape';

interface RankPoint {
  year: number;
  rank: number | null;
  rankNumeric: number;
  isBanded: boolean;
}

interface CohortLine {
  university: string;
  country: string;
  region: string;
  greaterChina: boolean;
  ranks: RankPoint[];
}

interface BumpData {
  cohortSize: number;
  lines: CohortLine[];
}

interface BumpChartProps {
  /** Imported from content/data/the-bump-cohort.json */
  data: BumpData;
}

const W = 1000;
const H = 540;
const M = { top: 24, right: 220, bottom: 40, left: 40 };

function colourFor(line: CohortLine): string {
  if (line.greaterChina) return 'var(--color-copper)';
  if (line.country === 'United States') return 'var(--color-green)';
  if (line.country === 'United Kingdom') return 'var(--color-green-mid)';
  return 'var(--color-green-light)';
}

export function BumpChart({ data }: BumpChartProps) {
  const yearMin = 2016;
  const yearMax = 2026;
  const rankCap = 30; // y-axis cap; lines below this get clamped at the bottom

  const xScale = useMemo(
    () => scaleLinear().domain([yearMin, yearMax]).range([M.left, W - M.right]),
    [],
  );
  const yScale = useMemo(
    () => scaleLinear().domain([1, rankCap]).range([M.top, H - M.bottom]),
    [],
  );

  const lineGen = useMemo(
    () =>
      d3line<RankPoint>()
        .x((d) => xScale(d.year))
        .y((d) => yScale(Math.min(rankCap, d.rankNumeric)))
        .curve(curveMonotoneX),
    [xScale, yScale],
  );

  const [activeYear, setActiveYear] = useState(yearMax);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Sort lines so hovered line draws last (on top).
  const drawOrder = useMemo(() => {
    return [...data.lines].sort((a, b) => {
      const ak = `${a.country}::${a.university}` === hoveredKey ? 1 : 0;
      const bk = `${b.country}::${b.university}` === hoveredKey ? 1 : 0;
      return ak - bk;
    });
  }, [data.lines, hoveredKey]);

  const activeYearX = xScale(activeYear);

  return (
    <div className="my-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Rank trajectories of the THE Top 20 institutions from 2016, tracked through 2026.`}
        className="block w-full h-auto font-sans"
      >
        {/* Y-axis: rank gridlines 1, 5, 10, 15, 20, 25 */}
        <g>
          {[1, 5, 10, 15, 20, 25].map((r) => (
            <g key={r}>
              <line
                x1={M.left}
                y1={yScale(r)}
                x2={W - M.right}
                y2={yScale(r)}
                stroke="var(--color-rule)"
                strokeWidth={1}
                strokeDasharray="2 4"
                opacity={0.5}
              />
              <text
                x={M.left - 8}
                y={yScale(r) + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--color-mute)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {r}
              </text>
            </g>
          ))}
        </g>

        {/* X-axis: year labels */}
        <g>
          {Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMin + i).map((y) => (
            <text
              key={y}
              x={xScale(y)}
              y={H - M.bottom + 22}
              textAnchor="middle"
              fontSize={11}
              fill="var(--color-mute)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {y}
            </text>
          ))}
        </g>

        {/* 2024 methodology break vertical hairline */}
        <line
          x1={xScale(2024)}
          y1={M.top}
          x2={xScale(2024)}
          y2={H - M.bottom}
          stroke="var(--color-mute)"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.4}
        />
        <text
          x={xScale(2024)}
          y={M.top - 8}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-mute)"
          fontStyle="italic"
        >
          2024 methodology break
        </text>

        {/* Lines */}
        {drawOrder.map((line) => {
          const key = `${line.country}::${line.university}`;
          const isHovered = hoveredKey === key;
          const dim = hoveredKey != null && !isHovered;
          return (
            <path
              key={key}
              d={lineGen(line.ranks) ?? ''}
              fill="none"
              stroke={colourFor(line)}
              strokeWidth={isHovered ? 2.5 : 1.5}
              opacity={dim ? 0.18 : 0.9}
              style={{ transition: 'opacity 0.15s, stroke-width 0.15s' }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onFocus={() => setHoveredKey(key)}
              onBlur={() => setHoveredKey(null)}
              tabIndex={0}
              aria-label={`${line.university}, ${line.country}`}
            >
              <title>{`${line.university}, ${line.country}`}</title>
            </path>
          );
        })}

        {/* Active-year vertical scrubber */}
        <line
          x1={activeYearX}
          y1={M.top}
          x2={activeYearX}
          y2={H - M.bottom}
          stroke="var(--color-green)"
          strokeWidth={1.5}
        />

        {/* Active-year intersection labels: institution rank at the scrubber position */}
        {data.lines.map((line) => {
          const point = line.ranks.find((p) => p.year === activeYear);
          if (!point) return null;
          const y = yScale(Math.min(rankCap, point.rankNumeric));
          const key = `${line.country}::${line.university}`;
          const isHovered = hoveredKey === key;
          return (
            <g key={key}>
              <circle
                cx={activeYearX}
                cy={y}
                r={isHovered ? 5 : 3.5}
                fill={colourFor(line)}
                stroke="var(--color-paper)"
                strokeWidth={1.5}
                style={{ transition: 'r 0.15s' }}
              />
            </g>
          );
        })}

        {/* Right-edge institution labels at the latest year */}
        {data.lines.map((line) => {
          const lastPoint = line.ranks[line.ranks.length - 1];
          if (!lastPoint) return null;
          const y = yScale(Math.min(rankCap, lastPoint.rankNumeric));
          const key = `${line.country}::${line.university}`;
          const isHovered = hoveredKey === key;
          const dim = hoveredKey != null && !isHovered;
          const label = line.university.length > 28
            ? `${line.university.slice(0, 26)}…`
            : line.university;
          return (
            <text
              key={key}
              x={W - M.right + 8}
              y={y + 4}
              fontSize={11}
              fill={isHovered ? 'var(--color-ink)' : 'var(--color-mute)'}
              opacity={dim ? 0.3 : 1}
              style={{ transition: 'opacity 0.15s, fill 0.15s' }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center gap-4 max-[640px]:flex-wrap">
        <input
          type="range"
          min={yearMin}
          max={yearMax}
          step={1}
          value={activeYear}
          onChange={(e) => setActiveYear(Number(e.target.value))}
          aria-label="Year"
          className="flex-1 max-w-[480px] accent-[var(--color-green)]"
        />
        <div
          className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase font-semibold text-mute tabular-nums"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {activeYear}
        </div>
      </div>
      <div className="ui-caps font-sans text-[10px] tracking-[1.5px] uppercase text-mute mt-3">
        Hover a line to highlight it. Drag the slider to mark a year.
      </div>
    </div>
  );
}
