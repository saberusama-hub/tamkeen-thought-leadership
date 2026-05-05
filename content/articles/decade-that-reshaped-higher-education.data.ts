// Static data for the article exhibits.
// Extracted from REFERENCE.html to keep the MDX free of ad-hoc inline data.

export const stackedAreaPaths = [
  // North America
  {
    d: 'M0,300 L0,171 L82,168 L164,168 L246,168 L328,168 L410,174 L492,180 L574,186 L656,189 L738,189 L820,195 L820,300 Z',
    fill: '#003D2B',
  },
  // Western Europe
  {
    d: 'M0,171 L82,168 L164,168 L246,168 L328,168 L410,174 L492,180 L574,186 L656,189 L738,189 L820,195 L820,99 L738,93 L656,93 L574,87 L492,75 L410,69 L328,57 L246,57 L164,54 L82,51 L0,45 Z',
    fill: '#1F5A45',
  },
  // East Asia
  {
    d: 'M0,45 L82,51 L164,54 L246,57 L328,57 L410,69 L492,75 L574,87 L656,93 L738,93 L820,99 L820,39 L738,39 L656,39 L574,33 L492,27 L410,27 L328,21 L246,24 L164,24 L82,24 L0,24 Z',
    fill: '#B5895C',
  },
  // Oceania
  {
    d: 'M0,24 L82,24 L164,24 L246,24 L328,21 L410,27 L492,27 L574,33 L656,39 L738,39 L820,39 L820,21 L738,21 L656,21 L574,15 L492,9 L410,9 L328,3 L246,6 L164,6 L82,6 L0,6 Z',
    fill: '#6B9F88',
  },
  // S. & SE Asia
  {
    d: 'M0,6 L82,6 L164,6 L246,6 L328,3 L410,9 L492,9 L574,15 L656,21 L738,21 L820,21 L820,12 L738,12 L656,12 L574,9 L492,3 L410,3 L328,0 L246,0 L164,0 L82,0 L0,0 Z',
    fill: '#D4E4DD',
  },
  // Other regions
  {
    d: 'M0,0 L82,0 L164,0 L246,0 L328,0 L410,3 L492,3 L574,9 L656,12 L738,12 L820,12 L820,0 L0,0 Z',
    fill: '#EBE2CD',
  },
];

export const stackedAreaLegend = [
  { label: 'North America', color: '#003D2B' },
  { label: 'Western Europe', color: '#1F5A45' },
  { label: 'East Asia', color: '#B5895C' },
  { label: 'Oceania', color: '#6B9F88' },
  { label: 'S. & SE Asia', color: '#D4E4DD' },
  { label: 'Other regions', color: '#EBE2CD' },
];

export const stackedAreaInlineLabels = [
  { x: 20, y: 240, text: 'North America' },
  { x: 20, y: 120, text: 'Western Europe' },
  { x: 710, y: 64, text: 'East Asia' },
];

export const stackedAreaYears = [
  '2016',
  '2017',
  '2018',
  '2019',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
];

export const gainers = [
  { name: 'China', value: 24, fill: '#003D2B' },
  { name: 'Saudi Arabia', value: 8, fill: '#003D2B' },
  { name: 'United Arab Emirates', value: 7, fill: '#003D2B' },
  { name: 'Malaysia', value: 6, fill: '#1F5A45' },
  { name: 'Germany', value: 5, fill: '#1F5A45' },
  { name: 'Australia', value: 5, fill: '#1F5A45' },
  { name: 'Iran, Islamic Rep. of', value: 3, fill: '#6B9F88' },
  { name: 'Korea, Republic of', value: 3, fill: '#6B9F88' },
];

export const decliners = [
  { name: 'Czechia', value: 2, fill: '#E8C7C2' },
  { name: 'Canada', value: 3, fill: '#E8C7C2' },
  { name: 'Russian Federation', value: 4, fill: '#A0342A' },
  { name: 'Spain', value: 4, fill: '#A0342A' },
  { name: 'Italy', value: 8, fill: '#A0342A' },
  { name: 'United Kingdom', value: 9, fill: '#A0342A' },
  { name: 'France', value: 9, fill: '#A0342A' },
  { name: 'United States', value: 20, fill: '#A0342A' },
];

export const volatilityTiers = [
  { label: 'Top 10', qs: 1, the: 1 },
  { label: 'Top 50', qs: 3, the: 2 },
  { label: 'Top 100', qs: 5, the: 5 },
  { label: 'Top 200', qs: 8, the: 10 },
  { label: 'Top 500', qs: 18, the: 18 },
];

