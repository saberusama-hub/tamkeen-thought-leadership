import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { ArticleHero } from '@/components/ArticleHero';
import { ArticleLayout } from '@/components/ArticleLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import { SERIES_LABELS } from '@/types/article';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article not found' };
  const url = `/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.dek,
      url,
      publishedTime: article.publishedAt,
      authors: article.resolvedAuthors.map((a) => a.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.dek,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = getAllArticles();

  const mod = await import(`@/content/articles/${slug}.mdx`);
  const Body = mod.default as (props: Record<string, unknown>) => React.ReactNode;

  const seriesContext = `${SERIES_LABELS[article.series].label} · Vol. ${String(article.seriesNumber).padStart(2, '0')}`;
  const navMap: Record<string, 'education' | 'workforce' | 'innovation' | 'capability'> = {
    education: 'education',
    workforce: 'workforce',
    innovation: 'innovation',
    capability: 'capability',
  };

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    datePublished: article.publishedAt,
    author: article.resolvedAuthors.map((a) => ({ '@type': 'Person', name: a.name })),
    publisher: {
      '@type': 'Organization',
      name: 'Tamkeen Thought Leadership',
    },
  };

  const coverage = article.tags?.includes('rankings') ? '2016 to 2026 · Top 500' : undefined;
  const dataset = '1,038 institutions · 96 countries';

  return (
    <>
      <ProgressBar />
      <Masthead
        edition={{
          number: article.seriesNumber,
          readingMinutes: article.readingTimeMinutes,
          series: seriesContext,
        }}
        date={article.publishedAt}
        articleSections={article.sections}
        activeNav={navMap[article.series]}
      />
      <main id="main-content">
        <ArticleHero article={article} coverage={coverage} dataset={dataset} />
        <ArticleLayout>
          <Body />
        </ArticleLayout>
      </main>
      <Footer
        contextSections={article.sections.map((s) => ({ id: s.id, title: s.label ?? s.title }))}
        contextSeries={`Thought Leadership · ${SERIES_LABELS[article.series].label}`}
        articles={allArticles}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </>
  );
}
