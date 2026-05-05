import { getAllArticles } from './articles';
import { CATEGORY_LABELS, CATEGORY_KEYS, type CategoryId } from '@/types/article';
import { formatLongDate } from './format';

export type SearchEntry =
  | {
      type: 'article';
      slug: string;
      title: string;
      blob: string;
      categoryKey: CategoryId;
      categoryLabel: string;
      date: string;
      minutes: number;
    }
  | {
      type: 'forthcoming';
      categoryKey: CategoryId;
      categoryLabel: string;
      title: string;
      blob: string;
    };

export function buildSearchIndex(): SearchEntry[] {
  const articles = getAllArticles().map((a): SearchEntry => ({
    type: 'article',
    slug: a.slug,
    title: a.title,
    blob: [a.title, a.dek, (a.tags ?? []).join(' '), CATEGORY_LABELS[a.category].label].join(' '),
    categoryKey: a.category,
    categoryLabel: CATEGORY_LABELS[a.category].label,
    date: formatLongDate(a.publishedAt),
    minutes: a.readingTimeMinutes,
  }));
  const live = new Set(articles.map((a) => (a.type === 'article' ? a.categoryKey : null)));
  const forthcoming = CATEGORY_KEYS.filter((k) => !live.has(k)).map((k): SearchEntry => ({
    type: 'forthcoming',
    categoryKey: k,
    categoryLabel: CATEGORY_LABELS[k].label,
    title: 'Forthcoming volume',
    blob: CATEGORY_LABELS[k].blurb,
  }));
  return [...articles, ...forthcoming];
}