export const heatmapRows = [
  {
    label: 'North America',
    cells: [
      { value: 2, display: '+2' },
      { value: 0, display: '0' },
      { value: 4, display: '+4' },
      { value: 8, display: '+8' },
      { value: -2, display: '-2' },
    ],
  },
  {
    label: 'Western Europe',
    cells: [
      { value: 2, display: '+2' },
      { value: 0, display: '0' },
      { value: 6, display: '+6' },
      { value: 6, display: '+6' },
      { value: -4, display: '-4' },
    ],
  },
  {
    label: 'East Asia',
    cells: [
      { value: 4, display: '+4' },
      { value: 14, display: '+14' },
      { value: 36, display: '+36' },
      { value: 32, display: '+32' },
      { value: -4, display: '-4' },
    ],
  },
  {
    label: 'MENA & Gulf',
    cells: [
      { value: 4, display: '+4' },
      { value: 8, display: '+8' },
      { value: 28, display: '+28' },
      { value: 14, display: '+14' },
      { value: -2, display: '-2' },
    ],
  },
  {
    label: 'Oceania',
    cells: [
      { value: 2, display: '+2' },
      { value: 2, display: '+2' },
      { value: 6, display: '+6' },
      { value: 4, display: '+4' },
      { value: -8, display: '-8' },
    ],
  },
];

export const heatmapCols = [
  'Teaching',
  'Research<br/>Environment',
  'Citations /<br/>Research Quality',
  'Industry',
  'International<br/>Outlook',
];

export const risers = [
  { label: 'Shanghai Jiao Tong U.', fromRank: 40, toRank: 188 },
  { label: 'Zhejiang University', fromRank: 39, toRank: 177 },
  { label: 'Fudan University', fromRank: 36, toRank: 155 },
  { label: 'Hong Kong Polytechnic U.', fromRank: 80, toRank: 192 },
  { label: 'Yonsei University', fromRank: 86, toRank: 197 },
  { label: 'Nanjing University', fromRank: 62, toRank: 169 },
  { label: 'Charité Berlin', fromRank: 91, toRank: 195 },
  { label: 'U. Sci. & Tech. of China', fromRank: 51, toRank: 153 },
  { label: 'Chinese U. of Hong Kong', fromRank: 41, toRank: 138 },
  { label: 'KAIST', fromRank: 70, toRank: 148 },
  { label: 'Sungkyunkwan University', fromRank: 87, toRank: 153 },
  { label: 'KTH Royal Inst. of Tech.', fromRank: 98, toRank: 155 },
  { label: 'University of Hamburg', fromRank: 125, toRank: 180 },
  { label: 'Newcastle University', fromRank: 144, toRank: 196 },
  { label: 'U. of Technology Sydney', fromRank: 145, toRank: 196 },
];

export const gerdBubbles = [
  { code: 'CHN', x: 333, y: 41, r: 11, fill: '#003D2B', fillOpacity: 0.7, labelDx: 16, labelDy: 3, labelStrong: true },
  { code: 'KOR', x: 651, y: 99, r: 6, fill: '#003D2B', fillOpacity: 0.55, labelDx: 11, labelDy: 3 },
  { code: 'USA', x: 466, y: 151, r: 13, fill: '#1F5A45', fillOpacity: 0.45, labelDx: 18, labelDy: 3, labelStrong: true },
  { code: 'DEU', x: 412, y: 151, r: 9, fill: '#1F5A45', fillOpacity: 0.5, labelDx: 13, labelDy: -3 },
  { code: 'GBR', x: 359, y: 155, r: 10, fill: '#1F5A45', fillOpacity: 0.5, labelDx: -21, labelDy: 17 },
  { code: 'JPN', x: 439, y: 158, r: 6, fill: '#1F5A45', fillOpacity: 0.5, labelDx: 9, labelDy: 14 },
  { code: 'ISR', x: 745, y: 116, r: 5, fill: '#B5895C', fillOpacity: 0.95, labelDx: 10, labelDy: 3, labelStrong: true },
  { code: 'FRA', x: 293, y: 128, r: 6, fill: '#1F5A45', fillOpacity: 0.5, labelDx: 9, labelDy: 3 },
  { code: 'CAN', x: 226, y: 151, r: 7, fill: '#1F5A45', fillOpacity: 0.5, labelDx: 10, labelDy: 4 },
  { code: 'AUS', x: 239, y: 116, r: 6, fill: '#1F5A45', fillOpacity: 0.5, labelDx: 9, labelDy: 3 },
  { code: 'ITA', x: 200, y: 145, r: 7, fill: '#1F5A45', fillOpacity: 0.5, labelDx: -27, labelDy: -10 },
  { code: 'SAU', x: 93, y: 198, r: 5, fill: '#B5895C', fillOpacity: 0.85, labelDx: 10, labelDy: 3 },
  { code: 'UAE', x: 200, y: 172, r: 5, fill: '#B5895C', fillOpacity: 0.95, labelDx: 0, labelDy: 18, labelTextAnchor: 'middle' as const, labelStrong: true },
  { code: 'RUS', x: 133, y: 305, r: 5, fill: '#A0342A', fillOpacity: 0.75, labelDx: 9, labelDy: 3 },
];

