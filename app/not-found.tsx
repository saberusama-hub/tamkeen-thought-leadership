import Link from 'next/link';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { Headline } from '@/components/Headline';
import { buildSearchIndex } from '@/lib/search';

export default function NotFound() {
  const searchEntries = buildSearchIndex();
  return (
    <>
      <Masthead searchEntries={searchEntries} />
      <main className="mx-auto max-w-[1240px] px-8 py-24 text-center max-[760px]:px-6">
        <p className="font-sans text-[11px] tracking-[2px] uppercase text-accent-deep font-bold mb-3">
          404
        </p>
        <Headline
          text="Page not filed."
          className="font-serif text-[64px] font-normal text-tamkeen leading-[1.1] m-0 mb-6 max-[760px]:text-[40px]"
        />
        <p className="font-serif text-[20px] italic text-ink-mid mb-9">
          That URL has not been published in this edition.
        </p>
        <Link
          href="/"
          className="font-sans text-[12px] tracking-[2px] uppercase font-bold text-tamkeen border-b border-tamkeen/40 pb-px"
        >
          Return to the front page →
        </Link>
      </main>
      <Footer />
    </>
  );
}
