import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Article, ArticleFrontmatter, ArticleSection, Author, CategoryId } from '@/types/article';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');
const AUTHORS_DIR = path.join(process.cwd(), 'content', 'authors');

function loadAuthor(id: string): Author {
  const file = path.join(AUTHORS_DIR, `${id}.json`);
  if (!fs.existsSync(file)) {
    return { id, name: id };
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as Author;
  return data;
}

function readArticleFile(filePath: string): { data: ArticleFrontmatter; content: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  return { data: parsed.data as ArticleFrontmatter, content: parsed.content };
}

function deriveNavLabel(kicker: string | undefined, fallback: string): string {
  if (!kicker) return fallback;
  const cleaned = kicker.split(' · ')[0]?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : fallback;
}

function extractSections(mdx: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  const re = /<ArticleSection\s+id="([^"]+)"[\s\S]*?<SectionHeader([\s\S]*?)\/>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(mdx)) !== null) {
    const id = match[1];
    const headerProps = match[2];
    const number = /number="([^"]+)"/.exec(headerProps)?.[1] ?? '';
    const kicker = /kicker="([^"]+)"/.exec(headerProps)?.[1];
    const title = /title="([^"]+)"/.exec(headerProps)?.[1] ?? '';
    sections.push({ id, number, label: deriveNavLabel(kicker, title), title });
  }
  return sections;
}

function buildArticle(filePath: string): Article | null {
  const { data, content } = readArticleFile(filePath);
  if (!data || data.status !== 'published') return null;

  const minutes = data.readingTime ?? Math.max(1, Math.round(readingTime(content).minutes));
  const sections = extractSections(content);
  const resolvedAuthors = (data.authors ?? []).map(loadAuthor);

  return {
    ...data,
    filePath,
    readingTimeMinutes: minutes,
    sections,
    resolvedAuthors,
  };
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const articles: Article[] = [];
  const seenSlugs = new Set<string>();
  for (const file of files) {
    const full = path.join(ARTICLES_DIR, file);
    const article = buildArticle(full);
    if (!article) continue;
    if (seenSlugs.has(article.slug)) {
      throw new Error(`Duplicate slug at build time: ${article.slug}`);
    }
    seenSlugs.add(article.slug);
    articles.push(article);
  }
  articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  return getAllArticles().find((a) => a.slug === slug) ?? null;
}

export function getArticlesByCategory(category: CategoryId): Article[] {
  return getAllArticles()
    .filter((a) => a.category === category)
    .sort((a, b) => a.categoryNumber - b.categoryNumber);
}

export function getLeadArticle(): Article | null {
  return getAllArticles()[0] ?? null;
}
