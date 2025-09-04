import { test, expect } from '@playwright/test';

test('save draft flow', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/quote/new');

  // Fill Step 1
  await page.getByLabel('Customer Name').fill('E2E Test Customer');
  const today = new Date().toISOString().slice(0,10);
  await page.getByLabel('Date').fill(today);

  // Quick Save Draft (creates quoteNo and writes meta)
  await page.click('text=Quick Save Draft');
  await page.waitForTimeout(800);

  // Move to Step 2 and Step 3
  await page.click('text=Next');
  await page.waitForTimeout(400);
  await page.click('text=Next');
  await page.waitForTimeout(400);

  // Click Save Draft (final step)
  await page.click('text=Save Draft');
  await page.waitForTimeout(1200);

  // Assert toast/alert - Save shows alert; capture navigation or check meta exists by requesting endpoint
  // Try to read returned quoteNo from meta endpoint by scanning DOM for quote number value
  const qInput = await page.locator('input[placeholder="(Optional) leave blank to auto-generate"]');
  const quoteNo = await qInput.inputValue();
  console.log('Detected quoteNo in UI:', quoteNo);

  // If a quoteNo is present, try to GET its meta via API to confirm server saved it
  if (quoteNo) {
    const res = await page.request.get(`http://localhost:4000/api/quotes/${encodeURIComponent(quoteNo)}/meta`);
    console.log('Meta HTTP status:', res.status());
    try {
      const body = await res.json();
      console.log('Meta read ok:', !!body.meta);
    } catch (e) {
      console.log('Meta read failed parse:', e.message);
    }
  }
});
