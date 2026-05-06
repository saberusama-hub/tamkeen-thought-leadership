import type { Article } from '@/types/article';
import { formatLongDate } from '@/lib/format';

interface ArticleClosingProps {
  article: Article;
}

/**
 * About-this-analysis closing block. Renders below the appendix in the
 * article column. Hairline rule on top, light green-pale wash, three short
 * lines: methodology summary, dataset note, citation hint, plus the
 * publication metadata.
 */
export function ArticleClosing({ article }: ArticleClosingProps) {
  return (
    <section
      aria-label="About this analysis"
      className="mt-20 mb-8 border-t border-green/30 pt-8 max-w-[68ch] mx-auto"
    >
      <div className="ui-caps font-sans text-[10.5px] tracking-[2px] uppercase font-semibold text-green mb-4">
        About this analysis
      </div>

      <p className="font-serif text-[16px] leading-[1.6] text-ink/90 m-0 mb-3">
        The argument rests on the published Top 500 of QS World University
        Rankings (2017 to 2026, ten editions) and Times Higher Education
        World University Rankings (2016 to 2026, eleven editions), supplemented
        by the World Bank R&amp;D-as-share-of-GDP indicator. All numerical
        claims are computed from the source datasets and cross-checked against
        a 28-institution truth panel.
      </p>

      <p className="font-serif text-[15px] leading-[1.55] text-mute m-0 mb-5">
        Where the published source disagrees with the underlying data, this
        article sides with the data. Discrepancies are recorded in the
        repository&rsquo;s claims-audit script.
      </p>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 ui-caps font-sans text-[11px] tracking-[1.5px] uppercase text-mute font-medium max-[640px]:grid-cols-1">
        <div>
          <span className="text-ink font-semibold">Authors:</span>{' '}
          {article.resolvedAuthors.map((a) => a.name).join(', ')}
        </div>
        {article.filedFrom ? (
          <div>
            <span className="text-ink font-semibold">Filed:</span> {article.filedFrom}
          </div>
        ) : null}
        <div>
          <span className="text-ink font-semibold">Published:</span>{' '}
          {formatLongDate(article.publishedAt)}
        </div>
        <div>
          <span className="text-ink font-semibold">Reading time:</span>{' '}
          {article.readingTimeMinutes} minutes
        </div>
      </div>
    </section>
  );
}
