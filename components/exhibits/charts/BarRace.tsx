'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';

interface Bar {
  rank: number;
  university: string;
  country: string;
  region: string;
  greaterChina: boolean;
  overall: number;
}

interface YearFrame {
  year: number;
  bars: Bar[];
}

interface BarRaceProps {
  /** Imported from content/data/the-top20-by-year.json */
  years: YearFrame[];
  /** How many top-N bars to show. Default 20. */
  topN?: number;
  /** Milliseconds per year transition. Default 700. */
  msPerYear?: number;
}

interface BarPosition {
  university: string;
  country: string;
  region: string;
  greaterChina: boolean;
  /** Interpolated overall score for the current frame. */
  score: number;
  /** Interpolated rank position (1-based, may be fractional during transitions). */
  position: number;
  /** Whether the institution is present in the destination year (for fade-out logic). */
  alive: boolean;
}

const BAR_HEIGHT = 26;
const BAR_GAP = 4;
const LABEL_WIDTH = 220;
const SCORE_WIDTH = 60;
const PADDING_X = 16;

/** Returns bars positioned for a given year-frame, sorted asc by score. */
function framePositions(frame: YearFrame, topN: number): Map<string, BarPosition> {
  const map = new Map<string, BarPosition>();
  const sorted = [...frame.bars]
    .filter((b) => b.overall != null)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, topN);
  sorted.forEach((b, i) => {
    map.set(b.university, {
      university: b.university,
      country: b.country,
      region: b.region,
      greaterChina: b.greaterChina,
      score: b.overall,
      position: i + 1,
      alive: true,
    });
  });
  return map;
}

/** Interpolate between two frame-position maps. */
function interpolatePositions(
  prev: Map<string, BarPosition>,
  next: Map<string, BarPosition>,
  t: number,
): BarPosition[] {
  // Universe = union of both years' top-N.
  const keys = new Set<string>([...prev.keys(), ...next.keys()]);
  const result: BarPosition[] = [];
  for (const k of keys) {
    const a = prev.get(k);
    const b = next.get(k);
    if (a && b) {
      result.push({
        ...b,
        score: a.score + (b.score - a.score) * t,
        position: a.position + (b.position - a.position) * t,
        alive: true,
      });
    } else if (a && !b) {
      // Bar is exiting; slide it down past topN with fading score.
      result.push({
        ...a,
        score: a.score * (1 - t * 0.4),
        position: a.position + (40 - a.position) * t, // slides down off-frame
        alive: t < 0.95,
      });
    } else if (!a && b) {
      // Bar entering; fade in from below.
      result.push({
        ...b,
        score: b.score * (0.6 + 0.4 * t),
        position: 40 + (b.position - 40) * t,
        alive: t > 0.05,
      });
    }
  }
  return result;
}

