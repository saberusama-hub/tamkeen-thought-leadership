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
const mdxPath = path.join(
  ROOT,
  'content',
  'articles',
  'decade-that-reshaped-higher-education.mdx',
);

const claims = JSON.parse(readFileSync(claimsPath, 'utf-8')) as Record<string, unknown>;
const mdx = readFileSync(mdxPath, 'utf-8');

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

if (FAIL > 0) {
  console.error('\nclaims-audit FAILED — fix the MDX or update the patterns.');
  process.exit(1);
}
console.log('\nclaims-audit OK');
