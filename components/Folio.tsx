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
    <div className="bg-lime text-ink">
      <div className="mx-auto max-w-[1240px] px-8 py-2 flex items-center justify-between gap-6 max-[640px]:px-5 max-[640px]:py-1.5">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tamkeen-logo-mono.svg"
            alt="Tamkeen"
            width={200}
            height={98}
            className="h-7 w-auto text-ink max-[640px]:h-5"
          />
          <span aria-hidden className="hidden sm:block h-5 w-px bg-ink/30" />
          <span className="hidden sm:inline ui-caps font-sans text-[11px] tracking-[1.6px] uppercase font-semibold whitespace-nowrap">
            Thought Leadership
          </span>
        </div>
        <span
          className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase text-ink/85 text-right whitespace-nowrap max-[640px]:text-[10px] max-[640px]:tracking-[1.2px]"
          suppressHydrationWarning
        >
          {formatLongDate(today)} <span className="text-ink/50 mx-2">·</span> {city}
        </span>
      </div>
    </div>
  );
}
