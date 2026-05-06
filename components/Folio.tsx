'use client';

import { useEffect, useState } from 'react';
import { formatLongDate } from '@/lib/format';

interface FolioProps {
  /** ISO date for the right-hand line. Pass for editorial datelines (e.g. an article publication date). When omitted, the dateline tracks the viewer's local "today". */
  date?: string;
  /** City of filing for the right-hand line. Defaults to Abu Dhabi. */
  city?: string;
}

function localTodayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Top dateline strip. Dark Tamkeen green background with paper text.
 * When `date` is omitted, the right-hand date tracks the viewer's local
 * "today" — refreshed at hydration and again at the next local midnight,
 * so a long-cached or long-idle page doesn't show a stale dateline.
 */
export function Folio({ date, city = 'Abu Dhabi' }: FolioProps) {
  const [today, setToday] = useState(() => date ?? localTodayIso());

  useEffect(() => {
    if (date) return;
    setToday(localTodayIso());
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 5, 0);
    const ms = Math.max(1000, nextMidnight.getTime() - now.getTime());
    const t = setTimeout(() => setToday(localTodayIso()), ms);
    return () => clearTimeout(t);
  }, [date]);

  return (
    <div className="bg-green text-paper">
      <div className="ui-caps mx-auto max-w-[1240px] px-8 py-2.5 flex items-center justify-between gap-6 font-sans text-[11px] tracking-[1.6px] uppercase max-[640px]:px-5 max-[640px]:text-[10px]">
        <span className="font-semibold">Tamkeen Thought Leadership</span>
        <span className="text-paper/80" suppressHydrationWarning>
          {formatLongDate(today)} <span className="text-paper/40 mx-2">·</span> {city}
        </span>
      </div>
    </div>
  );
}
