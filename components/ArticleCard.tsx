import Link from 'next/link';
import type { Article } from '@/types/article';
import { SERIES_LABELS } from '@/types/article';
import { formatLongDate } from '@/lib/format';

interface ArticleCardProps {
  article: Article;
  variant?: 'listing' | 'series';
}

export function ArticleCard({ article, variant = 'listing' }: ArticleCardProps) {
  const seriesLabel = `${SERIES_LABELS[article.series].label} · No. ${String(article.seriesNumber).padStart(2, '0')}`;
  return (
    <article
      className={`py-7 border-y border-rule-soft ${variant === 'series' ? '' : ''}`}
    >
      <div className="font-sans text-[10.5px] tracking-[1.8px] uppercase text-copper-deep font-bold mb-2">
        {seriesLabel}
      </div>
      <Link
        href={`/articles/${article.slug}`}
        className="font-serif text-[24px] font-medium text-tamkeen border-none hover:text-copper-deep hover:bg-transparent leading-[1.25] block mb-2 max-[760px]:text-[20px]"
      >
        {article.title}
      </Link>
      <p className="font-serif italic text-[16px] text-ink-mid m-0 mb-3 max-w-[640px] leading-[1.5]">
        {article.dek}
      </p>
      <div className="font-sans text-[10.5px] tracking-[1.5px] uppercase text-ink-soft font-semibold flex gap-5 flex-wrap">
        <span>
          <strong className="text-ink mr-2">By</strong>
          {article.resolvedAuthors.map((a) => a.name).join(', ')}
        </span>
        <span>{formatLongDate(article.publishedAt)}</span>
        <span>{article.readingTimeMinutes} min read</span>
      </div>
    </article>
  );
}
