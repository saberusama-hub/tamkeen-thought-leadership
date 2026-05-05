import Link from 'next/link';
import type { Article } from '@/types/article';
import { CATEGORY_KEYS, CATEGORY_LABELS } from '@/types/article';

interface FooterProps {
  articles?: Article[];
}

export function Footer({ articles = [] }: FooterProps) {
  const firstFour = CATEGORY_KEYS.slice(0, 4);
  const lastFour = CATEGORY_KEYS.slice(4);

  return (
    <footer className="bg-tamkeen-deep text-paper pt-14 pb-9 mt-0">
      <div className="mx-auto max-w-[1240px] px-8 max-[760px]:px-6">
        <div className="grid grid-cols-[2fr_3fr] gap-12 pb-9 border-b border-paper/[.18] max-[980px]:grid-cols-1 max-[980px]:gap-8">
          <div>
            <div className="font-serif text-[36px] font-normal -tracking-[0.6px] mb-1.5">
              Tamkeen
            </div>
            <p className="font-serif italic text-[16px] text-tamkeen-mist max-w-[36ch] m-0">
              Long-form, data-driven analysis on the schools and universities portfolio.
              Independent. Filed from Abu Dhabi.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-[640px]:grid-cols-1">
            <div>
              <h3 className="font-sans text-[10.5px] tracking-[2.2px] uppercase font-bold text-paper m-0 mb-3.5">
                Categories
              </h3>
              <ul className="list-none m-0 p-0">
                {firstFour.map((k) => (
                  <li key={k} className="py-1.5">
                    <Link
                      href={k === 'overall' ? '/' : `/category/${k}`}
                      className="font-serif text-[14px] text-tamkeen-mist hover:text-paper transition-colors duration-[180ms]"
                    >
                      {CATEGORY_LABELS[k].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3
                className="font-sans text-[10.5px] tracking-[2.2px] uppercase font-bold text-paper m-0 mb-3.5"
                aria-hidden
              >
                <span className="invisible">·</span>
              </h3>
              <ul className="list-none m-0 p-0">
                {lastFour.map((k) => (
                  <li key={k} className="py-1.5">
                    <Link
                      href={`/category/${k}`}
                      className="font-serif text-[14px] text-tamkeen-mist hover:text-paper transition-colors duration-[180ms]"
                    >
                      {CATEGORY_LABELS[k].label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-[10.5px] tracking-[2.2px] uppercase font-bold text-paper m-0 mb-3.5">
                The publication
              </h3>
              <ul className="list-none m-0 p-0">
                <li className="py-1.5">
                  <Link
                    href="/about"
                    className="font-serif text-[14px] text-tamkeen-mist hover:text-paper transition-colors duration-[180ms]"
                  >
                    About
                  </Link>
                </li>
                <li className="py-1.5">
                  <Link
                    href="/about"
                    className="font-serif text-[14px] text-tamkeen-mist hover:text-paper transition-colors duration-[180ms]"
                  >
                    Methodology
                  </Link>
                </li>
                <li className="py-1.5">
                  <Link
                    href="/about"
                    className="font-serif text-[14px] text-tamkeen-mist hover:text-paper transition-colors duration-[180ms]"
                  >
                    Subscribe
                  </Link>
                </li>
                <li className="py-1.5">
                  <Link
                    href="/about"
                    className="font-serif text-[14px] text-tamkeen-mist hover:text-paper transition-colors duration-[180ms]"
                  >
                    Contact the editor
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-7 flex justify-between font-sans text-[10px] tracking-[1.5px] uppercase font-medium text-tamkeen-mist opacity-70 max-[640px]:flex-col max-[640px]:gap-2">
          <span>© {new Date().getFullYear()} Tamkeen · All rights reserved</span>
          <span>
            ISSN forthcoming · Issue 01
            {articles.length > 0 ? ` · ${articles.length} published` : ''}
          </span>
        </div>
      </div>
    </footer>
  );
}
