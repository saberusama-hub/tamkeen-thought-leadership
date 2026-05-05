import type { Article } from '@/types/article';
import { formatLongDate } from '@/lib/format';

interface ArticleHeroProps {
  article: Article;
}

/**
 * Render the title, splitting on the emphasis word so it can be set in italic
 * serif. No copper highlight, no colour change. The italic carries the weight.
 */
function renderTitle(title: string, emphasis?: string) {
  if (!emphasis) return title;
  const idx = title.toLowerCase().indexOf(emphasis.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic font-normal">{title.slice(idx, idx + emphasis.length)}</em>
      {title.slice(idx + emphasis.length)}
    </>
  );
}

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-[1240px] px-8 pt-16 pb-12 max-[640px]:px-5 max-[640px]:pt-10 max-[640px]:pb-8">
        {/* Single muted small-caps line: date, reading time. No category. */}
        <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-mute mb-8">
          {formatLongDate(article.publishedAt)}
          <span className="opacity-60 mx-2.5">·</span>
          {article.readingTimeMinutes} min read
        </div>

        <h1 className="font-serif font-normal text-[60px] leading-[1.1] -tracking-[0.6px] m-0 mb-7 text-ink max-w-[18ch] max-[760px]:text-[40px] max-[760px]:leading-[1.12] max-[640px]:text-[32px]">
          {renderTitle(article.title, article.emphasis)}
        </h1>

        <p className="font-serif text-[22px] leading-[1.5] italic text-ink max-w-[56ch] m-0 mb-8 max-[640px]:text-[18px]">
          {article.dek}
        </p>

        <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium">
          By{' '}
          <span className="text-ink font-semibold">
            {article.resolvedAuthors.map((a) => a.name).join(', ')}
          </span>
          {article.filedFrom ? (
            <>
              <span className="opacity-60 mx-2.5">·</span>
              Filed from {article.filedFrom}
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
