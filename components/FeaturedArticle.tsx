import Link from 'next/link';
import type { Article } from '@/types/article';
import { formatLongDate } from '@/lib/format';
import { Eyebrow } from './Eyebrow';
import { Headline } from './Headline';

interface FeaturedArticleProps {
  article: Article;
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-14 items-start py-2 pb-14 max-[980px]:grid-cols-1 max-[980px]:gap-8">
      <div>
        <Eyebrow
          number={`No. ${String(article.categoryNumber).padStart(2, '0')}`}
          parts={['Featured', formatLongDate(article.publishedAt)]}
          animate
        />
        <Headline
          text={article.title}
          emphasis={article.emphasis}
          className="font-serif font-normal text-[60px] leading-[1.05] -tracking-[1.2px] text-tamkeen m-0 mb-6 max-[980px]:text-[40px]"
        />
        <p className="anim-up anim-up-d2 font-serif text-[20px] leading-[1.5] italic text-ink-mid max-w-[56ch] m-0 mb-7 max-[640px]:text-[18px]">
          {article.dek}
        </p>
        <div className="anim-up anim-up-d3 border-t border-rule pt-[18px] flex flex-wrap gap-8 font-sans text-[10px] tracking-[1.5px] uppercase font-semibold text-ink-soft">
          <div>
            <strong className="text-ink font-bold mr-2">By</strong>
            {article.resolvedAuthors.map((a) => a.name).join(', ')}
          </div>
          {article.filedFrom ? (
            <div>
              <strong className="text-ink font-bold mr-2">Filed</strong>
              {article.filedFrom} · {formatLongDate(article.publishedAt)}
            </div>
          ) : null}
          <div>
            <strong className="text-ink font-bold mr-2">Reading</strong>
            {article.readingTimeMinutes} min
          </div>
        </div>
        <div className="mt-9">
          <Link
            href={`/articles/${article.slug}`}
            className="anim-up anim-up-d4 group inline-flex items-center gap-2.5 font-serif italic text-[21px] text-tamkeen font-normal transition-[color,gap] duration-200 hover:text-accent-deep hover:gap-4"
          >
            Read the full brief <span aria-hidden className="not-italic text-accent">→</span>
          </Link>
        </div>
      </div>

      <aside
        aria-label="In this edition"
        className="anim-up anim-up-d3 border-l border-rule pl-8 max-[980px]:border-l-0 max-[980px]:border-t max-[980px]:pl-0 max-[980px]:pt-6"
      >
        <h2 className="font-sans text-[10.5px] tracking-[2.2px] uppercase font-bold text-tamkeen m-0 mb-3.5">
          In this edition
        </h2>
        <ol className="list-none m-0 p-0">
          {article.sections.map((s) => (
            <li
              key={s.id}
              className="border-b border-rule-soft last:border-b-0 [&:has(a:hover)]:[padding-left:6px] transition-[padding] duration-200"
            >
              <Link
                href={`/articles/${article.slug}#${s.id}`}
                className="py-[11px] flex gap-3.5 items-baseline group"
              >
                <span className="font-mono text-[10.5px] text-accent-deep font-semibold min-w-[28px] tabular-nums">
                  § {s.number}
                </span>
                <span className="font-serif text-[14.5px] text-tamkeen leading-[1.4] group-hover:text-accent-deep transition-colors">
                  {s.label ?? s.title}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
