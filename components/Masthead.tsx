import Link from 'next/link';
import { Folio } from './Folio';
import { ArticleNav } from './ArticleNav';
import type { ArticleSection } from '@/types/article';

interface MastheadProps {
  date?: string;
  /** Article-page only: section anchors for the in-page TOC nav. */
  articleSections?: ArticleSection[];
}

/**
 * Sticky masthead. Dark green folio strip on top, paper-cream wordmark row
 * underneath, then on article pages the in-page section nav. No tab nav,
 * no search, no edition meta.
 */
export function Masthead({ date, articleSections }: MastheadProps) {
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <Folio date={date} />
      <div className="border-b border-green/20 bg-paper">
        <div className="mx-auto max-w-[1240px] px-8 py-5 flex items-center justify-center max-[640px]:px-5 max-[640px]:py-4">
          <Link
            href="/"
            className="font-serif font-medium text-green text-[40px] leading-none -tracking-[0.6px] no-underline border-none max-[760px]:text-[32px] max-[640px]:text-[26px]"
          >
            The Capability Review
          </Link>
        </div>
      </div>
      {articleSections && articleSections.length > 0 ? (
        <ArticleNav sections={articleSections} />
      ) : null}
    </header>
  );
}
