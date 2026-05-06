import { formatLongDate } from '@/lib/format';

interface FolioProps {
  /** ISO date for the right-hand line. Defaults to today. */
  date?: string;
  /** City of filing for the right-hand line. Defaults to Abu Dhabi. */
  city?: string;
}

/**
 * Top dateline strip. Dark Tamkeen green background with paper text.
 * Two columns. Brand line on the left, date and city on the right.
 * No volume number, no "Independent analysis" tagline.
 */
export function Folio({ date, city = 'Abu Dhabi' }: FolioProps) {
  const today = date ?? new Date().toISOString().slice(0, 10);
  return (
    <div className="bg-green text-paper">
      <div className="mx-auto max-w-[1240px] px-8 py-2.5 flex items-center justify-between gap-6 font-sans text-[11px] tracking-[1.6px] uppercase max-[640px]:px-5 max-[640px]:text-[10px]">
        <span className="font-semibold">Tamkeen Thought Leadership</span>
        <span className="text-paper/80">
          {formatLongDate(today)} <span className="text-paper/40 mx-2">·</span> {city}
        </span>
      </div>
    </div>
  );
}
