export type ArticleStatus = 'draft' | 'published';

export type SeriesId = 'education' | 'workforce' | 'innovation' | 'capability';

export interface Author {
  id: string;
  name: string;
  bio?: string;
  affiliation?: string;
}

export interface ArticleFrontmatter {
  title: string;
  dek: string;
  emphasis?: string;
  slug: string;
  series: SeriesId;
  seriesNumber: number;
  publishedAt: string;
  filedFrom?: string;
  authors: string[];
  readingTime?: number;
  heroExhibit?: string;
  tags?: string[];
  status: ArticleStatus;
}

export interface ArticleSection {
  id: string;
  number: string;
  label?: string;
  title: string;
}

export interface Article extends ArticleFrontmatter {
  filePath: string;
  readingTimeMinutes: number;
  sections: ArticleSection[];
  resolvedAuthors: Author[];
}

export const SERIES_LABELS: Record<SeriesId, { label: string; navLabel: string }> = {
  education: { label: 'The Education Series', navLabel: 'Education' },
  workforce: { label: 'The Workforce Series', navLabel: 'Workforce' },
  innovation: { label: 'The Innovation Series', navLabel: 'Innovation' },
  capability: { label: 'The Capability Series', navLabel: 'Capability' },
};
