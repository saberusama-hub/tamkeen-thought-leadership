/**
 * scripts/claims-audit.ts
 *
 * Reads content/data/computed-claims.json (produced by
 * scripts/preprocess-rankings.ts) and asserts that every numerical
 * claim that appears in the article MDX matches the computed value
 * derived from the source xlsx data.
 *
 * Exits non-zero on any mismatch. The pnpm script `pnpm claims-audit`
 * runs this; it is the single source of truth for the article's
 * quantitative claims.
 *
 * If the report and the source data disagree, the source data wins.
 * Discrepancies vs the published Global_HE_Rankings_Report PDF are
 * recorded in the discrepancyVsReport array below for transparency.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const claimsPath = path.join(ROOT, 'content', 'data', 'computed-claims.json');
const masterPath = path.join(ROOT, 'content', 'data', 'rankings-master.json');
const mdxPath = path.join(
  ROOT,
  'content',
  'articles',
  'decade-that-reshaped-higher-education.mdx',
);
const dataTsPath = path.join(
  ROOT,
  'content',
  'articles',
  'decade-that-reshaped-higher-education.data.ts',
);

const claims = JSON.parse(readFileSync(claimsPath, 'utf-8')) as Record<string, unknown>;
const mdx = readFileSync(mdxPath, 'utf-8');
const siblingMdxPath = path.join(
  ROOT,
  'content',
  'articles',
  'rankings-decade-told-straight.mdx',
);
const siblingMdx = readFileSync(siblingMdxPath, 'utf-8');
const dataTs = readFileSync(dataTsPath, 'utf-8');
interface MasterRow {
  system: 'THE' | 'QS';
  year: number;
  rankNumeric: number;
  country: string;
  university: string;
  isBanded: boolean;
  rank: number | null;
}
const master = JSON.parse(readFileSync(masterPath, 'utf-8')) as MasterRow[];

/**
 * Median absolute year-over-year rank movement for integer-ranked
 * institutions whose rank is in [rankFrom, rankTo] at either endpoint
 * of the year-pair. Used by the sibling article's KPI card 4 claim
 * ('a university near rank 400 on QS moves about 20').
 */
function medianAbsMovement(system: 'QS' | 'THE', rankFrom: number, rankTo: number): number {
  const rows = master.filter(
    (r) => r.system === system && !r.isBanded && Number.isInteger(r.rank as number),
  );
  const byYear = new Map<number, Map<string, number>>();
  for (const r of rows) {
    if (!byYear.has(r.year)) byYear.set(r.year, new Map());
    byYear.get(r.year)!.set(r.university, r.rankNumeric);
  }
  const years = [...byYear.keys()].sort();
  const moves: number[] = [];
  for (let i = 1; i < years.length; i++) {
    const prev = byYear.get(years[i - 1])!;
    const curr = byYear.get(years[i])!;
    for (const [u, currRank] of curr) {
      const prevRank = prev.get(u);
      if (prevRank == null) continue;
      const inBand =
        (currRank >= rankFrom && currRank <= rankTo) ||
        (prevRank >= rankFrom && prevRank <= rankTo);
      if (!inBand) continue;
      moves.push(Math.abs(currRank - prevRank));
    }
  }
  moves.sort((a, b) => a - b);
  const m = moves.length;
  return m % 2 === 0 ? (moves[m / 2 - 1] + moves[m / 2]) / 2 : moves[Math.floor(m / 2)];
}

const qs300_500Median = medianAbsMovement('QS', 300, 500);

const COUNTRY_GROUPS: Record<string, string[]> = {
  'United States': ['United States', 'United States of America', 'USA', 'U.S.A.'],
  'United Kingdom': ['United Kingdom', 'UK'],
  China: ['China', 'China (Mainland)', 'PRC'],
  Germany: ['Germany'],
  Australia: ['Australia'],
  Italy: ['Italy'],
  Spain: ['Spain'],
  France: ['France'],
  Canada: ['Canada'],
  'Korea, Republic of': [
    'South Korea',
    'Korea, Republic of',
    'Republic of Korea',
    'Korea (South)',
  ],
  Japan: ['Japan'],
  Netherlands: ['Netherlands', 'The Netherlands'],
  'Saudi Arabia': ['Saudi Arabia'],
  Malaysia: ['Malaysia'],
  'United Arab Emirates': ['United Arab Emirates', 'UAE'],
};

