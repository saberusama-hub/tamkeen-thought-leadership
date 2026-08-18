'use client';

/**
 * app/edit/EditSignIn.tsx
 *
 * The whole entrance to the editor: one password field, then a list of the
 * articles. Written for someone who has never seen the repository and should
 * not have to know it exists.
 */

import { useEffect, useState } from 'react';

interface ArticleLink {
  slug: string;
  title: string;
  dek: string;
}

export function EditSignIn({ articles }: { articles: ArticleLink[] }) {
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'checking' | 'out' | 'in' | 'busy'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/editorial/session')
      .then((r) => r.json())
      .then((d: { signedIn: boolean; configured: boolean }) => {
        if (!d.configured) {
          setState('out');
          setError(
            'The editor has not been switched on for this site yet. The site owner needs to add the editor password to the hosting settings.',
          );
          return;
        }
        setState(d.signedIn ? 'in' : 'out');
      })
      .catch(() => setState('out'));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('busy');
    setError(null);
    try {
      const res = await fetch('/api/editorial/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword('');
        setState('in');
        return;
      }
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? 'Could not sign in.');
      setState('out');
    } catch {
      setError('Could not reach the site. Check your connection and try again.');
      setState('out');
    }
  };

  const signOut = async () => {
    await fetch('/api/editorial/session', { method: 'DELETE' });
    setState('out');
  };

  if (state === 'checking') {
    return <p className="ed-quiet">One moment…</p>;
  }

  if (state === 'in') {
    return (
      <div>
        <p className="ed-lede">
          You are signed in. Choose what you would like to edit.
        </p>
        <ul className="ed-list">
          {articles.map((a) => (
            <li key={a.slug}>
              <a href={`/articles/${a.slug}?edit=1`}>
                <span className="ed-list-title">{a.title}</span>
                <span className="ed-list-dek">{a.dek}</span>
                <span className="ed-list-go">Edit this article →</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="ed-help">
          <h2>How it works</h2>
          <ol>
            <li>Click any piece of text on the page and type over it.</li>
            <li>
              Nothing is public until you press <strong>Publish</strong>. You can change your mind
              at any point before that.
            </li>
            <li>After publishing, the live site updates about a minute later.</li>
          </ol>
        </div>

        <button type="button" className="ed-signout" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="ed-form">
      <p className="ed-lede">Enter the editing password to make changes to the site.</p>
      <label htmlFor="ed-pw">Password</label>
      <input
        id="ed-pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={state === 'busy'}
        autoFocus
      />
      {error ? (
        <p className="ed-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={state === 'busy' || password.length === 0}>
        {state === 'busy' ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}
