import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for mobile-viewport visual regression.
 * `pnpm test:visual` boots the dev server, opens the site at three
 * mobile / tablet sizes, and writes full-page screenshots into
 * tests/screenshots/. Inspect the PNGs to QA mobile rendering.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'iphone-13', use: { ...devices['iPhone 13'] } },
    { name: 'pixel-5', use: { ...devices['Pixel 5'] } },
    { name: 'ipad-mini', use: { ...devices['iPad Mini'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
