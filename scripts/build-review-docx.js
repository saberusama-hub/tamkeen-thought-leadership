/**
 * scripts/build-review-docx.js
 *
 * Builds the editorial review document from editorial/manifest.json.
 *
 * Layout: every editable text run gets a grey [ID] label line followed by the
 * text itself as an ordinary paragraph. The editor turns on Track Changes and
 * edits the text lines; the label lines are the anchors that let
 * apply-article-edits.ts splice each edit back to an exact byte range.
 *
 * Text is rendered verbatim, including any inline <strong> markup, because a
 * prettified rendering would not round-trip losslessly.
 *
 * Run: pnpm build:review-doc
 */

const fs = require('node:fs');
const path = require('node:path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber,
} = require('docx');

const ROOT = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'editorial', 'manifest.json'), 'utf-8'),
);

const INK = '1A1A0A';
const GREEN = '3F4818';
const MUTE = '5F5F45';
const GREY = '8A8A78';
const SHARED = '8C5A1F';

const children = [];

// ── Cover / instructions ────────────────────────────────────────────────────
children.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'THE INDEX', bold: true, size: 20, color: GREEN, font: 'Arial' }),
    ],
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Editorial review copy', size: 52, color: GREEN, font: 'Georgia' }),
    ],
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Every line of editable text in both published articles, deduplicated.',
        size: 24,
        italics: true,
        color: MUTE,
        font: 'Georgia',
      }),
    ],
    spacing: { after: 360 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 12 } },
  }),
);

const howTo = [
  [
    'Turn on Track Changes before you start.',
    'In Word: Review → Track Changes → On. Your insertions and deletions are read back directly, so I apply exactly what you marked rather than guessing from a diff.',
  ],
  [
    'Edit the black text only.',
    'The small grey line above each paragraph (for example [A-042] Exhibit › sub) is the anchor that maps your edit back to the right place in the code. Leave those lines alone. If one gets deleted by accident I can still recover it, but it is slower.',
  ],
  [
    'Blocks marked SHARED appear in both articles.',
    'Edit them once here and the change lands in both pieces, keeping the two articles consistent. There are ' +
      manifest.sharedCount +
      ' of them, mostly exhibit captions and source notes.',
  ],
  [
    'Keep any <strong> tags you see.',
    'A few lines carry inline formatting markup. <strong>text</strong> renders as bold on the site. Edit around the tags and leave them in place.',
  ],
  [
    'Comments are welcome.',
    'If you want something rewritten but do not want to draft it yourself, leave a Word comment on the line and I will take it from there.',
  ],
  [
    'Numbers are audited.',
    'Statistics in the text are checked against the source data by an automated audit. If you change a figure the audit may fail, which is a useful signal rather than a problem. I will flag anything that breaks.',
  ],
];

