/**
 * lib/editorial/github.ts
 *
 * The write path for the live editor: read the current MDX from the repository
 * and commit edited files back to it.
 *
 * Uses the Git Data API rather than the Contents API so that a publish touching
 * two files lands as a *single* commit. That matters: 116 blocks are shared
 * across both articles, so one edit can change both files, and they must never
 * be committed separately or the two pieces would briefly disagree.
 *
 * Server-only. The token never reaches the browser.
 */

const API = 'https://api.github.com';

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export function getRepoConfig(): RepoConfig | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return {
    owner: process.env.EDITOR_REPO_OWNER ?? 'saberusama-hub',
    repo: process.env.EDITOR_REPO_NAME ?? 'tamkeen-thought-leadership',
    branch: process.env.EDITOR_REPO_BRANCH ?? 'main',
    token,
  };
}

async function gh<T>(
  cfg: RepoConfig,
  pathname: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}${pathname}`, {
    method: init?.method ?? 'GET',
    headers: {
      authorization: `Bearer ${cfg.token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      'user-agent': 'the-index-editor',
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`GitHub ${init?.method ?? 'GET'} ${pathname} -> ${res.status} ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Current text of a file on the configured branch. */
export async function readFile(cfg: RepoConfig, filePath: string): Promise<string> {
  const data = await gh<{ content: string; encoding: string }>(
    cfg,
    `/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${encodeURIComponent(cfg.branch)}`,
  );
  if (data.encoding !== 'base64') throw new Error(`unexpected encoding for ${filePath}`);
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

export async function readFiles(
  cfg: RepoConfig,
  paths: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const texts = await Promise.all(paths.map((p) => readFile(cfg, p)));
  paths.forEach((p, i) => out.set(p, texts[i]));
  return out;
}

/**
 * Commit a set of whole-file contents as one commit on the branch.
 *
 * `dry` runs every step except moving the branch reference, so the production
 * path can be exercised end to end without publishing anything.
 */
export async function commitFiles(
  cfg: RepoConfig,
  files: { path: string; content: string }[],
  message: string,
  opts: { dry?: boolean } = {},
): Promise<{ commit: string | null; tree: string; parent: string; dry: boolean }> {
  const ref = await gh<{ object: { sha: string } }>(
    cfg,
    `/git/ref/heads/${encodeURIComponent(cfg.branch)}`,
  );
  const parent = ref.object.sha;
  const parentCommit = await gh<{ tree: { sha: string } }>(cfg, `/git/commits/${parent}`);

  const blobs = await Promise.all(
    files.map((f) =>
      gh<{ sha: string }>(cfg, '/git/blobs', {
        method: 'POST',
        body: { content: Buffer.from(f.content, 'utf-8').toString('base64'), encoding: 'base64' },
      }).then((b) => ({ path: f.path, sha: b.sha })),
    ),
  );

  const tree = await gh<{ sha: string }>(cfg, '/git/trees', {
    method: 'POST',
    body: {
      base_tree: parentCommit.tree.sha,
      tree: blobs.map((b) => ({ path: b.path, mode: '100644', type: 'blob', sha: b.sha })),
    },
  });

  if (opts.dry) return { commit: null, tree: tree.sha, parent, dry: true };

  const commit = await gh<{ sha: string }>(cfg, '/git/commits', {
    method: 'POST',
    body: { message, tree: tree.sha, parents: [parent] },
  });

  await gh(cfg, `/git/refs/heads/${encodeURIComponent(cfg.branch)}`, {
    method: 'PATCH',
    body: { sha: commit.sha, force: false },
  });

  return { commit: commit.sha, tree: tree.sha, parent, dry: false };
}
