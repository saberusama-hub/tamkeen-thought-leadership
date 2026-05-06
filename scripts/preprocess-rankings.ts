/**
 * scripts/preprocess-rankings.ts
 *
 * Read THE (2016-2026) and QS (2017-2026) xlsx source data; emit:
 *   - content/data/rankings-master.json   — every row, both systems
 *   - content/data/the-top20-by-year.json — for the BarRace chart
 *   - content/data/the-bump-cohort.json   — Top 20 in 2016 tracked through 2026
 *   - content/data/computed-claims.json   — analytical aggregates that
 *                                           the article cites; the
 *                                           single source of truth used
 *                                           by scripts/claims-audit.ts.
 *
 * Run:  pnpm preprocess
 */

import XLSX from 'xlsx';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

type System = 'THE' | 'QS';

interface RawRow {
  system: System;
  year: number;
  /** Integer rank if available, null otherwise. */
  rank: number | null;
  /** Numeric rank used for analysis. Banded ranks are converted to midpoints. */
  rankNumeric: number;
  isBanded: boolean;
  rankBand?: string;
  university: string;
  city: string;
  country: string;
  overall?: number;
  pillars: Record<string, number>;
}

const ROOT = process.cwd();
const RANKINGS = path.join(ROOT, 'Rankings');
const OUT = path.join(ROOT, 'content', 'data');

mkdirSync(OUT, { recursive: true });

// ────────────────────────────────────────────────────────────────────────────
// Country normalisation and region mapping (per the report's classification).
// ────────────────────────────────────────────────────────────────────────────

const COUNTRY_ALIASES: Record<string, string> = {
  'United States of America': 'United States',
  USA: 'United States',
  UK: 'United Kingdom',
  'Russian Federation': 'Russia',
  Czechia: 'Czech Republic',
  'Iran, Islamic Republic of': 'Iran',
  'Korea, Republic of': 'South Korea',
  'Republic of Ireland': 'Ireland',
  'Hong Kong SAR': 'Hong Kong',
  Macao: 'Macau',
};

function normCountry(c: string): string {
  const k = String(c ?? '').trim();
  return COUNTRY_ALIASES[k] ?? k;
}

/**
 * Aggressive institution name normalisation, per the report's Appendix A.
 *
 *   - lowercase
 *   - strip parenthetical suffixes: "MIT (Massachusetts Institute of …)" → "mit"
 *   - drop leading "the "
 *   - drop common abbreviations and qualifiers in brackets
 *   - normalise punctuation to spaces, then collapse whitespace
 *   - normalise umlauts and diacritics (NFD strip)
 *
 * Without this, the same institution named slightly differently across years
 * counts as multiple institutions, inflating the "decade entrants" count.
 */
const NAME_HARD_ALIASES: Record<string, string> = {
  // Apply BEFORE normalisation. Both source spellings should reduce to the
  // same canonical id.
  'khalifa university of science and technology': 'khalifa university',
  'king abdulaziz university (kau)': 'king abdulaziz university',
  'king abdul aziz university (kau)': 'king abdulaziz university',
  'king abdul aziz university': 'king abdulaziz university',
  'king fahd university of petroleum & minerals': 'king fahd university of petroleum and minerals',
  'massachusetts institute of technology (mit)': 'massachusetts institute of technology',
  'imam abdulrahman bin faisal university (formerly university of dammam)':
    'imam abdulrahman bin faisal university',
  'imam abdulrahman bin faisal university (iau) (formerly university of dammam)':
    'imam abdulrahman bin faisal university',
  'university of california, los angeles (ucla)': 'university of california los angeles',
  'london school of economics and political science (lse)':
    'london school of economics and political science',
  'university of california,berkeley': 'university of california berkeley',
  'university of california, berkeley': 'university of california berkeley',
};

