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
 * Single-row masthead. Folio strip + a centred wordmark line. No tab nav,
 * no search trigger, no edition meta, no volume number. Article pages get
 * the in-page section nav appended underneath.
 */
export function Masthead({ date, articleSections }: MastheadProps) {
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <Folio date={date} />
      <div className="border-b border-rule">
        <div className="mx-auto max-w-[1240px] px-8 py-5 flex items-center justify-center max-[640px]:px-5 max-[640px]:py-4">
          <Link
            href="/"
            className="font-serif font-normal text-green text-[34px] leading-none -tracking-[0.6px] no-underline border-none max-[640px]:text-[26px]"
          >
            Tamkeen
          </Link>
        </div>
      </div>
      {articleSections && articleSections.length > 0 ? (
        <ArticleNav sections={articleSections} />
      ) : null}
    </header>
  );
}
