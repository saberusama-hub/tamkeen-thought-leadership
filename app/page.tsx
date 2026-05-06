import type { Metadata } from 'next';
import Link from 'next/link';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { getAllArticles } from '@/lib/articles';
import { formatLongDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'The Index',
  description:
    'Long-form, data-driven analysis on policy, capability, and strategy. Published monthly. Filed independently from Abu Dhabi.',
  alternates: { canonical: '/' },
};

/**
 * Placeholder pieces. Each is a working title for an upcoming brief; they
 * sit at the same visual weight as the published article so the homepage
 * does not look empty between issues.
 */
const FORTHCOMING = [
  {
    title: 'The arithmetic of the visa pipeline',
    dek: 'Why post-study work permits feed citation counts on a five-year lag, and what that means for sovereign-strategy timing.',
    eta: 'Forthcoming, June 2026',
  },
  {
    title: 'Branch campuses, valued correctly',
    dek: 'A methodology for evaluating international branch campuses on the indicators they uniquely strengthen, not on standalone Top-500 rank.',
    eta: 'Forthcoming, July 2026',
  },
  {
    title: 'Three readings of a declining university rank',
    dek: 'Methodology break, pillar shift, or genuine institutional decline. A short field guide to telling them apart.',
    eta: 'Forthcoming, August 2026',
  },
  {
    title: 'Programme rankings vs institutional rankings',
    dek: 'When a subject league table beats the headline number, and when it misleads.',
    eta: 'Forthcoming, September 2026',
  },
  {
    title: 'Patient capital in higher education',
    dek: 'Why the funding cycle that compounds in research outcomes is longer than any political cycle, and how five systems handled the tension.',
    eta: 'Forthcoming, October 2026',
  },
];

export default function HomePage() {
  const articles = getAllArticles();

  return (
    <>
      <Masthead />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
        <section className="py-16 max-w-[820px] max-[640px]:py-10">
          <p className="font-serif italic text-[22px] leading-[1.5] text-mute m-0 mb-12 max-w-[56ch] max-[640px]:text-[18px]">
            Long-form, data-driven analysis on policy, capability, and strategy. Published
            monthly. Filed independently from Abu Dhabi.
          </p>

          <ol className="list-none m-0 p-0">
            {articles.map((a, i) => (
              <li
                key={a.slug}
                className={`border-t border-green/25 ${
                  i === 0 ? 'border-l-2 border-l-green pl-6 bg-green-pale/15 max-[640px]:pl-4' : ''
                }`}
              >
                <Link
                  href={`/articles/${a.slug}`}
                  className="block py-9 group no-underline border-none max-[640px]:py-7"
                >
                  {i === 0 ? (
                    <div className="ui-caps font-sans text-[10.5px] tracking-[2px] uppercase text-green font-semibold mb-2.5">
                      The current brief
                    </div>
                  ) : null}
                  <h2
                    className={`font-serif font-medium text-green leading-[1.18] -tracking-[0.3px] m-0 mb-2 group-hover:text-green-mid transition-colors ${
                      i === 0 ? 'text-[34px] max-[640px]:text-[26px]' : 'text-[28px] max-[640px]:text-[22px]'
                    }`}
                  >
                    {a.title}
                  </h2>
                  <p className="font-serif italic text-[17px] leading-[1.5] text-ink/85 m-0 mb-3 max-w-[60ch]">
                    {a.dek}
                  </p>
                  <div className="ui-caps font-sans text-[11px] tracking-[1.5px] uppercase text-mute font-medium max-[400px]:flex-col max-[400px]:flex max-[400px]:gap-1">
                    By{' '}
                    <span className="text-ink">
                      {a.resolvedAuthors.map((author) => author.name).join(', ')}
                    </span>
                    <span className="text-mute/60 mx-2.5 max-[400px]:hidden">·</span>
                    <span>{formatLongDate(a.publishedAt)}</span>
                    <span className="text-mute/60 mx-2.5 max-[400px]:hidden">·</span>
                    <span>{a.readingTimeMinutes} min read</span>
                  </div>
                </Link>
              </li>
            ))}

            {/* Forthcoming pieces. Same chronological-list visual rhythm but
                muted, italic, and labelled. */}
            {FORTHCOMING.map((p, i) => (
              <li key={i} className="border-t border-green/25">
                <div className="block py-8">
                  <div className="ui-caps font-sans text-[11px] tracking-[1.6px] uppercase text-green/70 font-semibold mb-2 inline-flex items-center gap-2">
                    <span aria-hidden className="block h-px w-4 bg-green-light" />
                    {p.eta}
                  </div>
                  <h2 className="font-serif italic text-[26px] font-normal text-ink/70 leading-[1.25] -tracking-[0.2px] m-0 mb-2 max-[640px]:text-[20px]">
                    {p.title}
                  </h2>
                  <p className="font-serif text-[16px] leading-[1.55] text-mute m-0 max-w-[60ch]">
                    {p.dek}
                  </p>
                </div>
              </li>
            ))}

            <li className="border-t border-green/25" aria-hidden />
          </ol>

          {/* Publication calendar: visualises the schedule for the rest of
              the year. Cells with a planned brief glow green; later cells
              ("In commission") render muted. The annual review (December)
              caps the year. */}
          <div className="mt-16 max-[640px]:mt-10">
            <div className="ui-caps font-sans text-[11px] tracking-[2px] uppercase font-semibold text-green mb-4">
              Publication calendar, 2026
            </div>
            <div className="grid grid-cols-6 gap-2 max-[760px]:grid-cols-3 max-[420px]:grid-cols-2">
              {(
                [
                  { month: 'May', label: 'Rankings', state: 'live' },
                  { month: 'Jun', label: 'Visa pipeline', state: 'planned' },
                  { month: 'Jul', label: 'Branch campuses', state: 'planned' },
                  { month: 'Aug', label: 'Reading rank decline', state: 'planned' },
                  { month: 'Sep', label: 'Programme rankings', state: 'planned' },
                  { month: 'Oct', label: 'Patient capital', state: 'planned' },
                ] as const
              ).map((c) => (
                <div
                  key={c.month}
                  className={`p-3 border ${
                    c.state === 'live'
                      ? 'border-green bg-green-pale/50'
                      : 'border-green/20 bg-paper'
                  }`}
                >
                  <div className="ui-caps font-sans text-[10px] tracking-[1.5px] uppercase font-semibold text-green">
                    {c.month}
                  </div>
                  <div className="font-serif text-[13px] leading-[1.3] text-ink/85 mt-1">
                    {c.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
