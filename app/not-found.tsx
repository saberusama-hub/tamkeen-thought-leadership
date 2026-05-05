import Link from 'next/link';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="mx-auto max-w-[1180px] px-8 py-24 text-center">
        <p className="font-sans text-[11px] tracking-[2px] uppercase text-copper-deep font-bold mb-3">
          404
        </p>
        <h1 className="font-serif text-[64px] font-normal text-tamkeen leading-[1.1] m-0 mb-6 max-[760px]:text-[40px]">
          Page not filed.
        </h1>
        <p className="font-serif text-[20px] italic text-ink-mid mb-9">
          That URL has not been published in this edition.
        </p>
        <Link
          href="/"
          className="font-sans text-[12px] tracking-[2px] uppercase font-bold text-tamkeen border-b border-tamkeen/40"
        >
          Return to the front page →
        </Link>
      </main>
      <Footer />
    </>
  );
}
