# INSTRUCTIONS.md

## How to use this file

You are Claude Code, working in an empty project directory. This file is your complete brief. Read it end-to-end before writing any code.

The companion file `REFERENCE.html` in this same directory is the visual design contract. Read it before designing any component. Treat it as the authoritative source for layout, typography, spacing, colour, and rule-weight decisions. Translate it into a component system; do not redesign it.

Work through the **Order of operations** at the bottom of this file in sequence. After completing each numbered step, stop and summarise what you built before moving to the next. This gives me a chance to course-correct early.

If anything in this brief is ambiguous, ask before guessing. If something is technically infeasible as written, propose an alternative and wait for confirmation.

---

## Project

Build **Tamkeen Thought Leadership** - a Next.js publishing platform for long-form, data-driven articles. The aesthetic is Financial Times / Economist newspaper executed in a custom Tamkeen palette (deep forest green primary, warm cream paper, copper accent).

There is one article to start with. The architecture must make publishing additional articles a matter of dropping an MDX file into `content/articles/`, with zero code changes required.

## Stack

- **Next.js 15** with App Router and TypeScript (strict mode)
- **Tailwind CSS v4** with custom theme matching the Tamkeen palette
- **MDX** for article content via `@next/mdx`
- **gray-matter** for front-matter parsing
- **reading-time** package for automatic reading-time calculation
- **next/font** for self-hosted Google Fonts (Source Serif 4, Inter, JetBrains Mono) - do not link Google Fonts via stylesheet
- No CMS, no database - content is filesystem-based MDX
- Deploys to Vercel with zero config
- **pnpm** as package manager
- Node 22 LTS minimum

## File layout

```
app/
  layout.tsx                  Root layout with masthead + footer + fonts
  page.tsx                    Homepage (newspaper front page)
  globals.css                 Tailwind + design tokens
  articles/
    [slug]/
      page.tsx                Article page renders MDX with v13 layout
  series/[series]/
    page.tsx                  Series index (e.g., "Education Series")
  about/
    page.tsx                  About Tamkeen Thought Leadership
  sitemap.ts                  Auto-generated sitemap
  robots.ts                   Allows all
components/
  Masthead.tsx                Sticky top bar with wordmark + nav + edition info
  Footer.tsx                  Dark green footer
  ArticleHero.tsx             Hero block: eyebrow, headline, dek, byline
  ArticleLayout.tsx           Wraps MDX content; provides section grid
  HomepageHero.tsx            Lead article on homepage
  ArticleCard.tsx             Standfirst card for article listings
  Eyebrow.tsx                 Reusable label-with-rules component
  Byline.tsx                  Datelined byline
  ProgressBar.tsx             Article-only top progress bar
  exhibits/
    Exhibit.tsx               Wrapper for any chart/visual with number, title, sub, source
    KpiStrip.tsx              4-up KPI strip used in executive briefs
    Heatmap.tsx               Region-by-pillar heatmap
    VolatilityChart.tsx       Tier-by-system bar chart
    PullQuote.tsx             Bordered pull quote block
    Findings.tsx              Six-finding numbered list
    SectionHeader.tsx         "§ 01 - Section name" header
    DataTable.tsx             Newspaper-style data table
    StakeholderGrid.tsx       3-up agenda card grid
    SVGStackedArea.tsx        Static SVG: regional composition area chart
    SVGScatter.tsx            Static SVG: QS-vs-THE scatter
    SVGGainersDecliners.tsx   Static SVG: country diverging bars
    SVGRisers.tsx             Static SVG: top-15 risers slope chart
    SVGGerdScatter.tsx        Static SVG: GERD vs citation gain
content/
  articles/
    decade-that-reshaped-higher-education.mdx
    decade-that-reshaped-higher-education.data.ts
  authors/
    tamkeen-research.json
lib/
  articles.ts                 getAllArticles, getArticleBySlug, getArticlesBySeries
  mdx.ts                      MDX compile config + components map
types/
  article.ts                  Article, Author, Series types
public/
  (static assets only - no fonts here, next/font handles those)
```

## Design tokens

Translate the reference HTML's CSS variables into the Tailwind theme:

