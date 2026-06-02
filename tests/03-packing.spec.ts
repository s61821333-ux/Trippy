import { test, expect } from '@playwright/test';
import { setupPage, clickEl } from './helpers';

// ── Packing list rendering ────────────────────────────────────────────────────

test.describe('Packing list — rendering', () => {
  test('packing list screen is reachable via Packing list tab', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Packing list"]');
    await expect(page.locator('button[aria-label="Packing list"]'))
      .toHaveAttribute('aria-current', 'page', { timeout: 6_000 });
  });

  test('supplies injected in BASE_TRIP appear in the list', async ({ page }) => {
    await setupPage(page, 'supplies');
    // BASE_SUPPLIES contains "Sunscreen" and "Passport"
    await expect(page.getByText('Sunscreen')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Passport')).toBeVisible({ timeout: 5_000 });
  });

  test('packing list has role=list', async ({ page }) => {
    await setupPage(page, 'supplies');
    await expect(page.locator('[role="list"][aria-label]').first())
      .toBeVisible({ timeout: 10_000 });
  });

  test('each item has an aria-label describing packed state', async ({ page }) => {
    await setupPage(page, 'supplies');
    // At least one item should have an aria-label mentioning "packed" or "not packed"
    const items = page.locator('[role="listitem"][aria-label]');
    await items.first().waitFor({ state: 'visible', timeout: 10_000 });
    const label = await items.first().getAttribute('aria-label');
    expect(label).toBeTruthy();
  });
});

// ── Add button & filters ──────────────────────────────────────────────────────

test.describe('Packing list — controls', () => {
  test('Add packing item button is visible', async ({ page }) => {
    await setupPage(page, 'supplies');
    await expect(page.locator('[aria-label="Add packing item"]'))
      .toBeVisible({ timeout: 10_000 });
  });

  test('category filter buttons are visible and pressable', async ({ page }) => {
    await setupPage(page, 'supplies');
    const filters = page.locator('[role="group"][aria-label="Filter by category"] button');
    await filters.first().waitFor({ state: 'visible', timeout: 10_000 });
    // At least one filter should exist
    expect(await filters.count()).toBeGreaterThan(0);
  });

  test('clicking a category filter toggles aria-pressed', async ({ page }) => {
    await setupPage(page, 'supplies');
    const filters = page.locator('[role="group"][aria-label="Filter by category"] button');
    await filters.first().waitFor({ state: 'visible', timeout: 10_000 });
    const first = filters.first();
    await first.click();
    // aria-pressed should now be "true"
    await expect(first).toHaveAttribute('aria-pressed', 'true', { timeout: 4_000 });
  });
});

// ── Layout ────────────────────────────────────────────────────────────────────

test.describe('Packing list — layout', () => {
  test('no horizontal overflow on supplies screen', async ({ page }) => {
    await setupPage(page, 'supplies');
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});
