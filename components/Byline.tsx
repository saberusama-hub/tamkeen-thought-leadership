import type { Author } from '@/types/article';
import { formatLongDate } from '@/lib/format';

interface BylineProps {
  authors: Author[];
  filedFrom?: string;
  publishedAt: string;
  coverage?: string;
  dataset?: string;
}

export function Byline({ authors, filedFrom, publishedAt, coverage, dataset }: BylineProps) {
  const items = [
    { label: 'By', value: authors.map((a) => a.name).join(', ') },
    filedFrom ? { label: 'Filed', value: `${filedFrom} · ${formatLongDate(publishedAt)}` } : null,
    coverage ? { label: 'Coverage', value: coverage } : null,
    dataset ? { label: 'Dataset', value: dataset } : null,
  ].filter((x): x is { label: string; value: string } => Boolean(x));

  return (
    <div className="border-t border-rule pt-[18px] flex flex-wrap gap-[30px] font-sans text-[10.5px] uppercase tracking-[1.6px] text-ink-soft font-semibold max-[760px]:gap-4 max-[760px]:text-[10px]">
      {items.map((it) => (
        <div key={it.label}>
          <strong className="text-ink font-bold mr-2">{it.label}</strong>
          {it.value}
        </div>
      ))}
    </div>
  );
}
