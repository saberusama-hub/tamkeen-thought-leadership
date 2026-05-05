import type { Article } from '@/types/article';
import { Eyebrow } from './Eyebrow';
import { Byline } from './Byline';
import { SERIES_LABELS } from '@/types/article';

interface ArticleHeroProps {
  article: Article;
  coverage?: string;
  dataset?: string;
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

export function ArticleHero({ article, coverage, dataset }: ArticleHeroProps) {
  const seriesLabel = `${SERIES_LABELS[article.series].label} · No. ${String(article.seriesNumber).padStart(2, '0')}`;
  return (
    <header className="px-8 pt-16 pb-12 border-b-[3px] border-double border-tamkeen bg-paper max-[760px]:px-6 max-[760px]:pt-10 max-[760px]:pb-9">
      <div className="mx-auto max-w-[1180px]">
        <Eyebrow>{seriesLabel}</Eyebrow>
        <h1 className="font-serif font-normal text-[72px] leading-[1.04] -tracking-[1px] m-0 mb-7 text-tamkeen max-w-[1100px] max-[760px]:text-[42px]">
          {renderTitleParts(article.title, article.emphasis)}
        </h1>
        <p className="font-serif text-[22px] leading-[1.55] text-ink max-w-[840px] m-0 mb-8 italic max-[760px]:text-[18px]">
          {article.dek}
        </p>
        <Byline
          authors={article.resolvedAuthors}
          filedFrom={article.filedFrom}
          publishedAt={article.publishedAt}
          coverage={coverage}
          dataset={dataset}
        />
      </div>
    </header>
  );
}
