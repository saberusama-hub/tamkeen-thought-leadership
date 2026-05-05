import type { ReactNode } from 'react';

interface ArticleLayoutProps {
  children: ReactNode;
}

export function ArticleLayout({ children }: ArticleLayoutProps) {
  return <article className="prose-article">{children}</article>;
}

interface SectionProps {
  id: string;
  variant?: 'default' | 'alt' | 'dark';
  children: ReactNode;
}

export function ArticleSection({ id, variant = 'default', children }: SectionProps) {
  const bg =
    variant === 'alt'
      ? 'bg-paper-shade'
      : variant === 'dark'
        ? 'bg-tamkeen-deep text-paper'
        : 'bg-paper';
  return (
    <section
      id={id}
      data-variant={variant}
      className={`${bg} py-[72px] scroll-mt-[180px] max-[760px]:py-12 max-[760px]:scroll-mt-[150px] [&_+_section]:border-t [&_+_section]:border-rule-soft data-[variant=dark]:[&_+_section]:border-t-transparent`}
    >
      <div className="mx-auto max-w-[1180px] px-8 max-[760px]:px-6">{children}</div>
    </section>
  );
}
