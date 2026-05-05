import type { Article } from '@/types/article';
import { CATEGORY_LABELS } from '@/types/article';
import { Eyebrow } from './Eyebrow';
import { Byline } from './Byline';
import { Headline } from './Headline';

interface ArticleHeroProps {
  article: Article;
  coverage?: string;
  dataset?: string;
}

export function ArticleHero({ article, coverage, dataset }: ArticleHeroProps) {
  const catLabel = CATEGORY_LABELS[article.category].label;
  const catNumber = `No. ${String(article.categoryNumber).padStart(2, '0')}`;

  return (
    <header className="px-8 pt-16 pb-12 border-b-[3px] border-double border-tamkeen bg-paper max-[760px]:px-6 max-[760px]:pt-10 max-[760px]:pb-9">
      <div className="mx-auto max-w-[1240px]">
        <Eyebrow number={catNumber} parts={[catLabel.split(' & ')[0], 'The brief']} animate />
        <Headline
          text={article.title}
          emphasis={article.emphasis}
          className="font-serif font-normal text-[72px] leading-[1.04] -tracking-[1px] m-0 mb-7 text-tamkeen max-w-[1100px] max-[760px]:text-[42px]"
        />
        <p className="anim-up anim-up-d2 font-serif text-[22px] leading-[1.55] text-ink-mid max-w-[840px] m-0 mb-8 italic max-[760px]:text-[18px]">
          {article.dek}
        </p>
        <div className="anim-up anim-up-d3">
          <Byline
            authors={article.resolvedAuthors}
            filedFrom={article.filedFrom}
            publishedAt={article.publishedAt}
            coverage={coverage}
            dataset={dataset}
          />
        </div>
      </div>
    </header>
  );
}
