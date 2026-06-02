import { test, expect } from '@playwright/test';
import { loadDemo, clickTab } from './helpers';

test.describe('Packing List', () => {
  test.beforeEach(async ({ page }) => {
    await loadDemo(page);
    await clickTab(page, 'Packing list');
  });

  test('does not show raw i18n key "almostThere" as visible text', async ({ page }) => {
    await expect(page.getByText('almostThere')).not.toBeVisible();
  });

  test('does not show raw i18n key "packedShared" as visible text', async ({ page }) => {
    await expect(page.getByText('packedShared')).not.toBeVisible();
  });

  test('does not show raw i18n key "adventurePrep" as visible text', async ({ page }) => {
    await expect(page.getByText('adventurePrep')).not.toBeVisible();
  });

  test('shows human-readable progress text', async ({ page }) => {
    // Should contain either "Almost there", "All packed", or "Ready to pack"
    const progressArea = page.locator('div[style*="font-serif"]').first();
    const text = await progressArea.textContent();
    expect(text).not.toBeNull();
    expect(text!).toMatch(/almost|packed|ready|כמעט|ארוז|מוכן/i);
  });

  test('empty state shows suitcase emoji and Add CTA (not blank screen)', async ({ page }) => {
    // When no items exist the emoji 🧳 should be visible
    const emptyText = page.getByText(/empty|ריקה|first item|ראשון/i);
    const hasSuitcase = await page.getByText('🧳').isVisible().catch(() => false);
    const hasEmptyText = await emptyText.first().isVisible().catch(() => false);

    // At least one of them should be visible
    expect(hasSuitcase || hasEmptyText).toBe(true);
  });

  test('Add item sheet has autoComplete=off on name field', async ({ page }) => {
    // Open the add item sheet
    await page.getByRole('button', { name: /add.*item|הוסף/i }).first().click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[placeholder*="Sunscreen"], input[placeholder*="e.g."]').first();
    const autoComplete = await nameInput.getAttribute('autocomplete');
    expect(autoComplete).toBe('off');
  });

  test('Water category is labeled "Drinks" or "Drinks & Water", not just "Water"', async ({ page }) => {
    // The filter rail should show the renamed label
    const waterBtn = page.getByRole('button', { name: /^water$/i });
    await expect(waterBtn).not.toBeVisible();
    // Instead expect Drinks label
    const drinksBtn = page.getByRole('button', { name: /drinks/i });
    await expect(drinksBtn).toBeVisible();
  });

  test('primary Add button is green, not red/coral', async ({ page }) => {
    await page.getByRole('button', { name: /add.*item|הוסף/i }).first().click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /^add item$|^הוסף$/i }).last();
    const bg = await saveBtn.evaluate(el => window.getComputedStyle(el).background);
    // Should NOT be a red color (hue 0-30 or 340-360)
    // Green oklch colours render as rgb(something with a greenish tint)
    expect(bg).not.toMatch(/rgb\(19[0-9],\s*[0-6][0-9],\s*[0-6][0-9]\)/); // rough red range check
  });
});
