import { defineConfig } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 900 },
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  reporter: [['list']],
});
