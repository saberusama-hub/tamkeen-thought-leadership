import type { Metadata } from 'next';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Tamkeen Thought Leadership publishes long-form, data-driven analyses on schools and universities. Independent. Public-facing.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <Masthead />
      <main
        id="main-content"
        className="mx-auto max-w-[1240px] px-8 py-16 max-[640px]:px-5 max-[640px]:py-10"
      >
        <div className="max-w-[68ch]">
          <div className="flex items-center gap-3 mb-6">
            <span aria-hidden className="block h-px w-8 bg-green-light" />
            <div className="font-sans text-[11px] tracking-[1.6px] uppercase text-green font-semibold">
              About this publication
            </div>
          </div>
          <h1 className="font-serif text-[48px] font-normal text-green leading-[1.1] -tracking-[0.6px] m-0 mb-8 max-w-[24ch] max-[640px]:text-[34px]">
            Independent analysis on schools and universities.
          </h1>

          <p className="font-serif italic text-[22px] leading-[1.5] text-ink m-0 mb-10 max-w-[56ch] max-[640px]:text-[19px]">
            Long-form, data-driven analysis on policy, capability, and strategy. Filed
            independently from Abu Dhabi.
          </p>

          <p>
            Tamkeen Thought Leadership publishes long-form, data-driven analyses on the questions
            that shape schools and universities: research, students, teaching, rankings, policy,
            and the cross-border footprint of higher education.
          </p>
          <p>
            Our editorial standard is independent. We cite sources, publish underlying datasets on
            request, and treat methodology as part of the argument rather than an appendix to it.
            Each volume is filed from Abu Dhabi and edited to a newspaper&rsquo;s discipline of
            structure and brevity.
          </p>

          <h3 className="font-serif font-semibold text-[22px] mt-10 mb-3 text-green">Cadence</h3>
          <p>
            We publish at most one piece per month. Volumes appear when the underlying analysis
            is ready, not on a fixed schedule.
          </p>

          <h3 className="font-serif font-semibold text-[22px] mt-10 mb-3 text-green">
            Editorial principles
          </h3>
          <ul className="list-disc pl-5 marker:text-mute">
            <li>Data-led, not opinion-led. Every claim references a published source.</li>
            <li>Methodology in plain view. Assumptions, breaks, and caveats up front.</li>
            <li>One argument per volume. No padding.</li>
            <li>Newspaper typography. Serif body, generous margins, hairline rules. No images.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
