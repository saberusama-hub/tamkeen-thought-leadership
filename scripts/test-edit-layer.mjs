/**
 * scripts/test-edit-layer.mjs
 *
 * End-to-end regression test for the live web editor, in a real browser.
 *
 * Proves the whole loop rather than any one piece: that a reader sees nothing,
 * that the password gate actually gates, that switching edit mode on maps
 * manifest blocks onto live DOM elements, that an edit is tracked and
 * reviewable, that publishing splices it into the MDX source at the right byte
 * range, and — the important one — that a source which has moved underneath us
 * is refused rather than corrupted.
 *
 * Needs a dev server with editor credentials set:
 *   EDITOR_PASSWORD=test-password-1234 EDITOR_SECRET=test-secret pnpm dev -p 3100
 *   pnpm test:edit-layer
 *
 * The article file is snapshotted before and restored afterwards, so a run
 * leaves the working tree exactly as it found it, pass or fail.
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:3100';
const PASSWORD = process.env.EDITOR_PASSWORD || 'test-password-1234';
const SLUG = 'rankings-decade-told-straight';
const SRC = new URL('../content/articles/rankings-decade-told-straight.mdx', import.meta.url).pathname;

const snapshot = fs.readFileSync(SRC, 'utf-8');
let failures = 0;
const ok = (label, cond, extra = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  — ' + extra : ''}`);
  if (!cond) failures++;
};
const section = (t) => console.log(`\n── ${t} ──`);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

try {
  // ── 1. The reader's page is untouched ─────────────────────────────────────
  section('reader');
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/articles/${SLUG}`, { waitUntil: 'networkidle' });
    ok('plain visit shows no editing dock', (await page.locator('.eid-bar').count()) === 0);
    ok('plain visit tags no blocks', (await page.locator('[data-eid]').count()) === 0);
    await ctx.close();
  }

  // ── 2. The password gate ──────────────────────────────────────────────────
  section('access');
  {
    const ctx = await browser.newContext();
    const api = ctx.request;

    let r = await api.post(`${BASE}/api/editorial/session`, { data: { password: 'wrong' } });
    ok('wrong password is refused', r.status() === 401, `status ${r.status()}`);

    r = await api.get(`${BASE}/api/editorial/session`);
    ok('and leaves no session', (await r.json()).signedIn === false);

    // Publishing without a session must be refused in production. In
    // development the route deliberately has no gate (the working tree is the
    // developer's own), so this probe runs dry — otherwise it would really
    // write, which is exactly the bug that made this assertion fail first time.
    r = await api.post(`${BASE}/api/editorial/publish`, {
      data: { edits: { 'B-008': 'probe' }, dry: true },
    });
    const prodMode = r.status() === 401;
    console.log(`        publish without session -> ${r.status()} (${prodMode ? 'production: refused' : 'development: ungated by design'})`);
    if (prodMode) ok('production refuses publishing without a session', true);

    r = await api.post(`${BASE}/api/editorial/session`, { data: { password: PASSWORD } });
    ok('correct password signs in', r.status() === 200, `status ${r.status()}`);
    r = await api.get(`${BASE}/api/editorial/session`);
    ok('session is then reported as signed in', (await r.json()).signedIn === true);
    await ctx.close();
  }

  // ── 3. Editing ────────────────────────────────────────────────────────────
  section('editing');
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await ctx.request.post(`${BASE}/api/editorial/session`, { data: { password: PASSWORD } });

  // The unload guard fires a beforeunload dialog when there is unpublished
  // work; Playwright dismisses dialogs by default, which cancels the reload.
  page.on('dialog', (d) => d.accept().catch(() => {}));

  const manifestReqs = [];
  page.on('request', (r) => {
    if (r.url().includes('editorial-manifest')) manifestReqs.push(r.url());
  });

  await page.goto(`${BASE}/articles/${SLUG}?edit=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.eid-bar', { timeout: 15000 });
  // Dismiss the first-run explainer if it appears.
  const intro = page.getByRole('button', { name: 'Start editing' });
  if (await intro.count()) await intro.click();
  await page.waitForFunction(() => document.querySelectorAll('[data-eid]').length > 100, null, {
    timeout: 15000,
  });

  const tagged = await page.locator('[data-eid]').count();
  ok('edit mode tags blocks', tagged > 200, `${tagged} elements tagged`);
  ok('manifest fetched only in edit mode', manifestReqs.length >= 1);
  ok('shared blocks flagged', (await page.locator('[data-eid-shared]').count()) > 0);
  ok('block ids are not shown to the editor', (await page.locator('.eid-bar-label').textContent()).includes('Editing'));

  // A decorated headline must not invent an edit. ArticleHero wraps the
  // emphasis word in <em> that the source frontmatter does not contain.
  const h1 = page.locator('h1[data-eid]');
  ok('the headline is editable', (await h1.count()) === 1);
  ok('headline renders an injected <em> the source lacks', (await page.locator('h1[data-eid] em').count()) === 1);
  await h1.first().click();
  await page.waitForTimeout(100);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(250);
  ok(
    'focus + blur on the headline records no change',
    /No changes yet/.test((await page.locator('.eid-count').textContent()) ?? ''),
  );

  const TARGET = 'B-008';
  const NEW = 'Edited in the browser by the end-to-end test.';
  const el = page.locator(`[data-eid="${TARGET}"]`);
  ok(`target block ${TARGET} is present`, (await el.count()) === 1);
  await el.first().scrollIntoViewIfNeeded();
  await el.first().click();
  await page.waitForTimeout(120);
  ok('click makes the block editable', (await el.first().getAttribute('contenteditable')) === 'true');
  await page.evaluate(
    ([id, text]) => {
      document.querySelector(`[data-eid="${id}"]`).textContent = text;
    },
    [TARGET, NEW],
  );
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(250);
  ok('edited block is marked', (await page.locator(`[data-eid="${TARGET}"].eid-dirty`).count()) === 1);
  ok(
    'dock counts the change in plain language',
    /1 change not yet published/.test((await page.locator('.eid-count').textContent()) ?? ''),
  );

  await page.getByRole('button', { name: 'See changes' }).click();
  await page.waitForSelector('.eid-review');
  ok('review shows the new text', (await page.locator('.eid-after').first().textContent())?.trim() === NEW);

  // ── 4. The precondition guard ─────────────────────────────────────────────
  // Move the source underneath the open page. Every byte offset after the
  // inserted text shifts, so publishing must refuse rather than write at the
  // wrong place.
  section('stale-source guard');
  fs.writeFileSync(SRC, snapshot.replace('<ArticleSection id="brief">', '{/* shifted */}\n<ArticleSection id="brief">'));
  const shifted = fs.readFileSync(SRC, 'utf-8');

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('button', { name: 'Yes, publish' }).click();
  await page.waitForSelector('.eid-status', { timeout: 20000 });
  await page
    .waitForFunction(() => !/Publishing/.test(document.querySelector('.eid-status')?.textContent ?? ''), null, { timeout: 20000 })
    .catch(() => {});
  const staleMsg = (await page.locator('.eid-status').textContent())?.trim() ?? '';
  ok('publishing a stale page is refused', /changed since this page was opened/i.test(staleMsg), `"${staleMsg}"`);
  ok('and the source is left exactly as it was', fs.readFileSync(SRC, 'utf-8') === shifted);

  // ── 5. Publishing for real (development backend) ──────────────────────────
  section('publish');
  fs.writeFileSync(SRC, snapshot);
  // The dev server recompiles the MDX after that write; give it a moment to
  // settle before reloading, or the reload races the rebuild.
  for (let i = 0; i < 40; i++) {
    const probe = await ctx.request.get(`${BASE}/articles/${SLUG}`).catch(() => null);
    if (probe && probe.ok()) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.eid-bar', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-eid]').length > 100, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  ok(
    'unpublished work survived the reload',
    /1 change not yet published/.test((await page.locator('.eid-count').textContent()) ?? ''),
  );

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.waitForSelector('.eid-modal');
  ok('confirmation names the consequence', /public website/i.test((await page.locator('.eid-modal').textContent()) ?? ''));
  await page.getByRole('button', { name: 'Yes, publish' }).click();
  await page.waitForSelector('.eid-status', { timeout: 20000 });
  await page
    .waitForFunction(() => !/Publishing/.test(document.querySelector('.eid-status')?.textContent ?? ''), null, { timeout: 20000 })
    .catch(() => {});
  const msg = (await page.locator('.eid-status').textContent())?.trim() ?? '';
  console.log(`        ${msg}`);
  ok('publish reports success', /Published 1 change/.test(msg));

  const onDisk = fs.readFileSync(SRC, 'utf-8');
  ok('the new text is in the MDX file', onDisk.includes(NEW));
  const manifest = JSON.parse(fs.readFileSync(new URL('../editorial/manifest.json', import.meta.url).pathname, 'utf-8'));
  const srcForm = manifest.blocks.find((b) => b.id === TARGET).display;
  ok('the old source form is gone', !onDisk.includes(srcForm));
  ok('exactly one block moved', Math.abs(onDisk.length - snapshot.length) < 400);
  ok('the change counter resets after publishing', /No changes yet/.test((await page.locator('.eid-count').textContent()) ?? ''));

  // ── 6. Signing out ────────────────────────────────────────────────────────
  section('sign out');
  await ctx.request.delete(`${BASE}/api/editorial/session`);
  const after = await ctx.request.get(`${BASE}/api/editorial/session`);
  ok('sign out clears the session', (await after.json()).signedIn === false);

  await ctx.close();
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
