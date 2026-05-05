import Link from 'next/link';
import { formatLongDate, formatWeekday } from '@/lib/format';
import { ArticleNav } from './ArticleNav';
import type { ArticleSection } from '@/types/article';

interface MastheadProps {
  edition?: { number: number; readingMinutes: number; series: string };
  date?: string;
  articleSections?: ArticleSection[];
  activeNav?: 'latest' | 'education' | 'workforce' | 'innovation' | 'capability' | 'about';
}

const NAV_ITEMS: { label: string; href: string; key: string }[] = [
  { label: 'Latest', href: '/', key: 'latest' },
  { label: 'Education', href: '/series/education', key: 'education' },
  { label: 'Workforce', href: '/series/workforce', key: 'workforce' },
  { label: 'Innovation', href: '/series/innovation', key: 'innovation' },
  { label: 'Capability', href: '/series/capability', key: 'capability' },
  { label: 'About', href: '/about', key: 'about' },
];

export function Masthead({ edition, date, articleSections, activeNav }: MastheadProps) {
  const today = date ?? new Date().toISOString().slice(0, 10);
  const dateLine = `${formatWeekday(today)}, ${formatLongDate(today)}`;
  const series = edition?.series ?? 'The Education Series · Vol. 01';

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-tamkeen">
      <div className="bg-tamkeen text-paper">
        <div className="mx-auto max-w-[1180px] px-8 py-2 flex items-center justify-between font-sans text-[10.5px] uppercase font-semibold tracking-[1.8px]">
          <span>Tamkeen · Thought Leadership · {series}</span>
          <span className="opacity-70">{dateLine}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-8 pt-[18px] pb-4 flex items-end justify-between border-b border-rule-soft max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2.5">
        <Link
          href="/"
          className="font-serif font-semibold text-tamkeen no-underline border-none hover:bg-transparent text-[30px] leading-none -tracking-[0.5px] max-[760px]:text-[24px]"
        >
          Tamkeen
          <span className="font-sans text-[12px] font-semibold tracking-[2.5px] uppercase text-ink-soft ml-3.5 pl-3.5 border-l border-rule inline-block leading-none -translate-y-[3px] max-[760px]:block max-[760px]:ml-0 max-[760px]:pl-0 max-[760px]:border-none max-[760px]:mt-1.5 max-[760px]:translate-y-0">
            Thought Leadership
          </span>
        </Link>
        {edition ? (
          <div className="font-sans text-[11px] text-ink-soft uppercase tracking-[1.5px] font-medium text-right leading-[1.5] max-[760px]:text-left">
            Edition <strong className="text-ink font-semibold">No. {String(edition.number).padStart(2, '0')}</strong>
            &nbsp;·&nbsp; <strong className="text-ink font-semibold">{edition.readingMinutes} min</strong> read
            <br />
            Independent analysis &nbsp;·&nbsp; <strong className="text-ink font-semibold">Public</strong>
          </div>
        ) : (
          <div className="font-sans text-[11px] text-ink-soft uppercase tracking-[1.5px] font-medium text-right leading-[1.5] max-[760px]:text-left">
            Independent analysis &nbsp;·&nbsp; <strong className="text-ink font-semibold">Public</strong>
            <br />
            Long-form, data-driven
          </div>
        )}
      </div>

      <nav className="mx-auto max-w-[1180px] px-8 py-2.5 flex gap-8 font-sans text-[11px] uppercase tracking-[1.6px] font-semibold max-[760px]:gap-[18px] max-[760px]:overflow-x-auto max-[760px]:px-6">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`no-underline border-none py-1 hover:bg-transparent ${
              item.key === activeNav ? 'text-tamkeen' : 'text-ink-mid hover:text-tamkeen'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {articleSections && articleSections.length > 0 ? (
        <ArticleNav sections={articleSections} />
      ) : null}
    </header>
  );
}
