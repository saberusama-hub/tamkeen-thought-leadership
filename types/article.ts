export type ArticleStatus = 'draft' | 'published';

export type CategoryId =
  | 'overall'
  | 'research'
  | 'students'
  | 'teaching'
  | 'rankings'
  | 'policy'
  | 'global'
  | 'industry';

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
  category: CategoryId;
  categoryNumber: number;
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

export const CATEGORY_LABELS: Record<
  CategoryId,
  { label: string; short: string; blurb: string }
> = {
  overall: {
    label: 'Overall',
    short: 'Overall',
    blurb: 'The system at a glance.',
  },
  research: {
    label: 'Research',
    short: 'Research',
    blurb: 'Output, citations, and the architecture of discovery.',
  },
  students: {
    label: 'Students',
    short: 'Students',
    blurb: 'Access, retention, mobility, outcomes.',
  },
  teaching: {
    label: 'Teaching & Learning',
    short: 'Teaching',
    blurb: 'Pedagogy, assessment, the classroom under change.',
  },
  rankings: {
    label: 'Rankings & Strategy',
    short: 'Rankings',
    blurb: 'How the leagues are scored, and what they reward.',
  },
  policy: {
    label: 'Policy & Funding',
    short: 'Policy',
    blurb: 'Regulation, finance, and the levers of reform.',
  },
  global: {
    label: 'Global / International',
    short: 'Global',
    blurb: 'Mobility, partnerships, the cross-border footprint.',
  },
  industry: {
    label: 'Industry & Employability',
    short: 'Industry',
    blurb: 'From lecture hall to labour market.',
  },
};

export const CATEGORY_KEYS: CategoryId[] = [
  'overall',
  'research',
  'students',
  'teaching',
  'rankings',
  'policy',
  'global',
  'industry',
];

export interface CategoryHeadline {
  text: string;
  italic: string;
  standfirst: string;
}

export const CATEGORY_HEADLINES: Record<CategoryId, CategoryHeadline> = {
  overall: {
    text: 'An independent publication on schools and universities.',
    italic: 'independent',
    standfirst:
      'Eight categories, one editorial standard. The annual review collects the year’s briefs and the patterns across them.',
  },
  research: {
    text: 'The architecture of discovery.',
    italic: 'discovery',
    standfirst:
      'Output, citations, infrastructure, and the funding regimes that shape what universities know.',
  },
  students: {
    text: 'Who studies, where, and why it matters.',
    italic: 'why it matters',
    standfirst:
      'Access, retention, mobility, and the outcomes that define a system’s social return.',
  },
  teaching: {
    text: 'The classroom, reconsidered.',
    italic: 'reconsidered',
    standfirst:
      'Pedagogy, assessment, and the technologies pressing the lecture hall to evolve.',
  },
  rankings: {
    text: 'How the leagues are scored, and what they reward.',
    italic: 'scored',
    standfirst:
      'A standing watch on QS, THE, ARWU, and the methodology choices that shape the global picture of higher education.',
  },
  policy: {
    text: 'The levers of reform.',
    italic: 'reform',
    standfirst:
      'Regulation, finance, accreditation, and the political economy of system change.',
  },
  global: {
    text: 'The cross-border footprint.',
    italic: 'footprint',
    standfirst:
      'Mobility, partnerships, branch campuses, and the diplomatic geography of universities.',
  },
  industry: {
    text: 'From lecture hall to labour market.',
    italic: 'labour market',
    standfirst:
      'Skills mismatch, graduate outcomes, and the institutions that bridge the gap.',
  },
};
