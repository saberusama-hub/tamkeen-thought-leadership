import Link from 'next/link';
import type { Article } from '@/types/article';
import { CATEGORY_LABELS } from '@/types/article';
import { formatLongDate } from '@/lib/format';
import { Headline } from './Headline';
import { Eyebrow } from './Eyebrow';

interface HomepageHeroProps {
  article: Article;
}

export function HomepageHero({ article }: HomepageHeroProps) {
  const catLabel = CATEGORY_LABELS[article.category].label;

  return (
    <section className="py-14 pb-16 border-b-[3px] border-double border-tamkeen max-[760px]:py-9">
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-14 items-start max-[980px]:grid-cols-1 max-[980px]:gap-8">
        <div>
          <Eyebrow
            number={`No. ${String(article.categoryNumber).padStart(2, '0')}`}
            parts={[catLabel.split(' & ')[0], 'The lead']}
            animate
          />
          <Headline
            text={article.title}
            emphasis={article.emphasis}
            className="font-serif font-normal text-[84px] leading-[1.02] -tracking-[1.6px] text-tamkeen m-0 mb-7 max-w-[14ch] max-[980px]:text-[56px] max-[640px]:text-[42px]"
          />
          <p className="anim-up anim-up-d2 font-serif text-[22px] leading-[1.5] italic font-light text-ink-mid max-w-[60ch] m-0 mb-8 max-[640px]:text-[18px]">
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
              Read the brief <span aria-hidden className="not-italic text-accent">→</span>
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
    </section>
  );
}
