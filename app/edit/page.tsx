import type { Metadata } from 'next';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { getAllArticles } from '@/lib/articles';
import { EditSignIn } from './EditSignIn';

/**
 * app/edit/page.tsx
 *
 * The editor's front door. The only address anyone needs to be given.
 *
 * Deliberately excluded from search engines: the entrance is publicly
 * reachable by design, so there is no reason to advertise it.
 */
export const metadata: Metadata = {
  title: 'Edit the site',
  robots: { index: false, follow: false, nocache: true },
};

export default function EditPage() {
  const articles = getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
    dek: a.dek,
  }));

  return (
    <>
      <Masthead />
      <main id="main-content" className="mx-auto max-w-[1240px] px-8 max-[640px]:px-5">
        <section className="ed-shell">
          <div className="ed-eyebrow">Editing</div>
          <h1 className="ed-title">Make changes to the site</h1>
          <EditSignIn articles={articles} />
        </section>
      </main>
      <Footer />
    </>
  );
}
