import type { ReactNode } from 'react';

interface ArticleLayoutProps {
  children: ReactNode;
}

/**
 * Wraps the article body. Single neutral surface, no dark / alt variants.
 */
export function ArticleLayout({ children }: ArticleLayoutProps) {
  return (
    <article className="prose-article mx-auto max-w-[1240px] px-8 py-12 max-[640px]:px-5 max-[640px]:py-8">
      {children}
    </article>
  );
}

interface SectionProps {
  id: string;
  /** Retained as latent prop for backward compatibility, ignored visually. */
  variant?: 'default' | 'alt' | 'dark';
  children: ReactNode;
}

/**
 * Article sections are now visually identical. The variant prop is kept so
 * existing MDX continues to compile, but does not change appearance.
 */
export function ArticleSection({ id, children }: SectionProps) {
  return (
    <section id={id} className="py-14 first:pt-4 max-[640px]:py-10">
      <div className="max-w-[820px] mx-auto">{children}</div>
    </section>
  );
}
