import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { ArticleHero } from '@/components/ArticleHero';
import { ArticleLayout } from '@/components/ArticleLayout';
import { ProgressBar } from '@/components/ProgressBar';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';

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

  const mod = await import(`@/content/articles/${slug}.mdx`);
  const Body = mod.default as (props: Record<string, unknown>) => React.ReactNode;

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

  return (
    <>
      <ProgressBar />
      <Masthead date={article.publishedAt} articleSections={article.sections} />
      <main id="main-content">
        <ArticleHero article={article} />
        <ArticleLayout>
          <Body />
        </ArticleLayout>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </>
  );
}
