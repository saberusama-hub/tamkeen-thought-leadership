import type { Author } from '@/types/article';
import { formatLongDate } from '@/lib/format';

interface BylineProps {
  authors: Author[];
  filedFrom?: string;
  publishedAt: string;
}

/**
 * Used inside MDX where a flat byline still makes sense (legacy callers).
 * The article hero now renders its own dateline; this is no longer used at the top.
 */
export function Byline({ authors, filedFrom, publishedAt }: BylineProps) {
  return (
    <div className="font-sans text-[11px] tracking-[1.5px] uppercase text-mute font-medium">
      By <span className="text-ink font-semibold">{authors.map((a) => a.name).join(', ')}</span>
      {filedFrom ? (
        <>
          <span className="opacity-60 mx-2.5">·</span>
          {filedFrom}
        </>
      ) : null}
      <span className="opacity-60 mx-2.5">·</span>
      {formatLongDate(publishedAt)}
    </div>
  );
}
