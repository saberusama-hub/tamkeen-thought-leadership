import Link from 'next/link';

/**
 * Minimalist footer. Light cream surface with a tamkeen-green brand line on
 * top, four utility links beneath, copyright on the bottom. No category
 * lists, no subscribe form, no social icons.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-green/30">
      <div className="mx-auto max-w-[1240px] px-8 py-10 flex flex-col gap-5 max-[640px]:px-5 max-[640px]:py-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tamkeen-logo.svg"
          alt="Tamkeen"
          width={200}
          height={98}
          className="h-9 w-auto max-[640px]:h-8"
        />
        <div className="font-serif text-[22px] text-green leading-snug">
          The Index.{' '}
          <span className="text-mute italic font-normal">A publication of Tamkeen Thought Leadership.</span>
        </div>
        <nav className="ui-caps flex flex-wrap gap-x-6 gap-y-2 font-sans text-[12px] tracking-[1.4px] uppercase text-mute">
          <Link href="/about" className="hover:text-green border-none transition-colors">
            About
          </Link>
          <Link href="/about" className="hover:text-green border-none transition-colors">
            Methodology
          </Link>
          <Link href="/about" className="hover:text-green border-none transition-colors">
            Subscribe
          </Link>
          <Link href="/about" className="hover:text-green border-none transition-colors">
            Contact
          </Link>
        </nav>
        <div className="ui-caps font-sans text-[11px] tracking-[1.4px] uppercase text-mute opacity-80 mt-2">
          © {new Date().getFullYear()} Tamkeen
        </div>
      </div>
    </footer>
  );
}
