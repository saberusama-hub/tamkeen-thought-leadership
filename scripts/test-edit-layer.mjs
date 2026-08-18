/**
 * scripts/test-edit-layer.mjs
 *
 * End-to-end regression test for the in-browser edit layer, in a real browser.
 *
 * Proves the whole loop rather than any one piece: that a reader sees nothing,
 * that switching edit mode on maps manifest blocks onto live DOM elements,
 * that an edit is tracked and reviewable, that saving splices it into the MDX
 * source at the right byte range, and that leaving edit mode restores the page.
 *
 * Needs a dev server (the write-back route is development-only):
 *   pnpm dev -p 3100
 *   pnpm test:edit-layer
 *
 * The article file is snapshotted before and restored afterwards, so a run
 * leaves the working tree exactly as it found it, pass or fail.
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:3100';
const SLUG = 'rankings-decade-told-straight';
const SRC = new URL('../content/articles/rankings-decade-told-straight.mdx', import.meta.url).pathname;

const snapshot = fs.readFileSync(SRC, 'utf-8');
let failures = 0;
const ok = (label, cond, extra = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  — ' + extra : ''}`);
  if (!cond) failures++;
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.on('pageerror', (e) => console.log('  [pageerror]', e.message));

try {
  // ── 1. Reader sees nothing ────────────────────────────────────────────────
  await page.goto(`${BASE}/articles/${SLUG}`, { waitUntil: 'networkidle' });
  const barForReader = await page.locator('.eid-bar').count();
  const taggedForReader = await page.locator('[data-eid]').count();
  ok('plain visit shows no edit dock', barForReader === 0);
  ok('plain visit tags no blocks', taggedForReader === 0);
  const manifestRequested = [];
  page.on('request', (r) => {
    if (r.url().includes('editorial-manifest')) manifestRequested.push(r.url());
  });

  // ── 2. Edit mode via ?edit=1 ──────────────────────────────────────────────
  await page.goto(`${BASE}/articles/${SLUG}?edit=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.eid-bar', { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-eid]').length > 100, null, {
    timeout: 15000,
  });
  const tagged = await page.locator('[data-eid]').count();
  ok('edit mode tags blocks', tagged > 200, `${tagged} elements tagged`);
  ok('manifest fetched only in edit mode', manifestRequested.length >= 1);

  const meta = (await page.locator('.eid-meta').textContent()) ?? '';
  console.log(`        dock reports: "${meta.trim()}"`);

  // shared blocks are flagged
  const sharedTagged = await page.locator('[data-eid-shared]').count();
  ok('shared blocks flagged in the DOM', sharedTagged > 0, `${sharedTagged} shared`);

  // ── 2b. Focusing a decorated headline must not invent an edit ─────────────
  // ArticleHero/SectionHeader/Headline wrap the emphasis word in <em> that the
  // source frontmatter does not contain. Reading that back as markup would
  // silently rewrite the title, so a focus/blur round trip must be a no-op.
  const h1 = page.locator('h1[data-eid]');
  ok('the headline itself is an editable block', (await h1.count()) === 1);
  const emInH1 = await page.locator('h1[data-eid] em').count();
  ok('headline renders an injected <em> the source lacks', emInH1 === 1);
  await h1.first().click();
  await page.waitForTimeout(100);
  // Blur via the DOM: the Next dev-overlay portal sits over the bottom dock
  // and would intercept a real click there.
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(250);
  const afterTouch = (await page.locator('.eid-count').textContent()) ?? '';
  ok('focus + blur on the headline records no change', /0 changes/.test(afterTouch), `"${afterTouch.trim()}"`);

  // ── 3. Edit a specific, known block ───────────────────────────────────────
  const TARGET = 'B-008';
  const el = page.locator(`[data-eid="${TARGET}"]`);
  ok(`target block ${TARGET} is present`, (await el.count()) === 1);
  const before = (await el.first().textContent())?.trim() ?? '';
  console.log(`        before: ${JSON.stringify(before.slice(0, 74))}`);

  await el.first().scrollIntoViewIfNeeded();
  await el.first().click();
  await page.waitForTimeout(120);
  const editable = await el.first().getAttribute('contenteditable');
  ok('click makes the block contenteditable', editable === 'true');

  const NEW = 'Edited in the browser by the end-to-end test.';
  await page.evaluate(
    ([id, text]) => {
      const n = document.querySelector(`[data-eid="${id}"]`);
      n.textContent = text;
    },
    [TARGET, NEW],
  );
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(250);

  const dirty = await page.locator(`[data-eid="${TARGET}"].eid-dirty`).count();
  ok('edited block is marked dirty', dirty === 1);
  const countTxt = (await page.locator('.eid-count').textContent()) ?? '';
  ok('dock counts the change', /1 change/.test(countTxt), `"${countTxt.trim()}"`);

  // ── 4. Review panel ───────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Review' }).click();
  await page.waitForSelector('.eid-review');
  const rowId = (await page.locator('.eid-row-head code').first().textContent())?.trim();
  ok('review panel lists the edited block', rowId === TARGET, `shows ${rowId}`);
  const after = (await page.locator('.eid-after').first().textContent())?.trim();
  ok('review shows the new text', after === NEW);

  // ── 5. Save -> dev API writes the MDX source ──────────────────────────────
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForSelector('.eid-status', { timeout: 15000 });
  // The dock shows "Saving…" the instant the click lands; wait for it to settle
  // on the real outcome before asserting anything about it.
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector('.eid-status');
        return el && !/Saving/.test(el.textContent ?? '');
      },
      null,
      { timeout: 20000 },
    )
    .catch(() => {});
  const status = (await page.locator('.eid-status').textContent())?.trim() ?? '';
  console.log(`        status: "${status}"`);
  ok('save reports a write to source', /Written to source/.test(status));
  ok('exactly one block was written', /Written to source: 1 block/.test(status));

  const onDisk = fs.readFileSync(SRC, 'utf-8');
  ok('new text is present in the MDX file', onDisk.includes(NEW));
  // Compare against the block's SOURCE form, not its rendered text: B-008
  // carries <strong> markup, so the rendered string never appears verbatim
  // in the MDX and checking for it would pass for the wrong reason.
  const manifest = JSON.parse(
    fs.readFileSync(new URL('../editorial/manifest.json', import.meta.url).pathname, 'utf-8'),
  );
  const srcForm = manifest.blocks.find((b) => b.id === TARGET).display;
  ok('the block source form is gone from the MDX file', !onDisk.includes(srcForm));
  ok('snapshot did contain that source form', snapshot.includes(srcForm));
  ok('file changed by roughly one block', Math.abs(onDisk.length - snapshot.length) < 400);

  // ── 6. Keyboard toggle off ────────────────────────────────────────────────
  await page.keyboard.press('Control+Shift+E');
  await page.waitForTimeout(250);
  ok('Ctrl+Shift+E leaves edit mode', (await page.locator('.eid-bar').count()) === 0);
  ok('leaving edit mode untags blocks', (await page.locator('[data-eid]').count()) === 0);
} catch (err) {
  console.log('  FAIL  exception:', err.message);
  failures++;
} finally {
  fs.writeFileSync(SRC, snapshot);
  console.log('\n  source file restored from snapshot');
  await browser.close();
}

console.log(failures === 0 ? '\n================ E2E PASS ================' : `\n======== ${failures} E2E FAILURE(S) ========`);
process.exit(failures === 0 ? 0 : 1);
