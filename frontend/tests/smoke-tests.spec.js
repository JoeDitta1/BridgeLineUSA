import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Smoke tests — Quotes flows', () => {
  test('Quote Log loads', async ({ page }) => {
    await page.goto('/quotes/log');
    await expect(page.locator('h1')).toHaveText(/Quote Log/i);
  });

  test('New Quote form renders Materials dropdown options', async ({ page }) => {
    await page.goto('/quote/new');

    const nextBtn = page.getByRole('button', { name: /next/i }).first();
    if (await nextBtn.count()) {
      try { await nextBtn.click(); } catch {}
    }

    const addItemBtn = page.getByRole('button', { name: /\+ Add Item/i }).first();
    if (await addItemBtn.count()) await expect(addItemBtn).toBeVisible();

    const combo = page.getByRole('combobox').first();
    await expect(combo).toBeVisible();
    await combo.click();
    const option = page.locator('div[role="option"]').first();
    await expect(option).toBeVisible();
  });

  test('Create Draft Quote (quick save) produces a Quote Number', async ({ page }) => {
    await page.goto('/quote/new');

    const customer = page.getByLabel('Customer Name');
    if (await customer.count()) await customer.fill('E2E Corp');

    const date = page.getByLabel('Date');
    if (await date.count()) await date.fill(new Date().toISOString().slice(0, 10));

    const saveBtn = page.getByRole('button', { name: /save draft|quick save|quick save draft|quick save/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    const qnum = page.getByLabel('Quote Number');
    if (await qnum.count()) {
      await expect(qnum).toHaveValue(/.+/);
      const val = await qnum.inputValue();
      expect(val.length).toBeGreaterThan(0);
    } else {
      await expect(page).toHaveText(/SCM[-_\s]*Q?\d{1,}/i);
    }
  });

  test('File upload to Drawings/Files succeeds', async ({ page }) => {
    await page.goto('/quote/new');

    const qnumInput = page.getByLabel('Quote Number');
    if (await qnumInput.count()) {
      const current = await qnumInput.inputValue();
      if (!current) {
        const customer = page.getByLabel('Customer Name');
        if (await customer.count()) await customer.fill('E2E Corp');
        const saveBtn = page.getByRole('button', { name: /save draft|quick save/i }).first();
        await saveBtn.click();
        await expect(qnumInput).toHaveValue(/.+/);
      }
    }

    const quoteNo = (await qnumInput.inputValue().catch(() => '')) || 'SCM-Q0001';
    await page.goto(`/quotes/${encodeURIComponent(quoteNo)}/files`);

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeVisible();

    const fixture = path.resolve(process.cwd(), 'dummy.txt');

    const uploadResp = page.waitForResponse(resp =>
      (resp.url().includes('/api/quote-files') || resp.url().includes('/api/quotes')) && resp.status() === 200,
      { timeout: 15_000 }
    );

    await fileInput.setInputFiles(fixture);
    await uploadResp;

    await expect(page.locator('a', { hasText: 'dummy' }).first()).toBeVisible();
  });
});
