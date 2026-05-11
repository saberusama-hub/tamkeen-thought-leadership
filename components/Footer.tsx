/**
 * Minimalist footer. Wordmark + copyright. No utility nav links.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-green/30">
      <div className="mx-auto max-w-[1240px] px-8 py-10 flex flex-col gap-5 max-[640px]:px-5 max-[640px]:py-8">
        <div className="font-serif text-[22px] text-green leading-snug">
          The Index.{' '}
          <span className="text-mute italic font-normal">A publication of Tamkeen Thought Leadership.</span>
        </div>
        <div className="ui-caps font-sans text-[11px] tracking-[1.4px] uppercase text-mute opacity-80 mt-2">
          © {new Date().getFullYear()} Tamkeen
        </div>
      </div>
    </footer>
  );
}