export const gerdAnnotations = [
  { x: 370, y: 22, text: '↑ China and Korea anchor the upside', fill: '#003D2B' },
  { x: 710, y: 83, text: 'Israel: high R&D, modest gain →', textAnchor: 'end' as const },
  { x: 155, y: 296, text: 'Russia: only major negative score change', fill: '#A0342A' },
];

export const scatterPoints = [
  { x: 14, y: 8 },
  { x: 28, y: 14 },
  { x: 42, y: 22 },
  { x: 58, y: 20 },
  { x: 76, y: 34 },
  { x: 92, y: 40 },
  { x: 110, y: 48 },
  { x: 128, y: 56 },
  { x: 144, y: 62 },
  { x: 162, y: 68 },
  { x: 180, y: 76 },
  { x: 196, y: 82 },
  { x: 214, y: 92 },
  { x: 230, y: 100 },
  { x: 248, y: 106 },
  { x: 266, y: 114 },
  { x: 282, y: 122 },
  { x: 300, y: 128 },
  { x: 318, y: 134 },
  { x: 336, y: 142 },
  { x: 352, y: 150 },
  { x: 370, y: 156 },
  { x: 386, y: 164 },
  { x: 404, y: 172 },
  { x: 420, y: 180 },
  { x: 438, y: 188 },
  { x: 456, y: 194 },
  { x: 472, y: 202 },
  { x: 490, y: 210 },
  { x: 508, y: 218 },
  { x: 524, y: 224 },
  { x: 542, y: 232 },
  { x: 560, y: 240 },
  { x: 576, y: 248 },
  { x: 594, y: 254 },
  { x: 612, y: 260 },
  { x: 628, y: 268 },
  { x: 646, y: 274 },
  { x: 664, y: 282 },
  { x: 680, y: 288 },
  { x: 698, y: 294 },
  { x: 716, y: 302 },
  { x: 732, y: 306 },
  { x: 750, y: 312 },
  { x: 768, y: 316 },
  { x: 786, y: 318 },
  { x: 804, y: 316 },
  { x: 50, y: 32 },
  { x: 120, y: 62 },
  { x: 170, y: 58 },
  { x: 220, y: 118 },
  { x: 288, y: 100 },
  { x: 340, y: 124 },
  { x: 400, y: 158 },
  { x: 460, y: 218 },
  { x: 510, y: 186 },
  { x: 580, y: 220 },
  { x: 630, y: 294 },
  { x: 700, y: 270 },
];

export const scatterOutliers = [
  { x: 180, y: 50, label: 'UC Santa Cruz · reads strongly to QS', labelX: 194, labelY: 46 },
  { x: 420, y: 116, label: 'King Abdulaziz · reads strongly to THE', labelX: 434, labelY: 112 },
  { x: 160, y: 240, label: 'Pontificia Univ. Católica de Chile', labelX: 174, labelY: 252 },
  { x: 540, y: 178, label: 'Universiti Teknologi Malaysia', labelX: 554, labelY: 174 },
  { x: 210, y: 300, label: 'Universiti Sains Malaysia', labelX: 222, labelY: 296 },
  { x: 80, y: 260, label: 'University of Tokyo', labelX: 94, labelY: 272 },
];

