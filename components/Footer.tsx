import Link from 'next/link';
import type { Article } from '@/types/article';
import { SERIES_LABELS } from '@/types/article';

interface FooterProps {
  contextSections?: { id: string; title: string }[];
  contextSeries?: string;
  articles?: Article[];
}

export function Footer({ contextSections, contextSeries, articles = [] }: FooterProps) {
  const seriesItems = (Object.keys(SERIES_LABELS) as Array<keyof typeof SERIES_LABELS>).map((key) => {
    const has = articles.some((a) => a.series === key);
    return { key, ...SERIES_LABELS[key], has };
  });

  return (
    <footer className="bg-tamkeen-deep text-paper/70 px-8 pt-[54px] pb-9 font-serif text-[13px] leading-[1.6]">
      <div className="mx-auto max-w-[1180px] grid grid-cols-[2fr_1fr_1fr] gap-10 pb-[30px] border-b border-paper/15 max-[780px]:grid-cols-1 max-[780px]:gap-7">
        <div>
          <div className="font-serif text-2xl text-paper font-semibold mb-3">
            Tamkeen
            <span className="block font-sans text-[10.5px] tracking-[2px] uppercase text-tamkeen-light mt-1 font-semibold">
              {contextSeries ?? 'Thought Leadership · Independent analysis'}
            </span>
          </div>
          <p className="m-0 text-[13px] text-paper/65 max-w-[520px]">
            Long-form, data-driven analysis on policy, capability, and strategy. Independent.
            Public-facing. Filed from Abu Dhabi.
          </p>
        </div>
        <div>
          <h6 className="text-paper text-[10.5px] tracking-[1.5px] uppercase m-0 mb-3 font-bold font-sans">
            {contextSections ? 'In this report' : 'Latest'}
          </h6>
          <p className="m-0 leading-[2]">
            {contextSections
              ? contextSections.map((s) => (
                  <span key={s.id} className="block">
                    <a
                      href={`#${s.id}`}
                      className="text-tamkeen-light no-underline border-b border-tamkeen-light/30"
                    >
                      {s.title}
                    </a>
                  </span>
                ))
              : articles.slice(0, 5).map((a) => (
                  <span key={a.slug} className="block">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-tamkeen-light no-underline border-b border-tamkeen-light/30"
                    >
                      {a.title}
                    </Link>
                  </span>
                ))}
          </p>
        </div>
        <div>
          <h6 className="text-paper text-[10.5px] tracking-[1.5px] uppercase m-0 mb-3 font-bold font-sans">
            Series
          </h6>
          <p className="m-0 leading-[2]">
            {seriesItems.map((s) => (
              <span key={s.key} className="block">
                {s.has ? (
                  <Link
                    href={`/series/${s.key}`}
                    className="text-tamkeen-light no-underline border-b border-tamkeen-light/30"
                  >
                    No. 01 · {s.navLabel}
                  </Link>
                ) : (
                  <span className="text-paper/45">Forthcoming · {s.navLabel}</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1180px] mt-6 text-[11px] text-paper/40 font-sans">
        © {new Date().getFullYear()} Tamkeen Thought Leadership. Sources cited per article. All exhibits are static; full underlying datasets available on request.
      </div>
    </footer>
  );
}