function normName(raw: string): string {
  let s = String(raw ?? '').toLowerCase().trim();
  // hard alias
  if (NAME_HARD_ALIASES[s]) return NAME_HARD_ALIASES[s];
  // strip parenthetical groups
  s = s.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  // strip leading "the "
  s = s.replace(/^the\s+/, '');
  // unify hyphens, em-dashes, en-dashes
  s = s.replace(/[-–—]/g, ' ');
  // unify ampersand → and
  s = s.replace(/&/g, ' and ');
  // unify apostrophes
  s = s.replace(/[’`']/g, '');
  // strip diacritics
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // commas → spaces
  s = s.replace(/[,;:]/g, ' ');
  // collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // re-check hard alias after normalisation
  if (NAME_HARD_ALIASES[s]) return NAME_HARD_ALIASES[s];
  return s;
}

/** Identity tuple for joining institution rows across years. */
function instId(country: string, name: string): string {
  return `${country}::${normName(name)}`;
}

const REGION_MAP: Record<string, string> = {
  // North America
  'United States': 'North America',
  Canada: 'North America',
  // Western Europe
  'United Kingdom': 'Western Europe',
  Germany: 'Western Europe',
  France: 'Western Europe',
  Switzerland: 'Western Europe',
  Netherlands: 'Western Europe',
  Belgium: 'Western Europe',
  Sweden: 'Western Europe',
  Denmark: 'Western Europe',
  Norway: 'Western Europe',
  Finland: 'Western Europe',
  Ireland: 'Western Europe',
  Italy: 'Western Europe',
  Spain: 'Western Europe',
  Portugal: 'Western Europe',
  Austria: 'Western Europe',
  Iceland: 'Western Europe',
  Greece: 'Western Europe',
  Luxembourg: 'Western Europe',
  Malta: 'Western Europe',
  Cyprus: 'Western Europe',
  // Eastern Europe
  Russia: 'Eastern Europe',
  Poland: 'Eastern Europe',
  'Czech Republic': 'Eastern Europe',
  Hungary: 'Eastern Europe',
  Romania: 'Eastern Europe',
  Slovakia: 'Eastern Europe',
  Slovenia: 'Eastern Europe',
  Bulgaria: 'Eastern Europe',
  Croatia: 'Eastern Europe',
  Estonia: 'Eastern Europe',
  Latvia: 'Eastern Europe',
  Lithuania: 'Eastern Europe',
  Serbia: 'Eastern Europe',
  Ukraine: 'Eastern Europe',
  Belarus: 'Eastern Europe',
  // East Asia
  China: 'East Asia',
  'Hong Kong': 'East Asia',
  Macau: 'East Asia',
  Taiwan: 'East Asia',
  Japan: 'East Asia',
  'South Korea': 'East Asia',
  'North Korea': 'East Asia',
  Mongolia: 'East Asia',
  // South & Southeast Asia
  India: 'South & Southeast Asia',
  Pakistan: 'South & Southeast Asia',
  Bangladesh: 'South & Southeast Asia',
  'Sri Lanka': 'South & Southeast Asia',
  Singapore: 'South & Southeast Asia',
  Malaysia: 'South & Southeast Asia',
  Indonesia: 'South & Southeast Asia',
  Thailand: 'South & Southeast Asia',
  Vietnam: 'South & Southeast Asia',
  Philippines: 'South & Southeast Asia',
  Brunei: 'South & Southeast Asia',
  // Oceania
  Australia: 'Oceania',
  'New Zealand': 'Oceania',
  // MENA
  'Saudi Arabia': 'MENA',
  'United Arab Emirates': 'MENA',
  Qatar: 'MENA',
  Kuwait: 'MENA',
  Bahrain: 'MENA',
  Oman: 'MENA',
  Iran: 'MENA',
  Israel: 'MENA',
  Turkey: 'MENA',
  Egypt: 'MENA',
  Jordan: 'MENA',
  Lebanon: 'MENA',
  Iraq: 'MENA',
  Morocco: 'MENA',
  Tunisia: 'MENA',
  Algeria: 'MENA',
  Palestine: 'MENA',
  Yemen: 'MENA',
  Libya: 'MENA',
  // Sub-Saharan Africa
  'South Africa': 'Sub-Saharan Africa',
  Nigeria: 'Sub-Saharan Africa',
  Kenya: 'Sub-Saharan Africa',
  Ghana: 'Sub-Saharan Africa',
  Uganda: 'Sub-Saharan Africa',
  Tanzania: 'Sub-Saharan Africa',
  Ethiopia: 'Sub-Saharan Africa',
  Senegal: 'Sub-Saharan Africa',
  Zimbabwe: 'Sub-Saharan Africa',
  Botswana: 'Sub-Saharan Africa',
  // Latin America
  Brazil: 'Latin America',
  Argentina: 'Latin America',
  Chile: 'Latin America',
  Colombia: 'Latin America',
  Peru: 'Latin America',
  Mexico: 'Latin America',
  Venezuela: 'Latin America',
  Ecuador: 'Latin America',
  Uruguay: 'Latin America',
  'Costa Rica': 'Latin America',
  Cuba: 'Latin America',
  'Puerto Rico': 'Latin America',
  Panama: 'Latin America',
  Bolivia: 'Latin America',
  'Dominican Republic': 'Latin America',
};

const GREATER_CHINA = new Set(['China', 'Hong Kong', 'Macau', 'Taiwan']);

function regionOf(country: string): string {
  return REGION_MAP[country] ?? 'Other';
}

// ────────────────────────────────────────────────────────────────────────────
// Rank parsing.
// ────────────────────────────────────────────────────────────────────────────

function parseRank(v: unknown): {
  rank: number | null;
  rankNumeric: number;
  isBanded: boolean;
  band?: string;
} {
  if (v == null) return { rank: null, rankNumeric: NaN, isBanded: false };
  if (typeof v === 'number') {
    return { rank: v, rankNumeric: v, isBanded: false };
  }
  const s = String(v).trim().replace(/^=/, '');
  if (/^\d+$/.test(s)) {
    const n = Number.parseInt(s, 10);
    return { rank: n, rankNumeric: n, isBanded: false };
  }
  // banded "201-250", "201–250", "201—250"
  const m = s.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
  if (m) {
    const a = Number.parseInt(m[1]!, 10);
    const b = Number.parseInt(m[2]!, 10);
    return { rank: null, rankNumeric: (a + b) / 2, isBanded: true, band: s };
  }
  // "1001+", "601+"
  const m2 = s.match(/^(\d+)\+$/);
  if (m2) {
    const a = Number.parseInt(m2[1]!, 10);
    return { rank: null, rankNumeric: a + 50, isBanded: true, band: s };
  }
  return { rank: null, rankNumeric: NaN, isBanded: false, band: s };
}

// ────────────────────────────────────────────────────────────────────────────
// Workbook reader.
// ────────────────────────────────────────────────────────────────────────────

function readWorkbook(file: string, system: System): RawRow[] {
  const wb = XLSX.readFile(file);
  const all: RawRow[] = [];
  for (const sheetName of wb.SheetNames) {
    const year = Number.parseInt(sheetName, 10);
    if (!Number.isFinite(year)) continue;
    const sheet = wb.Sheets[sheetName]!;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true }) as unknown[][];
    if (rows.length === 0) continue;
    const headers = (rows[0] ?? []).map((x) => String(x ?? ''));
    const idxByHeader = (name: string) =>
      headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    const iRank = idxByHeader(`${system} Rank`);
    const iName = idxByHeader('University Name');
    const iCity = idxByHeader('City');
    const iCountry = idxByHeader('Country');
    const iOverall = idxByHeader('Overall Score');
    if (iRank < 0 || iName < 0) {
      throw new Error(`Sheet ${sheetName} in ${file} missing required columns`);
    }
    const reservedCols = new Set([iRank, iName, iCity, iCountry, iOverall]);
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]!;
      const name = row[iName];
      if (!name) continue;
      const { rank, rankNumeric, isBanded, band } = parseRank(row[iRank]);
      if (!Number.isFinite(rankNumeric)) continue;
      const pillars: Record<string, number> = {};
      for (let c = 0; c < headers.length; c++) {
        if (reservedCols.has(c)) continue;
        const val = row[c];
        if (typeof val === 'number') pillars[headers[c]!] = val;
      }
      all.push({
        system,
        year,
        rank,
        rankNumeric,
        isBanded,
        rankBand: band,
        university: String(name).trim(),
        city: String(row[iCity] ?? '').trim(),
        country: normCountry(String(row[iCountry] ?? '').trim()),
        overall: typeof row[iOverall] === 'number' ? (row[iOverall] as number) : undefined,
        pillars,
      });
    }
  }
  return all;
}

// ────────────────────────────────────────────────────────────────────────────
// Analytical aggregates (what the report and the article cite).
// ────────────────────────────────────────────────────────────────────────────

function groupBy<T, K>(arr: T[], key: (x: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const x of arr) {
    const k = key(x);
    let bucket = m.get(k);
    if (!bucket) {
      bucket = [];
      m.set(k, bucket);
    }
    bucket.push(x);
  }
  return m;
}

function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

/**
 * Median absolute year-over-year rank change for institutions present with
 * INTEGER ranks in two consecutive years, where year (t-1) rank is within
 * the given tier cap. Per the report's methodology (Appendix A): banded
 * ranks excluded; tied markers stripped.
 */
function medianAnnualRankShiftByTier(
  rows: RawRow[],
  system: System,
  tierCap: number,
): { tier: number; system: System; n: number; median: number } {
  const sys = rows.filter((r) => r.system === system);
  const byInst = groupBy(sys, (r) => instId(r.country, r.university));
  const shifts: number[] = [];
  for (const [, instRows] of byInst) {
    const sorted = [...instRows].sort((a, b) => a.year - b.year);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const cur = sorted[i]!;
      if (cur.year - prev.year !== 1) continue;
      if (prev.rank == null || cur.rank == null) continue;
      if (prev.rank > tierCap) continue;
      shifts.push(Math.abs(cur.rank - prev.rank));
    }
  }
  return { tier: tierCap, system, n: shifts.length, median: median(shifts) };
}

/**
 * Count distinct institutions in a system's Top N for a given year.
 *
 * For Top 100 / 200 we only count integer-ranked rows (banded ranks start
 * at 201 in THE; they cannot be in Top 100). For Top >= 250 (e.g. Top 500)
 * we count ALL rows that the source sheet placed within that band, banded
 * or integer. This matches how the report counts Top-500 footprints.
 */
function topNCountByCountry(
  rows: RawRow[],
  system: System,
  year: number,
  topN: number,
): Record<string, number> {
  const filtered = rows.filter((r) => {
    if (r.system !== system || r.year !== year) return false;
    if (!Number.isFinite(r.rankNumeric)) return false;
    if (topN <= 200) {
      // Strict: integer ranks only.
      return !r.isBanded && r.rank != null && r.rank <= topN;
    }
    // Top 250 / 500: include banded rows whose midpoint is within N.
    return r.rankNumeric <= topN;
  });
  const counts: Record<string, number> = {};
  for (const r of filtered) {
    counts[r.country] = (counts[r.country] ?? 0) + 1;
  }
  return counts;
}

/** Count by region in Top N. */
function topNCountByRegion(
  rows: RawRow[],
  system: System,
  year: number,
  topN: number,
): Record<string, number> {
  const counts = topNCountByCountry(rows, system, year, topN);
  const byRegion: Record<string, number> = {};
  for (const [country, n] of Object.entries(counts)) {
    const r = regionOf(country);
    byRegion[r] = (byRegion[r] ?? 0) + n;
  }
  return byRegion;
}

function greaterChinaCount(rows: RawRow[], system: System, year: number, topN: number): number {
  const counts = topNCountByCountry(rows, system, year, topN);
  let n = 0;
  for (const c of GREATER_CHINA) {
    n += counts[c] ?? 0;
  }
  return n;
}

/**
 * Count of distinct institutions appearing in a system's Top 500 in EITHER
 * year, but NOT in the corresponding base year (i.e. "entrants" over the
 * decade). Uses canonical name + country as identity. Only integer-ranked
 * rows count, per the report's methodology.
 */
function decadeEntrantsTop500(
  rows: RawRow[],
  system: System,
  startYear: number,
  endYear: number,
): { entrants: number; exits: number; both: number } {
  const inTop500 = (r: RawRow) =>
    r.system === system && Number.isFinite(r.rankNumeric) && r.rankNumeric <= 500;
  const idOf = (r: RawRow) => instId(r.country, r.university);
  const start = new Set(rows.filter((r) => r.year === startYear && inTop500(r)).map(idOf));
  const end = new Set(rows.filter((r) => r.year === endYear && inTop500(r)).map(idOf));
  let entrants = 0;
  let exits = 0;
  let both = 0;
  for (const id of end) if (!start.has(id)) entrants++;
  for (const id of start) if (!end.has(id)) exits++;
  for (const id of end) if (start.has(id)) both++;
  return { entrants, exits, both };
}

function distinctInstitutions(rows: RawRow[]): { institutions: number; countries: number } {
  const inst = new Set<string>();
  const countries = new Set<string>();
  for (const r of rows) {
    inst.add(instId(r.country, r.university));
    countries.add(r.country);
  }
  return { institutions: inst.size, countries: countries.size };
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────────

console.log('reading workbooks...');
const theRaw = readWorkbook(
  path.join(RANKINGS, 'THE_World_University_Rankings_2016_2026 (1).xlsx'),
  'THE',
);
const qsRaw = readWorkbook(
  path.join(RANKINGS, 'QS_World_University_Rankings_2017_2026.xlsx'),
  'QS',
);
const allRaw = [...theRaw, ...qsRaw];
console.log(`  THE rows: ${theRaw.length}`);
console.log(`  QS rows:  ${qsRaw.length}`);

// ── master json (compact form, only what charts need) ──────────────────────
console.log('writing master.json (compact, no pillar detail)');
const masterRows = allRaw.map((r) => ({
  system: r.system,
  year: r.year,
  rank: r.rank,
  rankNumeric: r.rankNumeric,
  isBanded: r.isBanded,
  university: r.university,
  country: r.country,
  region: regionOf(r.country),
  greaterChina: GREATER_CHINA.has(r.country),
  overall: r.overall,
}));
writeFileSync(path.join(OUT, 'rankings-master.json'), JSON.stringify(masterRows));

// ── THE Top 20 by year for the BarRace chart ───────────────────────────────
console.log('writing the-top20-by-year.json');
const theYears = [...new Set(theRaw.map((r) => r.year))].sort((a, b) => a - b);
const top20ByYear = theYears.map((year) => ({
  year,
  bars: theRaw
    .filter((r) => r.year === year && r.rank != null && r.rank <= 20 && r.overall != null)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((r) => ({
      rank: r.rank!,
      university: r.university,
      country: r.country,
      region: regionOf(r.country),
      greaterChina: GREATER_CHINA.has(r.country),
      overall: r.overall!,
    })),
}));
writeFileSync(path.join(OUT, 'the-top20-by-year.json'), JSON.stringify(top20ByYear, null, 2));

// ── BumpChart cohort: Top 20 in 2016 (THE) tracked through 2026 ────────────
console.log('writing the-bump-cohort.json');
const seedCohort = theRaw
  .filter((r) => r.year === 2016 && r.rank != null && r.rank <= 20)
  .map((r) => ({ university: r.university, country: r.country }));
const cohortIds = new Set(seedCohort.map((s) => instId(s.country, s.university)));
const cohortLines = seedCohort.map((seed) => {
  const seedId = instId(seed.country, seed.university);
  const ranks: { year: number; rank: number | null; rankNumeric: number; isBanded: boolean }[] = [];
  for (const year of theYears) {
    const row = theRaw.find(
      (r) => r.year === year && instId(r.country, r.university) === seedId,
    );
    if (row) {
      ranks.push({
        year,
        rank: row.rank,
        rankNumeric: row.rankNumeric,
        isBanded: row.isBanded,
      });
    }
  }
  return {
    university: seed.university,
    country: seed.country,
    region: regionOf(seed.country),
    greaterChina: GREATER_CHINA.has(seed.country),
    ranks,
  };
});
writeFileSync(
  path.join(OUT, 'the-bump-cohort.json'),
  JSON.stringify({ cohortSize: cohortIds.size, lines: cohortLines }, null, 2),
);

// ── Regional composition by year, Top 100 ─────────────────────────────────
console.log('writing regional-composition.json');
const regionalTHE = theYears.map((year) => ({
  year,
  byRegion: topNCountByRegion(allRaw, 'THE', year, 100),
}));
const qsYears = [...new Set(qsRaw.map((r) => r.year))].sort((a, b) => a - b);
const regionalQS = qsYears.map((year) => ({
  year,
  byRegion: topNCountByRegion(allRaw, 'QS', year, 100),
}));
writeFileSync(
  path.join(OUT, 'regional-composition.json'),
  JSON.stringify({ THE: regionalTHE, QS: regionalQS }, null, 2),
);

// ── Computed claims (the truth panel for the audit) ───────────────────────
console.log('computing analytical claims...');

const claims = {
  // Distinct institution / country counts.
  distinctInstitutions: distinctInstitutions(allRaw).institutions,
  distinctCountries: distinctInstitutions(allRaw).countries,
  totalRows: allRaw.length,

  // Country counts in THE Top 100.
  USTheTop100_2016: topNCountByCountry(allRaw, 'THE', 2016, 100)['United States'] ?? 0,
  USTheTop100_2026: topNCountByCountry(allRaw, 'THE', 2026, 100)['United States'] ?? 0,
  USQsTop100_2017: topNCountByCountry(allRaw, 'QS', 2017, 100)['United States'] ?? 0,
  USQsTop100_2026: topNCountByCountry(allRaw, 'QS', 2026, 100)['United States'] ?? 0,

  // Greater China.
  greaterChinaTheTop100_2016: greaterChinaCount(allRaw, 'THE', 2016, 100),
  greaterChinaTheTop100_2026: greaterChinaCount(allRaw, 'THE', 2026, 100),

  // Asia (East Asia + S&SE Asia) THE Top 100 share.
  asiaTheTop100Share_2016:
    ((topNCountByRegion(allRaw, 'THE', 2016, 100)['East Asia'] ?? 0) +
      (topNCountByRegion(allRaw, 'THE', 2016, 100)['South & Southeast Asia'] ?? 0)) /
    100,
  asiaTheTop100Share_2026:
    ((topNCountByRegion(allRaw, 'THE', 2026, 100)['East Asia'] ?? 0) +
      (topNCountByRegion(allRaw, 'THE', 2026, 100)['South & Southeast Asia'] ?? 0)) /
    100,

  // Top-500 entrants over decade.
  qsTop500Entrants_2017_2026: decadeEntrantsTop500(allRaw, 'QS', 2017, 2026).entrants,
  qsTop500Both_2017_2026: decadeEntrantsTop500(allRaw, 'QS', 2017, 2026).both,
  qsTop500Exits_2017_2026: decadeEntrantsTop500(allRaw, 'QS', 2017, 2026).exits,
  theTop500Entrants_2016_2026: decadeEntrantsTop500(allRaw, 'THE', 2016, 2026).entrants,
  theTop500Both_2016_2026: decadeEntrantsTop500(allRaw, 'THE', 2016, 2026).both,
  theTop500Exits_2016_2026: decadeEntrantsTop500(allRaw, 'THE', 2016, 2026).exits,

  // Median annual rank shift by tier (THE).
  medianYoYShift_THE_top10: medianAnnualRankShiftByTier(allRaw, 'THE', 10).median,
  medianYoYShift_THE_top500: medianAnnualRankShiftByTier(allRaw, 'THE', 500).median,
  medianYoYShift_QS_top10: medianAnnualRankShiftByTier(allRaw, 'QS', 10).median,
  medianYoYShift_QS_top500: medianAnnualRankShiftByTier(allRaw, 'QS', 500).median,

  // UAE footprint.
  uaeTheTop500_2016: topNCountByCountry(allRaw, 'THE', 2016, 500)['United Arab Emirates'] ?? 0,
  uaeTheTop500_2026: topNCountByCountry(allRaw, 'THE', 2026, 500)['United Arab Emirates'] ?? 0,
  uaeQsTop500_2017: topNCountByCountry(allRaw, 'QS', 2017, 500)['United Arab Emirates'] ?? 0,
  uaeQsTop500_2026: topNCountByCountry(allRaw, 'QS', 2026, 500)['United Arab Emirates'] ?? 0,

  // Saudi footprint.
  saudiTheTop500_2016: topNCountByCountry(allRaw, 'THE', 2016, 500)['Saudi Arabia'] ?? 0,
  saudiTheTop500_2026: topNCountByCountry(allRaw, 'THE', 2026, 500)['Saudi Arabia'] ?? 0,

  // Khalifa University tracking (QS).
  khalifaQS_2017: (() => {
    const r = qsRaw.find(
      (x) => x.year === 2017 && x.university.toLowerCase().includes('khalifa'),
    );
    return r ? r.rankNumeric : null;
  })(),
  khalifaQS_2026: (() => {
    const r = qsRaw.find(
      (x) => x.year === 2026 && x.university.toLowerCase().includes('khalifa'),
    );
    return r ? r.rankNumeric : null;
  })(),

  // Truth-panel sanity.
  truthPanel: {
    nyu_qs_2026: (() => {
      const r = qsRaw.find(
        (x) =>
          x.year === 2026 &&
          x.university.toLowerCase().startsWith('new york university') &&
          !x.university.toLowerCase().includes('abu dhabi') &&
          !x.university.toLowerCase().includes('shanghai'),
      );
      return r?.rank ?? null;
    })(),
    tsinghua_the_2026: (() => {
      const r = theRaw.find(
        (x) => x.year === 2026 && x.university.toLowerCase() === 'tsinghua university',
      );
      return r?.rank ?? null;
    })(),
    mit_the_2016: (() => {
      const r = theRaw.find(
        (x) =>
          x.year === 2016 && x.university.toLowerCase().includes('massachusetts institute'),
      );
      return r?.rank ?? null;
    })(),
  },
};

writeFileSync(path.join(OUT, 'computed-claims.json'), JSON.stringify(claims, null, 2));
console.log('done');
console.log('---');
console.log(JSON.stringify(claims, null, 2));