export const countryTableRows = [
  { country: 'United States', qs17: 97, qs26: 71, qsD: { value: '-26', tone: 'neg' as const }, the16: 122, the26: 102, theD: { value: '-20', tone: 'neg' as const } },
  { country: 'United Kingdom', qs17: 51, qs26: 46, qsD: { value: '-5', tone: 'neg' as const }, the16: 58, the26: 49, theD: { value: '-9', tone: 'neg' as const } },
  { country: 'China', qs17: 24, qs26: 33, qsD: { value: '+9', tone: 'pos' as const }, the16: 11, the26: 35, theD: { value: '+24', tone: 'pos' as const } },
  { country: 'Germany', qs17: 31, qs26: 30, qsD: { value: '-1', tone: 'neg' as const }, the16: 36, the26: 41, theD: { value: '+5', tone: 'pos' as const } },
  { country: 'Australia', qs17: 23, qs26: 28, qsD: { value: '+5', tone: 'pos' as const }, the16: 27, the26: 32, theD: { value: '+5', tone: 'pos' as const } },
  { country: 'Italy', qs17: 12, qs26: 15, qsD: { value: '+3', tone: 'pos' as const }, the16: 33, the26: 25, theD: { value: '-8', tone: 'neg' as const } },
  { country: 'Spain', qs17: 10, qs26: 15, qsD: { value: '+5', tone: 'pos' as const }, the16: '-', the26: '-', theD: '-' },
  { country: 'France', qs17: 20, qs26: 14, qsD: { value: '-6', tone: 'neg' as const }, the16: 20, the26: 11, theD: { value: '-9', tone: 'neg' as const } },
  { country: 'Canada', qs17: 18, qs26: 18, qsD: '+0', the16: 21, the26: 18, theD: { value: '-3', tone: 'neg' as const } },
  { country: 'Korea, Republic of', qs17: 16, qs26: 13, qsD: { value: '-3', tone: 'neg' as const }, the16: 11, the26: 14, theD: { value: '+3', tone: 'pos' as const } },
  { country: 'Japan', qs17: 17, qs26: 13, qsD: { value: '-4', tone: 'neg' as const }, the16: 11, the26: 9, theD: { value: '-2', tone: 'neg' as const } },
  { country: 'Netherlands', qs17: 13, qs26: 13, qsD: '+0', the16: 13, the26: 12, theD: { value: '-1', tone: 'neg' as const } },
  { country: 'Saudi Arabia', qs17: 5, qs26: 9, qsD: { value: '+4', tone: 'pos' as const }, the16: 1, the26: 9, theD: { value: '+8', tone: 'pos' as const } },
  { country: 'Malaysia', qs17: 5, qs26: 10, qsD: { value: '+5', tone: 'pos' as const }, the16: '-', the26: '-', theD: '-' },
  { country: 'United Arab Emirates', qs17: 4, qs26: 6, qsD: { value: '+2', tone: 'pos' as const }, the16: 1, the26: 7, theD: { value: '+6', tone: 'pos' as const } },
];

export const lessonsTableRows = [
  {
    country: 'Greater China',
    data: 'THE Top-100 footprint tripled (4 to 12), driven by Double First-Class which funded disciplines, not institutions, on sustained five-year cycles, with 147 universities designated.',
    lesson: '<strong>Fund disciplines, not institutions.</strong> National research priorities work when they target specific fields with sustained multi-year cycles. Spreading funding evenly across all universities produces aggregate movement; concentrated discipline-level funding produces elite-tier movement.',
  },
  {
    country: 'Singapore',
    data: 'NUS and NTU sit firmly inside the global Top 30 of both systems, sustained for two decades. Two flagships, both elite-tier; the rest of the system is intentionally smaller.',
    lesson: '<strong>Pick fewer, fund longer.</strong> Two world-class flagships outperform five mid-tier institutions for international perception. Concentration of effort produces compound returns; distributed mediocrity does not.',
  },
  {
    country: 'South Korea',
    data: 'KAIST sits at THE 70 (2026) with a strong citation-pillar trajectory. Brain Korea 21 has run since 1999 across multiple administrations; sustained funding for researcher mobility produced compound gains.',
    lesson: '<strong>Researcher-mobility programmes pay off only on a 10-to-15 year horizon.</strong> Sustained funding through political cycles compounds; mid-cycle reorganisation resets the lag clock. Patient capital is the only kind that works in this domain.',
  },
  {
    country: 'Saudi Arabia',
    data: 'Vision 2030 announced "at least five institutions in the global Top 200" as an explicit, time-bound target. THE Top-500 footprint rose from one institution in 2016 to nine in 2026.',
    lesson: '<strong>Target the indicator, not the rank.</strong> A named, time-bound numerical target focuses ministerial effort and creates accountability. Pick a target the data shows is reachable, then fund the indicators that drive it.',
  },
  {
    country: 'United Kingdom',
    data: 'UK Top-100 footprint held flat through the four-year Horizon Europe disengagement (2021 to 2024) despite material loss of EU research-grant pipeline.',
    lesson: '<strong>Reputation moats absorb policy shocks.</strong> Deep alumni networks and reputation-survey strength buy 2 to 4 years of buffer when policy turns adverse. Investing in reputation is investing in resilience.',
  },
  {
    country: 'Australia',
    data: 'Sharpest international-outlook drop of any major host country during 2020 to 2022 COVID border closures. ANU slid from THE 50 to 73; the country-wide international-student funding model proved structurally exposed.',
    lesson: '<strong>Avoid funding-model concentration.</strong> Tying research budgets, faculty hiring, or institutional viability to a single revenue stream creates structural exposure that compounds external shocks. Diversified funding is risk management.',
  },
];
