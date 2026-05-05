# Tamkeen Thought Leadership

A Next.js 15 publishing platform for long-form, data-driven articles. Newspaper aesthetic
(Financial Times / Economist) executed in a custom Tamkeen palette. Filesystem-based
content — no CMS, no database. Adding an article means dropping an MDX file into
`content/articles/`.

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm start        # serve production build
pnpm typecheck    # strict TypeScript
pnpm lint         # ESLint (next/core-web-vitals + next/typescript)
```

Requires Node 22 LTS or newer and pnpm 9.

## Adding a new article

1. Create an MDX file in `content/articles/<slug>.mdx`.
2. Frontmatter is the only required setup:

   ```yaml
   ---
   title: "Your headline."
   dek: "Standfirst paragraph in italic serif."
   emphasis: "headline"          # optional: word in title rendered in italic copper
   slug: "your-slug"
   series: "education"           # education | workforce | innovation | capability
   seriesNumber: 2
   publishedAt: "2026-07-15"
   filedFrom: "Abu Dhabi"
   authors: ["tamkeen-research"]
   tags: ["topic"]
   status: "published"           # draft | published
   ---
   ```

3. Compose the body with the exhibit components (`<KpiStrip />`, `<Exhibit />`,
   `<Findings />`, `<PullQuote />`, `<DataTable />`, etc.) — they are auto-injected through
   `mdx-components.tsx`, no imports required. Wrap each top-level section in
   `<ArticleSection id="...">` and start it with `<SectionHeader number="..." kicker="..." title="..." />`.
   The masthead nav and homepage "In this edition" sidebar are derived from those at build time.
4. Heavy chart data (rows, paths, bubble lists) belongs in
   `content/articles/<slug>.data.ts` and is `import`-ed at the top of the MDX.
5. Reading time is auto-computed unless `readingTime: <minutes>` is set explicitly.
6. **No code changes are required.** `pnpm build` picks up the new file, generates the
   `/articles/<slug>` route, sitemap entry, and series listing automatically.

Adding a new author: drop a JSON file into `content/authors/<id>.json` matching
`types/article.ts > Author`.

## File structure

```
app/
  layout.tsx                    Root layout, fonts, skip-link, metadata defaults
  page.tsx                      Homepage (newspaper front page)
  globals.css                   Tailwind v4 @theme tokens + base styles
  fonts.ts                      next/font: Source Serif 4, Inter, JetBrains Mono
  articles/[slug]/page.tsx      Article page — dynamically imports the MDX module
  series/[series]/page.tsx      Series index (forthcoming placeholder when empty)
  about/page.tsx                About page
  not-found.tsx                 404
  sitemap.ts / robots.ts        Auto-generated from published articles
components/
  Masthead.tsx                  Sticky top bar; second row appears on article pages
  ArticleNav.tsx                Client component; IntersectionObserver-driven section underline
  Footer.tsx                    Dark green footer with adaptive content
  ArticleHero.tsx               Eyebrow + h1 (with copper-italic emphasis word) + dek + byline
  ArticleLayout.tsx             Article container + <ArticleSection> wrapper
  HomepageHero.tsx              Lead article block with "In this edition" sidebar
  ArticleCard.tsx               Standfirst card for listings
  ProgressBar.tsx               2px copper bar across the top, article pages only
  Eyebrow.tsx, Byline.tsx, SectionHeader.tsx, Handoff.tsx, FullDivider.tsx
  exhibits/
    Exhibit.tsx                 Wrapper: number, title, sub, source
    KpiStrip.tsx                4-up KPI strip
    Findings.tsx                Two-column newspaper findings
    Heatmap.tsx                 Region × pillar heatmap with diverging palette
    VolatilityChart.tsx         Tier × system bar chart (QS green / THE copper)
    DataTable.tsx               Newspaper-grade table; mono numerics; tone-aware deltas
    StakeholderGrid.tsx         3-up agenda card grid (also 2-up; dark-mode supported)
    PullQuote.tsx               Centred quote with hairline rules
    PillarGrid.tsx, ScenarioGrid.tsx, UAEFootprint.tsx
    SVGStackedArea.tsx          Static SVG: regional composition area chart
    SVGScatter.tsx              Static SVG: QS-vs-THE scatter
    SVGGainersDecliners.tsx     Static SVG: country diverging bars
    SVGRisers.tsx               Static SVG: top-15 risers slope chart
    SVGGerdScatter.tsx          Static SVG: GERD vs citation gain
content/
  articles/                     MDX content + per-article .data.ts
  authors/                      Author JSON
lib/
  articles.ts                   getAllArticles, getArticleBySlug, getArticlesBySeries; section extraction
  format.ts                     Date formatters
  mdx.ts                        Component map for MDXProvider
types/
  article.ts                    Article, Author, Series types
mdx-components.tsx              Next.js MDX provider (registers exhibit components)
```

## Design philosophy

- **Typography is the design.** Source Serif 4 body, Inter for small caps and labels,
  JetBrains Mono for numbers and section markers. No images. No decorative graphics.
- **Hairline rules carry the structure.** Tamkeen-green section dividers (1–3px),
  rule-soft tan separators between cards, double-rule under the hero. Weight is meaning.
- **Charts are SVG, not images.** Every visualisation is a typed React component that
  takes `data` props, so the same chart can render different data in different articles.
- **Filesystem is the CMS.** MDX + frontmatter + per-article data files. Authoring is
  text editing; publishing is a `git push`.
- **Methodology in plain view.** The reference HTML treats methodology as part of the
  argument; the component system mirrors that — exhibits expose `source`, sections expose
  `kicker`, articles expose tags and a sources list.

## Quality gates verified

- `pnpm typecheck` — strict TypeScript, clean.
- `pnpm build` — clean compile, 12 static pages prerendered.
- `pnpm lint` — zero ESLint warnings or errors.
- `pnpm dev` — ready in ~8s; no console warnings on first request.
- All routes return 200 against `pnpm start`; `/articles/does-not-exist` returns 404.

The Lighthouse-on-the-article-page check (Performance / Accessibility / Best Practices /
SEO) is left for the deploy environment — no images, all-static SVG, self-hosted
fonts via `next/font`, and CLS-zero by construction.

## Deployment

Vercel: zero config. The default Next.js preset produces correct output. No environment
variables are required for the MVP. Set `NEXT_PUBLIC_SITE_URL` to populate canonical URLs
and the sitemap with the production hostname.
