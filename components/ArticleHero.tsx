import type { Article } from '@/types/article';
import { formatLongDate } from '@/lib/format';
import { ScrollReveal } from './ScrollReveal';

interface ArticleHeroProps {
  article: Article;
}

/**
 * Render the title with the emphasis word in serif italic. The italic plus
 * a slightly darker green carry the weight; no coloured highlight.
 */
function renderTitle(title: string, emphasis?: string) {
  if (!emphasis) return title;
  const idx = title.toLowerCase().indexOf(emphasis.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic font-normal text-green-mid">{title.slice(idx, idx + emphasis.length)}</em>
      {title.slice(idx + emphasis.length)}
    </>
  );
}

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <header className="border-b border-green/20">
      <div className="mx-auto max-w-[1240px] px-8 pt-16 pb-14 max-[640px]:px-5 max-[640px]:pt-10 max-[640px]:pb-9">
        <div className="max-w-[820px] mx-auto">
          {/* Hairline + small-caps line: date, reading time. No category. */}
          <ScrollReveal className="flex items-center gap-4 mb-9">
            <span aria-hidden className="block h-px w-10 bg-green-light" />
            <div className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium">
              {formatLongDate(article.publishedAt)}
              <span className="text-mute/60 mx-2.5">·</span>
              {article.readingTimeMinutes} min read
            </div>
          </ScrollReveal>

          <ScrollReveal
            as="h1"
            className="font-serif font-normal text-[60px] leading-[1.08] -tracking-[0.6px] m-0 mb-8 text-green max-w-[26ch] max-[760px]:text-[40px] max-[760px]:leading-[1.12] max-[640px]:text-[32px]"
          >
            {renderTitle(article.title, article.emphasis)}
          </ScrollReveal>

          <ScrollReveal
            as="p"
            delayMs={120}
            className="font-serif text-[22px] leading-[1.5] italic text-ink/85 max-w-[56ch] m-0 mb-10 max-[640px]:text-[18px]"
          >
            {article.dek}
          </ScrollReveal>

          <ScrollReveal
            delayMs={200}
            className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase text-mute font-medium"
          >
            By{' '}
            <span className="text-ink font-semibold">
              {article.resolvedAuthors.map((a) => a.name).join(', ')}
            </span>
            {article.filedFrom ? (
              <>
                <span className="text-mute/60 mx-2.5">·</span>
                Filed from {article.filedFrom}
              </>
            ) : null}
          </ScrollReveal>
        </div>
      </div>
    </header>
  );
}
