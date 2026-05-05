import { formatLongDate, formatWeekday } from '@/lib/format';

interface FolioProps {
  date?: string;
  vol?: string;
}

export function Folio({ date, vol = 'Vol. 01' }: FolioProps) {
  const today = date ?? new Date().toISOString().slice(0, 10);
  const day = formatWeekday(today);
  const long = formatLongDate(today);
  return (
    <div className="bg-tamkeen text-paper">
      <div className="mx-auto max-w-[1240px] px-8 py-2 flex items-center justify-between gap-6 font-sans text-[10px] tracking-[1.6px] uppercase font-semibold">
        <span>Tamkeen · Thought Leadership · {vol}</span>
        <span className="opacity-[0.72] flex items-center gap-[18px] max-[640px]:hidden">
          <span>
            {day}, {long}
          </span>
          <span aria-hidden className="block w-1 h-1 bg-paper rounded-full opacity-50" />
          <span>Abu Dhabi</span>
          <span aria-hidden className="block w-1 h-1 bg-paper rounded-full opacity-50" />
          <span>Independent analysis</span>
        </span>
      </div>
    </div>
  );
}
