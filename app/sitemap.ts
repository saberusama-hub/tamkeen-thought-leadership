import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tamkeen-thought-leadership.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const articleEntries = articles.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));
  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: 'yearly', priority: 0.4 },
    ...articleEntries,
  ];
}
