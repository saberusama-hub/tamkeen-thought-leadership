import Link from 'next/link';

/**
 * Minimalist footer. Brand line on top, four utility links beneath, copyright on bottom.
 * No category list. No subscribe form. No social icons.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto max-w-[1240px] px-8 py-10 flex flex-col gap-6 max-[640px]:px-5 max-[640px]:py-8">
        <div className="font-serif text-[20px] text-green leading-snug">
          Tamkeen Thought Leadership.
        </div>
        <nav className="flex flex-wrap gap-6 font-sans text-[12px] tracking-[1.4px] uppercase text-mute">
          <Link href="/about" className="hover:text-ink border-none">
            About
          </Link>
          <Link href="/about" className="hover:text-ink border-none">
            Methodology
          </Link>
          <Link href="/about" className="hover:text-ink border-none">
            Subscribe
          </Link>
          <Link href="/about" className="hover:text-ink border-none">
            Contact
          </Link>
        </nav>
        <div className="font-sans text-[11px] tracking-[1.4px] uppercase text-mute opacity-80">
          © {new Date().getFullYear()} Tamkeen
        </div>
      </div>
    </footer>
  );
}
