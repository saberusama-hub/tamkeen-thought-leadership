import type { Metadata } from 'next';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { Eyebrow } from '@/components/Eyebrow';
import { getAllArticles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Tamkeen Thought Leadership publishes long-form, data-driven analyses on policy, capability, and strategy. Independent. Public-facing.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const articles = getAllArticles();
  return (
    <>
      <Masthead activeNav="about" />
      <main id="main-content" className="mx-auto max-w-[1180px] px-8 py-16 max-[760px]:px-6">
        <Eyebrow>About this publication</Eyebrow>
        <h1 className="font-serif text-[56px] font-normal text-tamkeen leading-[1.1] -tracking-[0.5px] m-0 mb-6 max-[760px]:text-[36px]">
          Independent analysis on policy, capability, and strategy.
        </h1>
        <div className="prose-article max-w-[820px]">
          <p className="lead">
            Tamkeen Thought Leadership publishes long-form, data-driven analyses on the questions
            that shape national capability: education, workforce, innovation, and the institutional
            architecture that links them.
          </p>
          <p>
            Our editorial standard is independent: we cite sources, publish underlying datasets on
            request, and treat methodology as part of the argument rather than an appendix to it.
            Each volume is filed from Abu Dhabi and edited to a newspaper&rsquo;s discipline of structure
            and brevity.
          </p>
          <h3>Series</h3>
          <p>
            The publication runs in four parallel series — Education, Workforce, Innovation,
            Capability — each numbered and dated. Volumes appear when the underlying analysis is
            ready, not on a fixed cadence. Forthcoming volumes are signposted on the homepage.
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