export function BarRace({ years, topN = 20, msPerYear = 700 }: BarRaceProps) {
  const yearList = useMemo(() => years.map((y) => y.year).sort((a, b) => a - b), [years]);
  const minYear = yearList[0]!;
  const maxYear = yearList[yearList.length - 1]!;

  const framesByYear = useMemo(() => {
    const m = new Map<number, Map<string, BarPosition>>();
    for (const y of years) m.set(y.year, framePositions(y, topN));
    return m;
  }, [years, topN]);

  // Animation: continuous (year, t) where t ∈ [0,1) advancing through years.
  const [yearIdx, setYearIdx] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reducedMotionRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  // Honour reduced-motion: do not auto-play.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = m.matches;
  }, []);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
      return;
    }
    function step(now: number) {
      if (lastTickRef.current == null) lastTickRef.current = now;
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setT((prev) => {
        let nt = prev + dt / msPerYear;
        let advance = 0;
        while (nt >= 1) {
          nt -= 1;
          advance += 1;
        }
        if (advance > 0) {
          setYearIdx((idx) => {
            const next = idx + advance;
            if (next >= yearList.length - 1) {
              setPlaying(false);
              return yearList.length - 1;
            }
            return next;
          });
        }
        return nt;
      });
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, msPerYear, yearList.length]);

  // Restart from the beginning if user hits play after reaching the end.
  function togglePlay() {
    if (yearIdx >= yearList.length - 1 && t > 0.99) {
      setYearIdx(0);
      setT(0);
    }
    setPlaying((p) => !p);
  }

  function onScrub(value: number) {
    setPlaying(false);
    const float = (value - minYear) / Math.max(1, maxYear - minYear);
    const total = yearList.length - 1;
    const idx = Math.min(total, Math.max(0, Math.floor(float * total)));
    const frac = Math.max(0, Math.min(0.999, float * total - idx));
    setYearIdx(idx);
    setT(frac);
  }

  // Keyboard: Space to toggle, arrows to step year.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPlaying(false);
      setYearIdx((idx) => Math.min(yearList.length - 1, idx + 1));
      setT(0);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPlaying(false);
      setYearIdx((idx) => Math.max(0, idx - 1));
      setT(0);
    }
  }

  // Compute bars for current frame.
  const prev = framesByYear.get(yearList[yearIdx]!)!;
  const next = framesByYear.get(yearList[Math.min(yearList.length - 1, yearIdx + 1)]!)!;
  const positions = interpolatePositions(prev, next, t).filter((b) => b.alive);
  const visibleYear = yearList[yearIdx]! + (yearIdx < yearList.length - 1 ? Math.round(t * 100) / 100 : 0);
  const yearLabel = Math.round(visibleYear);

  // Score axis: domain is observed range over all years; we use 80–100 to keep bars meaningful.
  const xScale = scaleLinear()
    .domain([80, 100])
    .range([LABEL_WIDTH + PADDING_X, 1000 - SCORE_WIDTH - PADDING_X])
    .clamp(true);

  const height = topN * (BAR_HEIGHT + BAR_GAP) + 60;

  return (
    <div className="my-4">
      <div
        className="relative bg-paper"
        role="img"
        aria-label={`Animated bar chart of THE Top ${topN} institutions by overall score, ${minYear} to ${maxYear}.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <svg viewBox={`0 0 1000 ${height}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-auto font-sans">
          {/* Year overlay */}
          <text
            x={1000 - PADDING_X}
            y={56}
            textAnchor="end"
            className="font-serif"
            style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.02em' }}
            fill="var(--color-green)"
          >
            {yearLabel}
          </text>
          {/* Bars */}
          {positions.map((b) => {
            const yPos = (b.position - 1) * (BAR_HEIGHT + BAR_GAP) + 60;
            const xEnd = xScale(b.score);
            const fill = b.greaterChina
              ? 'var(--color-lime)'
              : b.country === 'United States'
              ? 'var(--color-green)'
              : b.country === 'United Kingdom'
              ? 'var(--color-teal)'
              : 'var(--color-green-light)';
            const opacity = b.position > topN + 0.5 ? 0 : 1;
            return (
              <g key={b.university} style={{ transition: 'opacity 0.3s', opacity }}>
                <rect
                  x={LABEL_WIDTH + PADDING_X}
                  y={yPos}
                  width={Math.max(0, xEnd - LABEL_WIDTH - PADDING_X)}
                  height={BAR_HEIGHT}
                  fill={fill}
                />
                {/* Institution label, anchored at right edge of label area */}
                <text
                  x={LABEL_WIDTH + PADDING_X - 8}
                  y={yPos + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  className="font-sans"
                  style={{ fontSize: 12 }}
                  fill="var(--color-ink)"
                >
                  <title>{`${b.university}, ${b.country}`}</title>
                  {b.university.length > 32 ? `${b.university.slice(0, 30)}…` : b.university}
                </text>
                {/* Score label inside or beside bar */}
                <text
                  x={xEnd + 6}
                  y={yPos + BAR_HEIGHT / 2 + 4}
                  className="font-sans"
                  style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums' }}
                  fill="var(--color-ink)"
                >
                  {b.score.toFixed(1)}
                </text>
              </g>
            );
          })}
          {/* X-axis baseline */}
          <line
            x1={LABEL_WIDTH + PADDING_X}
            y1={topN * (BAR_HEIGHT + BAR_GAP) + 60}
            x2={1000 - PADDING_X}
            y2={topN * (BAR_HEIGHT + BAR_GAP) + 60}
            stroke="var(--color-rule)"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 max-[640px]:gap-x-4">
        {[
          { color: 'var(--color-lime)', label: 'Greater China' },
          { color: 'var(--color-green)', label: 'United States' },
          { color: 'var(--color-teal)', label: 'United Kingdom' },
          { color: 'var(--color-green-light)', label: 'Other countries' },
        ].map((k) => (
          <div key={k.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="block w-3.5 h-2"
              style={{ background: k.color }}
            />
            <span className="ui-caps font-sans text-[10px] tracking-[1.5px] uppercase text-mute font-medium">
              {k.label}
            </span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-4 max-[640px]:flex-wrap">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase font-semibold text-paper bg-green px-4 py-2 hover:bg-green-deep transition-colors border-none"
        >
          {playing ? 'Pause' : yearIdx >= yearList.length - 1 && t > 0.99 ? 'Replay' : 'Play'}
        </button>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={Math.round(visibleYear)}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Year scrubber"
          className="flex-1 max-w-[480px] accent-[var(--color-lime)]"
        />
        <div className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase font-semibold text-mute tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {yearLabel}
        </div>
      </div>
      <div className="ui-caps font-sans text-[10px] tracking-[1.5px] uppercase text-mute mt-3">
        Press Space to play or pause. Arrow keys step year by year.
      </div>
    </div>
  );
}
