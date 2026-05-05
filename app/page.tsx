import type { Metadata } from 'next';
import Link from 'next/link';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { HomepageHero } from '@/components/HomepageHero';
import { ArticleCard } from '@/components/ArticleCard';
import { getAllArticles, getLeadArticle } from '@/lib/articles';
import { SERIES_LABELS } from '@/types/article';

export const metadata: Metadata = {
  title: 'Tamkeen Thought Leadership',
  description:
    'Tamkeen Thought Leadership — Independent analysis on policy, capability, and strategy.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const articles = getAllArticles();
  const lead = getLeadArticle();

  return (
    <>
      <Masthead activeNav="latest" />
      <main id="main-content">
        {lead ? <HomepageHero article={lead} /> : null}

        <section className="bg-paper-shade px-8 py-9 max-[760px]:px-6">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="font-sans text-[11px] tracking-[2.2px] uppercase font-bold text-tamkeen m-0 mb-5">
              The Series
            </h2>
            <div className="grid grid-cols-4 gap-6 max-[920px]:grid-cols-2 max-[600px]:grid-cols-1">
              {(Object.keys(SERIES_LABELS) as Array<keyof typeof SERIES_LABELS>).map((key) => {
                const seriesArticles = articles.filter((a) => a.series === key);
                const has = seriesArticles.length > 0;
                return (
                  <Link
                    key={key}
                    href={`/series/${key}`}
                    className={`block border-t-[2px] pt-3 border-none no-underline hover:bg-transparent ${
                      has ? 'border-t-tamkeen' : 'border-t-rule'
                    }`}
                  >
                    <span
                      className="font-sans text-[10px] tracking-[1.8px] uppercase font-bold block mb-1"
                      style={{ color: has ? 'var(--color-tamkeen)' : 'var(--color-ink-soft)' }}
                    >
                      {has ? `No. 0${seriesArticles[0].seriesNumber}` : 'Forthcoming'}
                    </span>
                    <span
                      className="font-serif text-[18px] font-medium block leading-[1.3]"
                      style={{ color: has ? 'var(--color-tamkeen)' : 'var(--color-ink-soft)' }}
                    >
                      {has ? seriesArticles[0].title : SERIES_LABELS[key].navLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1180px] px-8 py-12 grid grid-cols-3 gap-12 max-[920px]:grid-cols-1 max-[760px]:px-6">
          <section>
            <h2 className="font-sans text-[11px] tracking-[2.2px] uppercase font-bold text-tamkeen m-0 mb-3 pb-3 border-b border-tamkeen">
              Most read
            </h2>
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[2.2px] uppercase font-bold text-tamkeen m-0 mb-3 pb-3 border-b border-tamkeen">
              Forthcoming
            </h2>
            <ul className="list-none m-0 p-0">
              {(Object.keys(SERIES_LABELS) as Array<keyof typeof SERIES_LABELS>)
                .filter((k) => !articles.some((a) => a.series === k))
                .map((k) => (
                  <li
                    key={k}
                    className="py-4 border-b border-rule-soft last:border-b-0"
                  >
                    <div className="font-sans text-[10.5px] tracking-[1.8px] uppercase text-copper-deep font-bold mb-1">
                      {SERIES_LABELS[k].label}
                    </div>
                    <div className="font-serif text-[18px] text-ink-mid italic">
                      Forthcoming volume
                    </div>
                  </li>
                ))}
            </ul>
          </section>
          <section>
            <h2 className="font-sans text-[11px] tracking-[2.2px] uppercase font-bold text-tamkeen m-0 mb-3 pb-3 border-b border-tamkeen">
              About this publication
            </h2>
            <p className="font-serif text-[16px] leading-[1.55] text-ink m-0 mb-3">
              <em>Tamkeen Thought Leadership</em> publishes long-form, data-driven analyses on
              policy, capability, and strategy. Filed independently from Abu Dhabi.
            </p>
            <p className="font-serif text-[15px] leading-[1.55] text-ink-mid m-0">
              <Link href="/about" className="text-tamkeen border-b border-tamkeen/30">
                Read more about the project →
              </Link>
            </p>
          </section>
        </div>
      </main>
      <Footer articles={articles} />
    </>
  );
}