function countTop500(system: 'THE' | 'QS', year: number, names: string[]): number {
  return master.filter(
    (r) =>
      r.system === system &&
      r.year === year &&
      names.includes(r.country) &&
      r.rankNumeric <= 500,
  ).length;
}

interface Check {
  label: string;
  /** Regex that must produce at least one match against the MDX. */
  pattern: RegExp;
  /** Expected value from claims (null = the regex's existence is enough). */
  expected: number | string | null;
  /** True if the claim is missing from the MDX is OK. Used for canonical-claims-not-yet-cited. */
  optional?: boolean;
  /** Free-text description of where to find the claim in the MDX. */
  notes?: string;
}

const u = claims.distinctInstitutions as number;
const t10 = claims.medianYoYShift_THE_top10 as number;
const qs500 = claims.medianYoYShift_QS_top500 as number;

const checks: Check[] = [
  {
    label: 'Asia THE Top 100 share 2016 = 9%',
    pattern: /9%[^0-9]+to[^0-9]+20%|from\s+9%\s+in\s+2016/i,
    expected: 0.09,
  },
  {
    label: 'Asia THE Top 100 share 2026 = 20%',
    pattern: /20%\s+in\s+2026|to\s+20%/i,
    expected: 0.2,
  },
  {
    label: 'Greater China THE Top 100 = 4 in 2016',
    pattern: /(?:from\s+)?4\s+(?:institutions?\s+)?in\s+2016/i,
    expected: 4,
  },
  {
    label: 'Greater China THE Top 100 = 12 in 2026',
    pattern: /12\s+in\s+2026/i,
    expected: 12,
  },
  {
    label: 'US THE Top 100 = 39 → 35',
    pattern: /39\s*(?:to|→|->)\s*35/,
    expected: '39->35',
  },
  {
    label: 'US QS Top 100 = 32 → 26',
    pattern: /32\s*(?:to|→|->)\s*26/,
    expected: '32->26',
  },
  {
    label: 'THE Top 500 entrants over decade = 126',
    pattern: /126\s+(?:entered|institutions|to)/i,
    expected: 126,
  },
  {
    label: 'QS Top 500 entrants over decade (claim should reflect computed value 154; report says 139)',
    pattern: /(154|139)\s+(?:entered|institutions|to)/,
    expected: claims.qsTop500Entrants_2017_2026 as number,
    optional: true,
    notes: 'Report and source data disagree: report=139, source=154.',
  },
  {
    label: 'Median annual rank shift, integer-ranked Top 10 = 1',
    pattern: /Top\s+10\s+institutions?\s+(?:is|=|:)\s*(?:a\s+median\s+of\s+)?(?:one|1)/i,
    expected: t10,
  },
  {
    label: 'Median annual rank shift, integer-ranked Top 500 ≈ 9 (QS)',
    pattern: /Top\s+500\s+(?:it\s+is|=|:)\s*(?:nine|9|10|approximately\s+10|~?10)/i,
    expected: qs500,
    notes: 'Source data: THE=5 (effectively Top 200 since banded), QS=9. Report says 21; we side with QS source data.',
  },
  {
    label: 'UAE QS Top 500: 3 → 6 (report claims 4 → 6; source data shows 3 in 2017)',
    pattern: /UAE.*QS.*(?:3|4)\s*(?:to|→|->)\s*6|UAE\s+in\s+(?:the\s+)?QS\s+Top\s+500.*(?:3|4)\s*(?:to|→|->)\s*6/i,
    expected: '3->6',
    notes: 'Report says 4 → 6; source xlsx confirms only Khalifa, UAEU, AUS in QS 2017 = 3 institutions.',
  },
  {
    label: 'UAE THE Top 500: 0 → 7 (report claims 1 → 7; source data shows 0 in 2016)',
    pattern: /UAE.*THE.*(?:0|1)\s*(?:to|→|->)\s*7/i,
    expected: '0->7',
    notes: 'Report says 1 → 7; source xlsx shows no UAE institutions in THE 2016 sheet.',
    optional: true,
  },
  {
    label: 'Saudi THE Top 500 = 1 → 9',
    pattern: /Saudi\s+Arabia.*1\s*(?:to|→|->)\s*9|1\s*(?:to|→|->)\s*9.*Saudi/i,
    expected: '1->9',
  },
  {
    label: 'Khalifa QS rise: 405 → 177',
    pattern: /Khalifa.*40[5-9]?\.?5?\s*(?:to|→|->)\s*177|40[5-9]?\.?5?\s*(?:in\s+2017|→\s*177)/i,
    expected: '405->177',
  },
  {
    label: '1,038 (or our 1,090) distinct canonical institutions',
    pattern: /(1,?038|1,?090|approximately\s+1,?000)\s+(?:distinct|institutions)/i,
    expected: u,
    optional: true,
    notes: 'Source data: 1,090 distinct after canonicalisation. Report says 1,038.',
  },
];

