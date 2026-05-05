import Link from 'next/link';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main
        id="main-content"
        className="mx-auto max-w-[1240px] px-8 py-24 text-center max-[640px]:px-5 max-[640px]:py-16"
      >
        <p className="font-sans text-[11px] tracking-[1.8px] uppercase text-mute font-medium mb-3">
          404
        </p>
        <h1 className="font-serif text-[48px] font-normal text-ink leading-[1.1] m-0 mb-6 max-[640px]:text-[34px]">
          Page not filed.
        </h1>
        <p className="font-serif italic text-[20px] text-mute m-auto mb-9 max-w-[40ch]">
          That URL has not been published in this edition.
        </p>
        <Link
          href="/"
          className="font-sans text-[12px] tracking-[1.6px] uppercase font-semibold text-green border-b border-green/40 pb-px no-underline"
        >
          Return to the front page →
        </Link>
      </main>
      <Footer />
    </>
  );
}
