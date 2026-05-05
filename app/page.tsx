import type { Metadata } from 'next';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { HomepageHero } from '@/components/HomepageHero';
import { ForthcomingRack } from '@/components/ForthcomingRack';
import { EditorRow } from '@/components/EditorRow';
import { getAllArticles, getLeadArticle } from '@/lib/articles';
import { buildSearchIndex } from '@/lib/search';

export const metadata: Metadata = {
  title: 'Tamkeen Thought Leadership',
  description:
    'Long-form, data-driven analysis on the schools and universities portfolio. Independent. Filed from Abu Dhabi.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const articles = getAllArticles();
  const lead = getLeadArticle();
  const liveCategories = Array.from(new Set(articles.map((a) => a.category)));
  const searchEntries = buildSearchIndex();

  return (
    <>
      <Masthead activeTab="overall" searchEntries={searchEntries} />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[760px]:px-6">
        {lead ? <HomepageHero article={lead} /> : null}
        <ForthcomingRack liveCategories={liveCategories} />
        <EditorRow />
      </main>
      <Footer articles={articles} />
    </>
  );
}
