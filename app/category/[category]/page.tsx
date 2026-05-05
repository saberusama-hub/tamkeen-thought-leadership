import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { Headline } from '@/components/Headline';
import { Eyebrow } from '@/components/Eyebrow';
import { SectionFrontHead } from '@/components/SectionFrontHead';
import { FeaturedArticle } from '@/components/FeaturedArticle';
import { FeaturedKpiStrip } from '@/components/FeaturedKpiStrip';
import {
  getAllArticles,
  getArticleBySlug,
  getArticlesByCategory,
} from '@/lib/articles';
import { buildSearchIndex } from '@/lib/search';
import {
  CATEGORY_HEADLINES,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  type CategoryId,
} from '@/types/article';
import { featuredKpis as decadeFeaturedKpis } from '@/content/articles/decade-that-reshaped-higher-education.data';

interface PageProps {
  params: Promise<{ category: string }>;
}

const VALID = new Set<CategoryId>(CATEGORY_KEYS);

export function generateStaticParams() {
  return CATEGORY_KEYS.map((c) => ({ category: c }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!VALID.has(category as CategoryId)) return { title: 'Category' };
  const meta = CATEGORY_LABELS[category as CategoryId];
  const head = CATEGORY_HEADLINES[category as CategoryId];
  return {
    title: meta.label,
    description: head.standfirst,
    alternates: { canonical: `/category/${category}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!VALID.has(category as CategoryId)) notFound();
  const cat = category as CategoryId;
  const allArticles = getAllArticles();
  const searchEntries = buildSearchIndex();

  if (cat === 'overall') {
    return <OverallView allArticles={allArticles} searchEntries={searchEntries} />;
  }

  const articles = getArticlesByCategory(cat);

  if (articles.length === 0) {
    return (
      <EmptyView cat={cat} allArticles={allArticles} searchEntries={searchEntries} />
    );
  }

  return (
    <LiveView cat={cat} articles={articles} allArticles={allArticles} searchEntries={searchEntries} />
  );
}

/* ---------- LIVE ---------- */

function LiveView({
  cat,
  articles,
  allArticles,
  searchEntries,
}: {
  cat: CategoryId;
  articles: ReturnType<typeof getAllArticles>;
  allArticles: ReturnType<typeof getAllArticles>;
  searchEntries: ReturnType<typeof buildSearchIndex>;
}) {
  const meta = CATEGORY_LABELS[cat];
  const head = CATEGORY_HEADLINES[cat];
  const featured = articles[0];
  const isRankings = cat === 'rankings';
  const featuredKpis = isRankings
    ? decadeFeaturedKpis
    : null;

  return (
    <>
      <Masthead activeTab={cat} searchEntries={searchEntries} />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[760px]:px-6">
        <section className="py-14 max-[760px]:py-9">
          <SectionFrontHead
            eyebrowParts={['Section', meta.label]}
            headline={head.text}
            italic={head.italic}
            standfirst={head.standfirst}
            volNumber={String(articles.length).padStart(2, '0')}
            volLine1={`${articles.length === 1 ? 'Article' : 'Articles'} in this section`}
            volLine2="Vol. 02 in commission"
          />

          {featured ? <FeaturedArticle article={getArticleBySlug(featured.slug)!} /> : null}

          {featuredKpis ? (
            <FeaturedKpiStrip kpis={featuredKpis} className="anim-up anim-up-d4" />
          ) : null}

          <div className="mt-16">
            <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0 mb-4 pb-3 border-b border-tamkeen">
              Coming next in {meta.label}
            </h2>
            <div className="grid grid-cols-4 gap-8 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
              {[
                'A pillar-by-pillar reading of the 2026 editions.',
                'Programme-level rankings: where the institution’s number is least useful.',
                'Subject leagues: what a high score in Engineering or Business actually measures.',
                'Sovereign rankings strategy: a five-country comparison.',
              ].map((title, i) => (
                <div
                  key={i}
                  className="border-t border-rule pt-3.5 flex flex-col gap-2.5 min-h-[130px]"
                >
                  <span className="font-sans text-[9.5px] tracking-[1.6px] uppercase font-bold text-ink-soft">
                    Forthcoming · No. 0{i + 2}
                  </span>
                  <span className="font-serif text-[19px] leading-[1.3] italic text-ink-mid">
                    {title}
                  </span>
                  <span className="font-mono text-[10.5px] text-accent-deep mt-auto tracking-[0.5px] inline-flex items-center gap-2">
                    <span aria-hidden className="block w-[5px] h-[5px] bg-accent rounded-full -translate-y-px" />
                    In commission
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer articles={allArticles} />
    </>
  );
}

/* ---------- EMPTY ---------- */

function EmptyView({
  cat,
  allArticles,
  searchEntries,
}: {
  cat: CategoryId;
  allArticles: ReturnType<typeof getAllArticles>;
  searchEntries: ReturnType<typeof buildSearchIndex>;
}) {
  const meta = CATEGORY_LABELS[cat];
  const head = CATEGORY_HEADLINES[cat];

  return (
    <>
      <Masthead activeTab={cat} searchEntries={searchEntries} />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[760px]:px-6">
        <section className="py-14 max-[760px]:py-9">
          <SectionFrontHead
            eyebrowParts={['Category', 'Tamkeen Thought Leadership']}
            headline={head.text}
            italic={head.italic}
            standfirst={head.standfirst}
            volNumber="00"
            volLine1="Articles in this section"
            volLine2="Volume 01 forthcoming"
          />

          <div className="anim-up anim-up-d3 py-16 pb-20 text-center border-y border-rule-soft my-6">
            <div className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-accent-deep mb-[18px]">
              In commission
            </div>
            <h3 className="font-serif text-[36px] leading-[1.2] font-normal italic text-tamkeen m-0 mb-4 max-w-[36ch] mx-auto max-[640px]:text-[26px]">
              The first volume in this section is being drafted.
            </h3>
            <p className="font-serif text-[16px] text-ink-mid max-w-[60ch] m-auto leading-[1.6]">
              We are working on the inaugural piece for {meta.label}. It will land in the
              publication schedule once it has cleared review.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-[880px] m-auto text-left max-[760px]:grid-cols-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-t border-rule pt-3.5 flex flex-col gap-2.5 min-h-[130px]"
                >
                  <span className="font-sans text-[9.5px] tracking-[1.6px] uppercase font-bold text-ink-soft">
                    {meta.label}
                  </span>
                  <span className="font-serif text-[19px] leading-[1.3] italic text-ink-mid">
                    Forthcoming
                  </span>
                  <span className="font-mono text-[10.5px] text-accent-deep mt-auto tracking-[0.5px] inline-flex items-center gap-2">
                    <span aria-hidden className="block w-[5px] h-[5px] bg-accent rounded-full -translate-y-px" />
                    In commission
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/category/rankings"
              className="font-serif italic text-tamkeen text-[17px] inline-flex items-center gap-2 border-b border-[rgba(0,61,43,0.25)] pb-px transition-[border-color,gap] duration-[180ms] hover:border-tamkeen hover:gap-3"
            >
              Meanwhile, read the current brief in <em>Rankings &amp; Strategy</em>{' '}
              <span aria-hidden className="not-italic">→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer articles={allArticles} />
    </>
  );
}

/* ---------- OVERALL ---------- */

function OverallView({
  allArticles,
  searchEntries,
}: {
  allArticles: ReturnType<typeof getAllArticles>;
  searchEntries: ReturnType<typeof buildSearchIndex>;
}) {
  const head = CATEGORY_HEADLINES.overall;
  const lead = allArticles[0] ?? null;

  return (
    <>
      <Masthead activeTab="overall" searchEntries={searchEntries} />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[760px]:px-6">
        <section className="py-14 max-[760px]:py-9">
          <SectionFrontHead
            eyebrowParts={['Vol. 01', 'The publication at a glance']}
            headline={head.text}
            italic={head.italic}
            standfirst={head.standfirst}
            volNumber={String(allArticles.length).padStart(2, '0')}
            volLine1={allArticles.length === 1 ? 'Article published' : 'Articles published'}
            volLine2={`${CATEGORY_KEYS.length - 1 - allArticles.length} volumes in commission`}
          />

          <div className="grid grid-cols-[1.4fr_1fr] gap-12 items-start max-[980px]:grid-cols-1 max-[980px]:gap-8">
            {lead ? (
              <div>
                <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0 mb-3.5 pb-3 border-b border-tamkeen">
                  The current brief
                </h2>
                <Link
                  href={`/articles/${lead.slug}`}
                  className="anim-up anim-up-d2 block py-[18px] border-b border-rule-soft group"
                >
                  <Eyebrow
                    number={`No. ${String(lead.categoryNumber).padStart(2, '0')}`}
                    parts={[CATEGORY_LABELS[lead.category].label.split(' & ')[0]]}
                    className="!mb-3.5"
                  />
                  <Headline
                    text={lead.title}
                    emphasis={lead.emphasis}
                    as="h3"
                    animate={false}
                    className="font-serif font-normal text-[38px] leading-[1.1] -tracking-[0.6px] text-tamkeen m-0 mb-3.5 group-hover:text-accent-deep transition-colors max-[640px]:text-[28px]"
                  />
                  <p className="font-serif text-[17px] leading-[1.55] italic text-ink-mid m-0 max-w-[56ch]">
                    {lead.dek}
                  </p>
                  <div className="mt-[18px] font-sans text-[10px] tracking-[1.5px] uppercase text-ink-soft font-semibold">
                    {lead.resolvedAuthors.map((a) => a.name).join(', ')} ·{' '}
                    {new Date(lead.publishedAt + 'T00:00:00Z').toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}{' '}
                    · {lead.readingTimeMinutes} min
                  </div>
                </Link>
              </div>
            ) : null}

            <aside>
              <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0 mb-3.5 pb-3 border-b border-tamkeen">
                The categories
              </h2>
              <ul className="list-none m-0 p-0">
                {CATEGORY_KEYS.filter((k) => k !== 'overall').map((k) => {
                  const isLive = allArticles.some((a) => a.category === k);
                  const liveCount = allArticles.filter((a) => a.category === k).length;
                  return (
                    <li
                      key={k}
                      className="py-3.5 border-b border-rule-soft grid grid-cols-[1fr_auto] gap-3 items-baseline"
                    >
                      <Link href={`/category/${k}`} className="block group">
                        <div
                          className={`font-sans text-[10px] tracking-[1.6px] uppercase font-bold mb-1 ${
                            isLive ? 'text-accent-deep' : 'text-ink-soft'
                          }`}
                        >
                          {isLive ? 'Now reading' : 'In commission'}
                        </div>
                        <div className="font-serif text-[17px] text-tamkeen leading-[1.35] group-hover:text-accent-deep transition-colors">
                          {CATEGORY_LABELS[k].label}
                        </div>
                      </Link>
                      <span
                        className={`font-mono text-[11px] ${
                          isLive ? 'text-tamkeen' : 'text-ink-soft'
                        }`}
                      >
                        {isLive ? String(liveCount).padStart(2, '0') : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <Footer articles={allArticles} />
    </>
  );
}
