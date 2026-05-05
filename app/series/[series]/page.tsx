import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { Eyebrow } from '@/components/Eyebrow';
import { ArticleCard } from '@/components/ArticleCard';
import { getAllArticles, getArticlesBySeries } from '@/lib/articles';
import { SERIES_LABELS, type SeriesId } from '@/types/article';

const VALID_SERIES: SeriesId[] = ['education', 'workforce', 'innovation', 'capability'];

interface PageProps {
  params: Promise<{ series: string }>;
}

export function generateStaticParams() {
  return VALID_SERIES.map((s) => ({ series: s }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { series } = await params;
  if (!VALID_SERIES.includes(series as SeriesId)) return { title: 'Series' };
  const meta = SERIES_LABELS[series as SeriesId];
  return {
    title: meta.label,
    description: `${meta.label} — articles in the series.`,
    alternates: { canonical: `/series/${series}` },
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { series } = await params;
  if (!VALID_SERIES.includes(series as SeriesId)) notFound();
  const seriesId = series as SeriesId;

  const articles = getArticlesBySeries(seriesId);
  const allArticles = getAllArticles();
  const meta = SERIES_LABELS[seriesId];

  return (
    <>
      <Masthead activeNav={seriesId} />
      <main id="main-content" className="mx-auto max-w-[1180px] px-8 py-16 max-[760px]:px-6">
        <Eyebrow>{meta.label}</Eyebrow>
        <h1 className="font-serif text-[56px] font-normal text-tamkeen leading-[1.1] -tracking-[0.5px] m-0 mb-6 max-[760px]:text-[36px]">
          {meta.label}
        </h1>
        {articles.length > 0 ? (
          <div>
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} variant="series" />
            ))}
          </div>
        ) : (
          <div className="border-t-2 border-tamkeen pt-9 mt-6">
            <p className="font-sans text-[11px] tracking-[2px] uppercase font-bold text-copper-deep mb-3">
              Forthcoming
            </p>
            <p className="font-serif text-[24px] italic text-ink-mid leading-[1.4] max-w-[700px]">
              No volume in the {meta.navLabel} series has been published yet. The first volume is
              in preparation. Check back soon.
            </p>
          </div>
        )}
      </main>
      <Footer articles={allArticles} />
    </>
  );
}
