import { formatLongDate } from '@/lib/format';

interface FolioProps {
  /** ISO date for the right-hand line. Defaults to today. */
  date?: string;
  /** City of filing for the right-hand line. Defaults to Abu Dhabi. */
  city?: string;
}

/**
 * Top dateline. Two columns. Brand wordmark on the left, date and city on the right.
 * No volume number, no edition number, no "Independent analysis" tagline.
 */
export function Folio({ date, city = 'Abu Dhabi' }: FolioProps) {
  const today = date ?? new Date().toISOString().slice(0, 10);
  return (
    <div className="border-b border-rule">
      <div className="mx-auto max-w-[1240px] px-8 py-3 flex items-center justify-between gap-6 font-sans text-[11px] tracking-[1.4px] uppercase text-mute max-[640px]:px-5 max-[640px]:text-[10px]">
        <span className="text-green font-semibold">Tamkeen Thought Leadership</span>
        <span>
          {formatLongDate(today)} <span className="opacity-60 mx-2">·</span> {city}
        </span>
      </div>
    </div>
  );
}
