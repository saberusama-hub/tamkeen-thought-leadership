import type { Metadata } from 'next';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { Eyebrow } from '@/components/Eyebrow';
import { getAllArticles } from '@/lib/articles';
import { buildSearchIndex } from '@/lib/search';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Tamkeen Thought Leadership publishes long-form, data-driven analyses on schools and universities. Independent. Public-facing.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const articles = getAllArticles();
  const searchEntries = buildSearchIndex();
  return (
    <>
      <Masthead searchEntries={searchEntries} />
      <main
        id="main-content"
        className="mx-auto max-w-[1240px] px-8 py-16 max-[760px]:px-6"
      >
        <Eyebrow parts={['About this publication']} />
        <h1 className="font-serif text-[64px] font-normal text-tamkeen leading-[1.05] -tracking-[1.2px] m-0 mb-6 max-[760px]:text-[40px]">
          Independent analysis on the schools and universities portfolio.
        </h1>
        <div className="prose-article max-w-[820px]">
          <p className="lead">
            Tamkeen Thought Leadership publishes long-form, data-driven analyses on the questions
            that shape schools and universities: research, students, teaching, rankings, policy,
            and the cross-border footprint of higher education.
          </p>
          <p>
            Our editorial standard is independent: we cite sources, publish underlying datasets on
            request, and treat methodology as part of the argument rather than an appendix to it.
            Each volume is filed from Abu Dhabi and edited to a newspaper&rsquo;s discipline of
            structure and brevity.
          </p>
          <h3>Categories</h3>
          <p>
            The publication runs in eight parallel categories — Overall, Research, Students,
            Teaching &amp; Learning, Rankings &amp; Strategy, Policy &amp; Funding, Global /
            International, Industry &amp; Employability — each numbered and dated. Volumes appear
            when the underlying analysis is ready, not on a fixed cadence. Forthcoming volumes are
            signposted on the homepage.
          </p>
          <h3>Editorial principles</h3>
          <ul>
            <li>Data-led, not opinion-led. Every claim references a published source.</li>
            <li>Methodology in plain view: assumptions, breaks, and caveats up front.</li>
            <li>One argument per volume. No padding.</li>
            <li>Newspaper typography: serif body, generous columns, hairline rules. No images.</li>
          </ul>
        </div>
      </main>
      <Footer articles={articles} />
    </>
  );
}
