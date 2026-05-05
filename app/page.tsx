import type { Metadata } from 'next';
import Link from 'next/link';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { getAllArticles } from '@/lib/articles';
import { formatLongDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Tamkeen Thought Leadership',
  description:
    'Long-form, data-driven analysis on policy, capability, and strategy. Independent. Filed from Abu Dhabi.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const articles = getAllArticles();

  return (
    <>
      <Masthead />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
        <section className="py-16 max-w-[820px] max-[640px]:py-10">
          <p className="font-serif italic text-[22px] leading-[1.5] text-mute m-0 mb-12 max-w-[56ch] max-[640px]:text-[18px]">
            Long-form, data-driven analysis on policy, capability, and strategy. Filed
            independently from Abu Dhabi.
          </p>

          <ol className="list-none m-0 p-0">
            {articles.map((a) => (
              <li key={a.slug} className="border-t border-rule">
                <Link
                  href={`/articles/${a.slug}`}
                  className="block py-7 group no-underline border-none"
                >
                  <h2 className="font-serif text-[28px] font-medium text-ink leading-[1.2] -tracking-[0.2px] m-0 mb-2 group-hover:text-green transition-colors max-[640px]:text-[22px]">
                    {a.title}
                  </h2>
                  <p className="font-serif italic text-[17px] leading-[1.5] text-ink/85 m-0 mb-3 max-w-[60ch]">
                    {a.dek}
                  </p>
                  <div className="font-sans text-[11px] tracking-[1.5px] uppercase text-mute font-medium">
                    By{' '}
                    <span className="text-ink">
                      {a.resolvedAuthors.map((author) => author.name).join(', ')}
                    </span>
                    <span className="opacity-60 mx-2.5">·</span>
                    {formatLongDate(a.publishedAt)}
                    <span className="opacity-60 mx-2.5">·</span>
                    {a.readingTimeMinutes} min read
                  </div>
                </Link>
              </li>
            ))}
            {articles.length === 0 ? (
              <li className="py-12 font-serif italic text-[18px] text-mute">
                Forthcoming.
              </li>
            ) : null}
            {articles.length > 0 ? <div className="border-t border-rule" /> : null}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