children.push(
  new Paragraph({
    children: [new TextRun({ text: 'How to use this document', bold: true, size: 26, color: INK, font: 'Georgia' })],
    spacing: { before: 200, after: 160 },
  }),
);
howTo.forEach(([head, body], i) => {
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${i + 1}.  `, bold: true, size: 22, color: GREEN, font: 'Arial' }),
        new TextRun({ text: head, bold: true, size: 22, color: INK, font: 'Arial' }),
      ],
      spacing: { before: 140, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: body, size: 21, color: MUTE, font: 'Georgia' })],
      spacing: { after: 60 },
      indent: { left: 340 },
    }),
  );
});

// Summary counts
const countA = manifest.blocks.filter((b) => b.id.startsWith('A-')).length;
const countB = manifest.blocks.filter((b) => b.id.startsWith('B-')).length;
children.push(
  new Paragraph({
    children: [
      new TextRun({
        text: `${manifest.blockCount} editable blocks · ${manifest.sharedCount} shared · ${countA} unique to Article One · ${countB} unique to Article Two`,
        size: 20,
        color: GREY,
        font: 'Arial',
      }),
    ],
    spacing: { before: 360 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'C8CDB8', space: 10 } },
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ── Body ────────────────────────────────────────────────────────────────────
const articles = manifest.generatedFrom;
const articleTitle = { A: 'Article One', B: 'Article Two' };

for (const art of articles) {
  const prefix = art.key;
  // Blocks belonging to this article: own-prefix blocks, plus shared blocks
  // whose first location is in this file (so shared text is shown once, in
  // the article where it first appears).
  const blocks = manifest.blocks.filter((b) => {
    if (b.id.startsWith(prefix + '-')) return true;
    if (b.shared) return b.locations[0].file === art.file;
    return false;
  });
  if (blocks.length === 0) continue;

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({ text: articleTitle[prefix], bold: true, size: 20, color: GREEN, font: 'Arial' }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: art.label, size: 40, color: GREEN, font: 'Georgia' })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `/articles/${art.slug}`, size: 18, color: GREY, font: 'Consolas' }),
      ],
      spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 10 } },
    }),
  );

  let lastSection = null;
  for (const b of blocks) {
    // Section break heading
    if (b.sectionId !== lastSection) {
      lastSection = b.sectionId;
      const secLabel =
        b.path.split(' > ')[0] === 'Front matter' ? 'Headline and standfirst' : b.path.split(' > ')[0];
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: secLabel.toUpperCase(), bold: true, size: 21, color: GREEN, font: 'Arial' }),
          ],
          spacing: { before: 400, after: 160 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 8 } },
        }),
      );
    }

    // Anchor label line
    const trail = b.path.split(' > ').slice(1).join(' › ') || b.kind;
    const labelRuns = [
      new TextRun({ text: `[${b.id}]`, bold: true, size: 16, color: GREY, font: 'Consolas' }),
      new TextRun({ text: `  ${trail}`, size: 16, color: GREY, font: 'Arial' }),
    ];
    if (b.shared) {
      labelRuns.push(
        new TextRun({ text: '   SHARED — also in the other article', size: 16, bold: true, color: SHARED, font: 'Arial' }),
      );
    }
    if (/<strong>|<em[\s>]/.test(b.text)) {
      labelRuns.push(
        new TextRun({ text: '   contains markup', size: 16, italics: true, color: SHARED, font: 'Arial' }),
      );
    }
    children.push(
      new Paragraph({
        style: 'BlockAnchor',
        children: labelRuns,
        spacing: { before: 200, after: 40 },
        keepNext: true,
      }),
    );

    // The editable text itself. `display` has source escaping resolved, so the
    // editor sees Today's rather than Today\'s and cannot double-escape it.
    const display = b.display;
    children.push(
      new Paragraph({
        style: 'EditableText',
        children: [
          new TextRun({
            text: display,
            size: b.minor ? 20 : 22,
            color: INK,
            font: 'Georgia',
          }),
        ],
        spacing: { after: 100, line: 300 },
        indent: { left: 120 },
      }),
    );
  }

  if (prefix === 'A') children.push(new Paragraph({ children: [new PageBreak()] }));
}

// ── Assemble ────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'The Index — editorial tooling',
  title: 'The Index — editorial review copy',
  description: 'Full editable text of both published articles, deduplicated and anchored by block ID.',
  styles: {
    default: {
      document: { run: { font: 'Georgia', size: 22, color: INK } },
    },
    paragraphStyles: [
      {
        // Applied to every paragraph the editor is meant to change. The
        // write-back script keys off this style, so headings, instructions
        // and stray notes can never be mistaken for article text.
        id: 'EditableText',
        name: 'Editable Text',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: 'Georgia', size: 22, color: INK },
      },
      {
        id: 'BlockAnchor',
        name: 'Block Anchor',
        basedOn: 'Normal',
        next: 'EditableText',
        quickFormat: false,
        run: { font: 'Consolas', size: 16, color: GREY },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'The Index · editorial review copy',
                  size: 16,
                  color: GREY,
                  font: 'Arial',
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Page ', size: 16, color: GREY, font: 'Arial' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY, font: 'Arial' }),
                new TextRun({ text: ' of ', size: 16, color: GREY, font: 'Arial' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GREY, font: 'Arial' }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const outPath = path.join(ROOT, 'editorial', 'the-index-editorial-review.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log(`wrote ${outPath}`);
  console.log(`  ${manifest.blockCount} blocks · ${manifest.sharedCount} shared`);
});
