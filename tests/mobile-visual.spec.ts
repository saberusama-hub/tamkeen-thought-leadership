import { test } from '@playwright/test';

interface PageDef {
  name: string;
  path: string;
  fullPage: boolean;
  scrollStops: number; // additional viewport-height shots (0 = just hero)
}

const pages: PageDef[] = [
  { name: 'home', path: '/', fullPage: true, scrollStops: 0 },
  { name: 'about', path: '/about', fullPage: true, scrollStops: 0 },
  // Article is too tall for webkit's 32K-pixel screenshot cap, so we don't
  // try fullPage; instead we walk down in viewport-height stops to give a
  // representative sample of mobile rendering across the piece.
  { name: 'article', path: '/articles/decade-that-reshaped-higher-education', fullPage: false, scrollStops: 8 },
];

for (const p of pages) {
  test(`${p.name} renders without obvious mobile issues`, async ({ page }, info) => {
    await page.goto(p.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    // Hero (above-the-fold) — best for QA glance.
    await page.screenshot({
      path: `tests/screenshots/${info.project.name}__${p.name}__01-hero.png`,
      fullPage: false,
      animations: 'disabled',
    });
    if (p.fullPage) {
      await page.screenshot({
        path: `tests/screenshots/${info.project.name}__${p.name}__full.png`,
        fullPage: true,
        animations: 'disabled',
      });
    }
    if (p.scrollStops > 0) {
      const vh = page.viewportSize()?.height ?? 800;
      for (let i = 1; i <= p.scrollStops; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), i * vh);
        await page.waitForTimeout(400);
        const idx = String(i + 1).padStart(2, '0');
        await page.screenshot({
          path: `tests/screenshots/${info.project.name}__${p.name}__${idx}-scroll.png`,
          fullPage: false,
          animations: 'disabled',
        });
      }
    }
  });
}