```ts
// tailwind.config.ts colours
{
  ink:             '#1A1A14',   // warm near-black for body
  'ink-mid':       '#4A4A40',
  'ink-soft':      '#6F6A5A',
  paper:           '#FAF6EE',
  'paper-shade':   '#F2EBDC',
  'paper-darkest': '#EBE2CD',
  rule:            '#C9BFA8',
  'rule-soft':     '#DCD3BB',
  tamkeen: {
    DEFAULT: '#003D2B',
    deep:    '#002419',
    mid:     '#1F5A45',
    light:   '#6B9F88',
    mist:    '#A8C2B4',
    pale:    '#D4E4DD',
  },
  copper:        '#A87545',
  'copper-deep': '#8C6840',
  neg:           '#A0342A',
  'neg-pale':    '#E8C7C2',
}
```

## Typography

Match the reference HTML pixel-for-pixel where you can. Use Tailwind arbitrary values (`text-[40px]`, `tracking-[1.6px]`) when the standard scale doesn't match.

- **Body**: Source Serif 4 400 / 18px / 1.7
- **Hero h1**: Source Serif 4 400 / 72px / 1.04, letter-spacing -0.6px, italic emphasis word in copper
- **Section h2**: Source Serif 4 500 / 40-42px / 1.18
- **h3**: Source Serif 4 600 / 22-24px
- **Eyebrows / labels / byline**: Inter 600 small-caps tracked 1.6-2.4px
- **Section markers** (`§ 01`): JetBrains Mono 500 / 11px tracked 2.4px in tamkeen, with 2px green top-rule above
- **Drop caps**: Source Serif 4 600 / 74px in tamkeen, 8px right-pad
- **Pull quotes**: italic Source Serif 4 30px, centred, with hairline rules above and below

## Article front matter schema

```yaml
---
title: "The decade that reshaped global higher education"
dek: "Across QS and Times Higher Education rankings, ten years of data tell a coherent story..."
emphasis: "reshaped"          # word in title rendered in italic copper
slug: "decade-that-reshaped-higher-education"
series: "education"
seriesNumber: 1
publishedAt: "2026-05-04"
filedFrom: "Abu Dhabi"
authors: ["tamkeen-research"]
readingTime: 14               # auto-calculated if omitted
heroExhibit: "regional-composition"
tags: ["higher education", "rankings", "QS", "THE", "UAE"]
status: "published"           # draft | published
---
```

The MDX body uses imported exhibit components (`<KpiStrip />`, `<Findings />`, `<Exhibit />`, etc.) interleaved with prose. The `Findings` component takes an array prop; `Exhibit` accepts `number`, `title`, `sub`, `source` props plus children (the chart).

## Homepage layout (newspaper front page)

In order:

1. **Masthead** - Tamkeen wordmark, sticky on scroll
2. **Today's date strip** - full-width small-caps date band in tamkeen green
3. **Lead article block** - large hero of the most recent article: oversized headline (Source Serif 4 ~72px), dek, byline, "Read the brief →" link. Takes ~70% of viewport width on desktop.
4. **Series strip** - horizontal row of small cards labelled by series ("The Education Series · No. 01 ·"). With one article, just shows the lead piece.
5. **Section listings** - sections labelled "Most read", "Forthcoming", "About this publication". Use placeholders for "forthcoming" until more pieces exist.
6. **Footer**

For the listing-card design: each card has eyebrow (series), serif headline at 22-26px, one-line dek in serif italic, byline in small caps, hairline rules above and below. **No images.** Pure typographic listing in the FT manner.

The homepage uses an asymmetric multi-column grid: lead article spans columns 1-3 of 4, with the right column reserved for the "In this edition" section (small-caps tracked label, then a list of all sections of the lead article with section numbers as anchor links).

## Article page layout

Renders the MDX content inside `ArticleLayout`. The layout reproduces the reference HTML exactly:

- Masthead (same as homepage, but nav switches to article-section anchors when scrolling)
- Section nav inside the masthead populates from the article's section IDs (extracted at build time from MDX headings)
- Hero block: eyebrow ("The Education Series · No. 01"), title (with emphasis word in italic copper), dek (italic serif), byline metadata strip
- Body: the MDX renders into the article container with proper newspaper grid
- All exhibits become full-bleed against the article gutter
- Footer

