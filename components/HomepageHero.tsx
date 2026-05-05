import Link from 'next/link';
import type { Article } from '@/types/article';
import { SERIES_LABELS } from '@/types/article';
import { Eyebrow } from './Eyebrow';
import { formatLongDate } from '@/lib/format';

interface HomepageHeroProps {
  article: Article;
}

function renderTitleParts(title: string, italic?: string) {
  if (!italic) return title;
  const idx = title.toLowerCase().indexOf(italic.toLowerCase());
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic text-copper-deep font-normal">
        {title.slice(idx, idx + italic.length)}
      </em>
      {title.slice(idx + italic.length)}
    </>
  );
}

export function HomepageHero({ article }: HomepageHeroProps) {
  const seriesLabel = `${SERIES_LABELS[article.series].label} · No. ${String(article.seriesNumber).padStart(2, '0')}`;
  return (
    <section className="px-8 pt-12 pb-12 border-b-[3px] border-double border-tamkeen bg-paper max-[760px]:px-6">
      <div className="mx-auto max-w-[1180px] grid grid-cols-[3fr_1fr] gap-12 max-[920px]:grid-cols-1 max-[920px]:gap-8">
        <div>
          <Eyebrow>{seriesLabel}</Eyebrow>
          <h1 className="font-serif font-normal text-[72px] leading-[1.04] -tracking-[1px] m-0 mb-7 text-tamkeen max-[760px]:text-[42px]">
            {renderTitleParts(article.title, article.emphasis)}
          </h1>
          <p className="font-serif text-[22px] leading-[1.55] text-ink max-w-[820px] m-0 mb-8 italic max-[760px]:text-[18px]">
            {article.dek}
          </p>
          <div className="border-t border-rule pt-[18px] flex flex-wrap gap-[30px] font-sans text-[10.5px] uppercase tracking-[1.6px] text-ink-soft font-semibold">
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
              className="font-serif italic text-tamkeen text-[22px] border-none hover:text-copper-deep hover:bg-transparent inline-flex items-center gap-1.5"
            >
              Read the brief
              <span aria-hidden className="not-italic text-copper">→</span>
            </Link>
          </div>
        </div>
        <aside aria-label="In this edition" className="border-l border-rule pl-8 max-[920px]:border-l-0 max-[920px]:border-t max-[920px]:pl-0 max-[920px]:pt-6">
          <h2 className="font-sans text-[11px] tracking-[2.2px] uppercase font-bold text-tamkeen m-0 mb-3">
            In this edition
          </h2>
          <ol className="list-none m-0 p-0">
            {article.sections.map((s) => (
              <li
                key={s.id}
                className="py-2.5 border-b border-rule-soft last:border-b-0 flex gap-3 items-baseline"
              >
                <span className="font-mono text-[11px] text-copper-deep font-semibold tabular-nums w-7">
                  § {s.number}
                </span>
                <Link
                  href={`/articles/${article.slug}#${s.id}`}
                  className="font-serif text-[15px] text-tamkeen border-none hover:text-copper-deep hover:bg-transparent leading-[1.4]"
                >
                  {s.label ?? s.title}
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
