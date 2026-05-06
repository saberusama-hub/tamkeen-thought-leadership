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
  if (line.greaterChina) return 'var(--color-lime)';
  if (line.country === 'United States') return 'var(--color-green)';
  if (line.country === 'United Kingdom') return 'var(--color-teal)';
  return 'var(--color-green-light)';
}

function keyFor(line: CohortLine): string {
  return `${line.country}::${line.university}`;
}

export function BumpChart({ data }: BumpChartProps) {
  const yearMin = 2016;
  const yearMax = 2026;
  const rankCap = 30;

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

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const activeKey = hoveredKey ?? selectedKey;

  const drawOrder = useMemo(() => {
    return [...data.lines].sort((a, b) => {
      const ak = keyFor(a) === activeKey ? 1 : 0;
      const bk = keyFor(b) === activeKey ? 1 : 0;
      return ak - bk;
    });
  }, [data.lines, activeKey]);

  const sortedForSelect = useMemo(
    () => [...data.lines].sort((a, b) => a.university.localeCompare(b.university)),
    [data.lines],
  );

  const toggleSelected = (key: string) =>
    setSelectedKey((prev) => (prev === key ? null : key));

  return (
    <div className="my-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Rank trajectories of the THE Top 20 institutions from 2016, tracked through 2026."
        className="block w-full h-auto font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedKey(null);
        }}
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
          const key = keyFor(line);
          const isActive = activeKey === key;
          const dim = activeKey != null && !isActive;
          const isSelected = selectedKey === key;
          return (
            <path
              key={key}
              d={lineGen(line.ranks) ?? ''}
              fill="none"
              stroke={colourFor(line)}
              strokeWidth={isActive ? 2.5 : 1.5}
              opacity={dim ? 0.16 : 0.9}
              style={{
                transition: 'opacity 0.18s ease, stroke-width 0.18s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onFocus={() => setHoveredKey(key)}
              onBlur={() => setHoveredKey(null)}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelected(key);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSelected(key);
                } else if (e.key === 'Escape') {
                  setSelectedKey(null);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${line.university}, ${line.country}`}
              aria-pressed={isSelected}
            >
              <title>{`${line.university}, ${line.country}`}</title>
            </path>
          );
        })}

        {/* Endpoint dot for the active line, anchors the eye */}
        {activeKey != null
          ? (() => {
              const line = data.lines.find((l) => keyFor(l) === activeKey);
              if (!line) return null;
              const last = line.ranks[line.ranks.length - 1];
              if (!last) return null;
              return (
                <circle
                  cx={xScale(last.year)}
                  cy={yScale(Math.min(rankCap, last.rankNumeric))}
                  r={4.5}
                  fill={colourFor(line)}
                  stroke="var(--color-paper)"
                  strokeWidth={1.5}
                  pointerEvents="none"
                />
              );
            })()
          : null}

        {/* Right-edge institution labels at the latest year */}
        {data.lines.map((line) => {
          const lastPoint = line.ranks[line.ranks.length - 1];
          if (!lastPoint) return null;
          const y = yScale(Math.min(rankCap, lastPoint.rankNumeric));
          const key = keyFor(line);
          const isActive = activeKey === key;
          const dim = activeKey != null && !isActive;
          const label =
            line.university.length > 28 ? `${line.university.slice(0, 26)}…` : line.university;
          return (
            <text
              key={key}
              x={W - M.right + 8}
              y={y + 4}
              fontSize={11}
              fill={isActive ? 'var(--color-ink)' : 'var(--color-mute)'}
              opacity={dim ? 0.3 : 1}
              style={{
                transition: 'opacity 0.18s ease, fill 0.18s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelected(key);
              }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <label className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-semibold flex items-center">
          Highlight
          <select
            value={selectedKey ?? ''}
            onChange={(e) => setSelectedKey(e.target.value || null)}
            aria-label="Highlight a university"
            className="ml-3 font-sans text-[12px] tracking-[0.4px] normal-case text-ink bg-paper border border-rule px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">— None —</option>
            {sortedForSelect.map((line) => {
              const key = keyFor(line);
              return (
                <option key={key} value={key}>
                  {line.university}
                </option>
              );
            })}
          </select>
        </label>
        {selectedKey ? (
          <button
            type="button"
            onClick={() => setSelectedKey(null)}
            className="ui-caps font-sans text-[11px] tracking-[1.5px] uppercase text-mute hover:text-green border-none bg-transparent cursor-pointer p-0"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="ui-caps font-sans text-[10px] tracking-[1.5px] uppercase text-mute mt-3">
        Click a line, click the right-edge label, or pick from the menu to highlight a trajectory.
      </div>
    </div>
  );
}