## Component contracts

**`<Eyebrow>`** - small-caps Inter 600 / 11px tracked 2.2px, two horizontal hairline rules flanking the text. Tamkeen colour. `children` = label.

**`<SectionHeader>`** - used inside MDX to start a numbered section.
Props: `number` (e.g. `"01"`), `kicker` (e.g. `"Executive Brief"`), `title`, optional `italic` (the word to italicise in copper).
Renders the `§ 01` mono marker on a 2px green top-rule, kicker as a small-caps label, then the h2 title.

**`<KpiStrip>`** - Props: `kpis: { num: string, label: string, desc: string, tone?: 'pos' | 'neg' }[]`. Four-column grid with hairline dividers, top + bottom 2px tamkeen / 1px rule borders. Numbers in Source Serif 4 600 / 44-48px in tamkeen, with `<span class="s">` units styled at 22px.

**`<Findings>`** - Props: `items: { title: string, body: string }[]`. Two-column newspaper layout with column rule. Each finding is a numbered serif h4 ("FINDING 01" in mono copper) + sub-headline + paragraph. Maintains break-inside avoid.

**`<Exhibit>`** - Wrapper. Props: `number` (e.g., `"Exhibit 01"` or `"Exhibit A"`), `title`, `sub`, `source`. `children` render between header and source. Has 2px tamkeen top border and 1px rule bottom. Top-aligned `ex-num` in mono uppercase, then exhibit title in serif 23px, italic sub, then chart, then hairline rule and source note in Inter 11.5px.

**`<PullQuote>`** - Centred quote with hairline tamkeen rules top and bottom. Italic serif 30-32px. Optional `cite` prop in small caps.

**`<Heatmap>`** - Generic. Props: `rows: { label, cells: { value: number, display: string }[] }[]`, `cols: string[]`, `legend: { min, max, label }`. Computes diverging colour from value. Use the green ramp for positives and warm-red for negatives matching the reference. Mono font for cell values.

**`<VolatilityChart>`** - Props: `tiers: { label, qs, the }[]`. Renders horizontal bars with QS in tamkeen, THE in copper, sharing the same wrap. Mono labels right-aligned.

**`<DataTable>`** - Newspaper-grade table. Black header row, hairline rule beneath h-row, alternating-free body, mono numerics with tabular figures, deltas in tamkeen / neg-red.

**`<StakeholderGrid>`** - 3-up grid (responsive to 2-up, 1-up). Each card has tamkeen top border 3px, h4 small-caps title, ul list with hanging em-dash bullets in copper, `<strong>` in tamkeen.

**SVG charts** - Render as inline SVG components, not images. They take `data` props so the same chart can render different data in different articles. Reproduce the reference exactly: stacked area (regional composition), scatter (QS vs THE), diverging bars (gainers/decliners), slope chart (top risers), bubble chart (GERD vs citations).

All SVG components use the Tamkeen palette tokens, never hardcoded colours that bypass the theme.

## Routing and navigation

- `/` - homepage
- `/articles/[slug]` - article page
- `/series/[series]` - series index (lists all articles in a series, ordered)
- `/about` - about page

The masthead nav has these items: `Latest`, `Education`, `Workforce` (placeholder), `Innovation` (placeholder), `Capability` (placeholder), `About`. Inactive series links render in muted ink-soft and link to `/series/[name]`. When a series has no published articles, the page renders a "Forthcoming" placeholder rather than 404.

When inside an article page, the masthead grows a second row underneath that lists the article's section anchors (Brief, Methodology, Landscape, Movers, etc.). The active section underlines as you scroll, replicating the reference behaviour. Use IntersectionObserver, not scroll listeners, for performance.

The progress bar (2px copper bar across the top of the viewport) appears only on article pages, not the homepage.

## Build-time tasks

- Reading time auto-calculated per article from MDX prose word count
- All article slugs validated unique at build time
- Series indices auto-generated from front matter
- Homepage's lead article = most recent `status: published` article
- All MDX is compiled at build time, not at runtime
- `sitemap.xml` auto-generated from published articles
- `robots.txt` allows all
- OpenGraph tags on every article: `og:title`, `og:description` (from dek), `og:type=article`, `og:published_time`, `og:author`. Twitter card large.

