import Link from 'next/link';
import { Folio } from './Folio';
import { TabNav } from './TabNav';
import { ArticleNav } from './ArticleNav';
import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryId } from '@/types/article';
import type { ArticleSection } from '@/types/article';
import type { SearchEntry } from '@/lib/search';

interface MastheadProps {
  date?: string;
  activeTab?: CategoryId;
  articleSections?: ArticleSection[];
  searchEntries?: SearchEntry[];
  edition?: { number: number; subtitle?: string };
  rightMeta?: { strong: string; line: string };
}

export function Masthead({
  date,
  activeTab,
  articleSections,
  searchEntries = [],
  edition = { number: 1, subtitle: 'Schools & Universities' },
  rightMeta = { strong: 'Long-form', line: 'data-driven' },
}: MastheadProps) {
  const tabs = CATEGORY_KEYS.map((key) => ({
    key,
    label: CATEGORY_LABELS[key].short,
    href: key === 'overall' ? '/' : `/category/${key}`,
  }));

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-tamkeen">
      <Folio date={date} />

      <div className="mx-auto max-w-[1240px] px-8 pt-[22px] pb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-rule-soft max-[980px]:grid-cols-1 max-[980px]:gap-3">
        <div className="font-sans text-[10px] tracking-[1.5px] uppercase text-ink-soft font-medium leading-[1.6] text-left max-[980px]:hidden">
          Edition <strong className="text-ink font-semibold">No. {String(edition.number).padStart(2, '0')}</strong>
          <br />
          <span className="opacity-70">{edition.subtitle}</span>
        </div>

        <Link
          href="/"
          className="font-serif font-normal text-tamkeen text-[44px] leading-none -tracking-[1px] text-center inline-flex items-baseline gap-3.5 justify-center"
        >
          Tamkeen
          <span className="font-sans text-[10.5px] font-semibold tracking-[2.6px] uppercase text-ink-soft pl-3.5 border-l border-rule self-center -translate-y-[2px]">
            Thought Leadership
          </span>
        </Link>

        <div className="font-sans text-[10px] tracking-[1.5px] uppercase text-ink-soft font-medium leading-[1.6] text-right max-[980px]:hidden">
          <strong className="text-ink font-semibold">{rightMeta.strong}</strong>, {rightMeta.line}
          <br />
          <span className="opacity-70">Filed from Abu Dhabi</span>
        </div>
      </div>

      <TabNav tabs={tabs} activeKey={activeTab} searchEntries={searchEntries} />

      {articleSections && articleSections.length > 0 ? (
        <ArticleNav sections={articleSections} />
      ) : null}
    </header>
  );
}
