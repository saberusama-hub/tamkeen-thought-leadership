import Link from 'next/link';

export function EditorRow() {
  return (
    <section className="py-12 pb-16 grid grid-cols-[2fr_1fr_1fr] gap-12 max-[980px]:grid-cols-1 max-[980px]:gap-8">
      <div>
        <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0 mb-3.5 pb-3 border-b border-tamkeen">
          From the editor
        </h2>
        <p className="font-serif text-[16px] leading-[1.65] text-ink m-0 mb-3.5 max-w-[60ch]">
          <em>Tamkeen Thought Leadership</em> is a publication for those who make decisions about
          schools and universities — ministries, boards, sovereign funders, university presidents,
          and the analysts who advise them. It commits to one premise: that the best policy
          questions in education sit downstream of careful empirical work, and that rigorous data
          analysis, in plain language, is the most useful thing we can put into the conversation.
        </p>
        <p className="font-serif text-[16px] leading-[1.65] text-ink m-0 max-w-[60ch]">
          We will publish four to six long-form briefs a year across the categories above. Every
          piece will show its working. Where the data is contested or methodologically fragile, we
          will say so. Where it is unambiguous, we will say that too.
        </p>
        <div className="font-serif italic text-ink-soft text-[14.5px] mt-[18px]">
          — The editors, Abu Dhabi
        </div>
      </div>

      <div>
        <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0 mb-3.5 pb-3 border-b border-tamkeen">
          The method
        </h2>
        <p className="font-serif text-[15px] leading-[1.6] text-ink m-0 mb-3">
          Original analysis on public datasets. Charts are generated from typed data files; numbers
          are reproducible. Methodology notes accompany every piece.
        </p>
        <Link
          href="/about"
          className="font-serif italic text-tamkeen text-[15px] inline-flex items-center gap-1.5 mt-2 border-b border-[rgba(0,61,43,0.25)] pb-px transition-[border-color,gap] duration-[180ms] hover:border-tamkeen hover:gap-3"
        >
          Read the methodology charter <span aria-hidden className="not-italic">→</span>
        </Link>
      </div>

      <div>
        <h2 className="font-sans text-[11px] tracking-[2.4px] uppercase font-bold text-tamkeen m-0 mb-3.5 pb-3 border-b border-tamkeen">
          Subscribe
        </h2>
        <p className="font-serif text-[15px] leading-[1.6] text-ink m-0 mb-3">
          One email when a new brief is published. No marketing, no digest, no other use.
        </p>
        <Link
          href="/about"
          className="font-serif italic text-tamkeen text-[15px] inline-flex items-center gap-1.5 mt-2 border-b border-[rgba(0,61,43,0.25)] pb-px transition-[border-color,gap] duration-[180ms] hover:border-tamkeen hover:gap-3"
        >
          Receive new briefs <span aria-hidden className="not-italic">→</span>
        </Link>
      </div>
    </section>
  );
}