## SEO and metadata

Each article page exports a `generateMetadata` function that derives:
- `<title>`: `[Article title] - Tamkeen Thought Leadership`
- `<meta name="description">`: the dek
- Canonical URL
- OpenGraph + Twitter cards
- `application/ld+json` Article structured data

Homepage metadata: `Tamkeen Thought Leadership - Independent analysis on policy, capability, and strategy.`

## Accessibility

- All interactive elements keyboard-navigable
- All SVG charts have `<title>` and `<desc>` for screen readers
- Colour contrast minimum WCAG AA (the Tamkeen green on cream and copper on cream both pass)
- Skip-to-content link at the top of every page
- Section anchors have `scroll-margin-top` to clear the sticky masthead

## Article content for the first piece

The article `decade-that-reshaped-higher-education.mdx` should contain the full content of `REFERENCE.html`. Preserve:

- All section structure (10 sections including executive brief)
- All exhibit data (KPIs, table rows, heatmap cells, gainers/decliners values, top-15 risers)
- All pull quotes
- Drop caps on lead paragraphs
- The "Continue Reading - The full report ↓" handoff between Executive Brief and the rest

Translate the inline HTML into MDX with imported components. Where the reference uses inline SVG, that becomes a `<SVGStackedArea data={...} />` component call with the data extracted to a separate file at `content/articles/decade-that-reshaped-higher-education.data.ts` for cleanliness.

## Quality gates

Before declaring done, verify:

1. `pnpm build` completes with zero errors and zero warnings
2. `pnpm lint` passes with no errors
3. `pnpm typecheck` passes (TypeScript strict mode)
4. **Lighthouse on the article page**: 100 / 100 / 100 / 100 on a desktop run (Performance / Accessibility / Best Practices / SEO). If Performance is below 95, investigate; the page is text and SVG, it should be perfect.
5. The article page renders identically to the reference HTML side by side (within reason for component-system constraints).
6. **Adding a second article requires only**: creating a new MDX file, no code changes.
7. Cumulative Layout Shift = 0. No images that lack explicit dimensions; no fonts that flash.
8. Mobile viewport (375px wide): all sections legible, no horizontal scroll, exhibits scale properly.

## Repository conventions

- Use `pnpm` as package manager
- Commit early and often with conventional-commit messages (`feat:`, `fix:`, `chore:`, `style:`)
- `README.md` at repo root with: how to run dev, how to add a new article, the file structure, and the design philosophy in 4-5 bullet points
- `.editorconfig` and `.prettierrc` checked in
- ESLint with `eslint-config-next` plus `@typescript-eslint`

## Environment and deployment

- Node 22 LTS minimum
- Vercel deployment configuration: zero config beyond the default Next.js preset
- No environment variables needed for the MVP
- `next.config.mjs` enables MDX with `@next/mdx` plugin

## Order of operations

Build in this order to avoid rework. **After each step, stop and summarise what you built before moving to the next.**

1. Initialise project: Next.js 15 + TypeScript + Tailwind v4 + MDX + fonts. Run `pnpm install`. Verify `pnpm dev` starts cleanly.
2. Set up the design system: tokens in Tailwind theme, base styles in `globals.css`, font loading via `next/font`. Render a tiny test page that uses every font and every colour token to confirm they render correctly.
3. Build the masthead and footer. Wire them into the root layout.
4. Build all primitive components (`Eyebrow`, `SectionHeader`, `PullQuote`, `Byline`, `ProgressBar`).
5. Build all exhibit components (`KpiStrip`, `Heatmap`, `VolatilityChart`, `DataTable`, `StakeholderGrid`, `Findings`, `Exhibit` wrapper).
6. Build the SVG chart components from the reference HTML (one at a time, in their own files). Verify each renders identically to its counterpart in the reference.
7. Build the article page layout, wire up MDX rendering with the components map.
8. Author the first article MDX with all content from the reference. Confirm it renders pixel-close to the reference.
9. Build the homepage with the article listing.
10. Add series index pages and about page.
11. Run all quality gates; fix anything that fails.
12. Write the README.

## Final note

Do not skip steps. Do not bundle multiple steps into one commit. Do not improvise design choices. The reference HTML is the contract. Ask before deviating from it.