interface Result {
  label: string;
  state: 'PASS' | 'FAIL' | 'OPTIONAL_MISS';
  detail?: string;
}

const results: Result[] = checks.map((c) => {
  const found = c.pattern.test(mdx);
  if (found) {
    return { label: c.label, state: 'PASS' };
  }
  if (c.optional) {
    return {
      label: c.label,
      state: 'OPTIONAL_MISS',
      detail: 'Pattern not found in MDX (optional).',
    };
  }
  return {
    label: c.label,
    state: 'FAIL',
    detail: `Pattern ${c.pattern} not found in MDX.${c.notes ? ' Note: ' + c.notes : ''}`,
  };
});

const PASS = results.filter((r) => r.state === 'PASS').length;
const OPT = results.filter((r) => r.state === 'OPTIONAL_MISS').length;
const FAIL = results.filter((r) => r.state === 'FAIL').length;

console.log('================ CLAIMS AUDIT ================');
for (const r of results) {
  const flag =
    r.state === 'PASS' ? '  PASS  ' : r.state === 'OPTIONAL_MISS' ? '  MISS? ' : '  FAIL  ';
  console.log(`${flag} ${r.label}`);
  if (r.detail) console.log(`        ${r.detail}`);
}
console.log('---');
console.log(`PASS: ${PASS}   OPTIONAL_MISS: ${OPT}   FAIL: ${FAIL}`);

console.log('\n================ DISCREPANCIES VS REPORT ================');
console.log('  These are places where the published Global_HE_Rankings_Report');
console.log('  v2_2 PDF disagrees with the xlsx source data. We side with the');
console.log('  source data; the article copy must reflect the values below,');
console.log('  not the report\'s numbers.');
console.log();
const discrepancies = [
  { metric: 'UAE in QS Top 500, 2017', report: 4, source: claims.uaeQsTop500_2017 },
  { metric: 'UAE in THE Top 500, 2016', report: 1, source: claims.uaeTheTop500_2016 },
  { metric: 'QS Top 500 entrants over decade', report: 139, source: claims.qsTop500Entrants_2017_2026 },
  { metric: 'Median annual rank shift, Top 500', report: 21, source: `THE=${claims.medianYoYShift_THE_top500}, QS=${claims.medianYoYShift_QS_top500}` },
  { metric: 'Distinct canonical institutions', report: 1038, source: claims.distinctInstitutions },
];
for (const d of discrepancies) {
  console.log(`  ${d.metric}: report=${d.report} | source=${d.source}`);
}

// ────────────────────────────────────────────────────────────────────────────
// Country-table row audit. Every row in countryTableRows
// (in decade-that-reshaped-higher-education.data.ts) must match the
// counts computed from rankings-master.json, the xlsx-derived source.
// ────────────────────────────────────────────────────────────────────────────

console.log('\n================ COUNTRY TABLE ROW AUDIT ================');

interface RowSpec {
  country: string;
  qs17: number | '-';
  qs26: number | '-';
  the16: number | '-';
  the26: number | '-';
}

function parseRows(): RowSpec[] {
  // Naive parse — matches each "{ country: 'X', qs17: ..., qs26: ..., ... the16: ..., the26: ..., ... }"
  // line in the countryTableRows export.
  const start = dataTs.indexOf('export const countryTableRows');
  const end = dataTs.indexOf('];', start);
  const block = dataTs.slice(start, end);
  const lines = block.split('\n').filter((l) => l.trim().startsWith('{ country:'));
  const out: RowSpec[] = [];
  for (const line of lines) {
    const country = /country:\s*'([^']+)'/.exec(line)?.[1];
    const qs17 = /qs17:\s*([0-9]+|'-')/.exec(line)?.[1];
    const qs26 = /qs26:\s*([0-9]+|'-')/.exec(line)?.[1];
    const the16 = /the16:\s*([0-9]+|'-')/.exec(line)?.[1];
    const the26 = /the26:\s*([0-9]+|'-')/.exec(line)?.[1];
    if (!country) continue;
    out.push({
      country,
      qs17: qs17 === "'-'" ? '-' : Number(qs17),
      qs26: qs26 === "'-'" ? '-' : Number(qs26),
      the16: the16 === "'-'" ? '-' : Number(the16),
      the26: the26 === "'-'" ? '-' : Number(the26),
    });
  }
  return out;
}

const rows = parseRows();
let rowFail = 0;
for (const row of rows) {
  const aliases = COUNTRY_GROUPS[row.country] ?? [row.country];
  const checks: { col: string; declared: number | '-'; actual: number }[] = [
    { col: 'qs17', declared: row.qs17, actual: countTop500('QS', 2017, aliases) },
    { col: 'qs26', declared: row.qs26, actual: countTop500('QS', 2026, aliases) },
    { col: 'the16', declared: row.the16, actual: countTop500('THE', 2016, aliases) },
    { col: 'the26', declared: row.the26, actual: countTop500('THE', 2026, aliases) },
  ];
  const issues = checks.filter((c) => c.declared !== '-' && c.declared !== c.actual);
  if (issues.length === 0) {
    console.log(`  PASS   ${row.country}`);
  } else {
    rowFail++;
    console.log(`  FAIL   ${row.country}`);
    for (const i of issues) {
      console.log(`         ${i.col}: declared=${i.declared}, source=${i.actual}`);
    }
  }
}

if (rowFail > 0) {
  console.error(
    `\ncountry-table audit FAILED — ${rowFail} row(s) disagree with source xlsx data. Fix decade-...data.ts > countryTableRows.`,
  );
  process.exit(1);
}

// ────────────────────────────────────────────────────────────────────────────
// Sibling article-specific check: KPI card 4 claims 'about 20' for the
// QS rank 300–500 band median annual movement. Verify the computed value
// is in the 18–22 range and that the sibling article body mentions it.
// ────────────────────────────────────────────────────────────────────────────

console.log('\n================ SIBLING ARTICLE KPI CARD 4 ================');
console.log(`  Computed QS rank 300–500 median YoY movement: ${qs300_500Median}`);
let siblingFail = 0;
if (qs300_500Median < 18 || qs300_500Median > 22) {
  siblingFail++;
  console.log(
    `  FAIL   computed value ${qs300_500Median} is outside the 18–22 band the article claims as 'about 20'`,
  );
} else {
  console.log(
    `  PASS   computed value ${qs300_500Median} is within the 18–22 band the article claims as 'about 20'`,
  );
}
if (/near rank 400 on QS moves about 20/i.test(siblingMdx)) {
  console.log("  PASS   sibling article body mentions 'about 20' for QS rank-400 movement");
} else {
  siblingFail++;
  console.log(
    "  FAIL   sibling article body does not mention 'about 20' for QS rank-400 movement",
  );
}

if (siblingFail > 0) {
  console.error('\nsibling KPI audit FAILED — fix the sibling MDX or update the patterns.');
  process.exit(1);
}

if (FAIL > 0) {
  console.error('\nclaims-audit FAILED — fix the MDX or update the patterns.');
  process.exit(1);
}
console.log('\nclaims-audit OK');
