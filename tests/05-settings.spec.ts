import { test, expect } from '@playwright/test';
import { setupPage, clickEl } from './helpers';

// ── Settings rendering ────────────────────────────────────────────────────────

test.describe('Settings screen — rendering', () => {
  test('trip name is visible on settings screen', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 10_000 });
  });

  test('NavBar is visible on settings screen', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).toBeVisible();
  });
});

// ── Theme controls ────────────────────────────────────────────────────────────

test.describe('Settings screen — theme', () => {
  test('Light and Dark theme buttons are visible', async ({ page }) => {
    await setupPage(page, 'settings');
    const group = page.locator('[role="group"][aria-label="Theme"]');
    await expect(group).toBeVisible({ timeout: 8_000 });
    await expect(group.getByText('Light').first()).toBeVisible();
    await expect(group.getByText('Dark').first()).toBeVisible();
  });

  test('clicking Dark theme sets aria-pressed=true on that button', async ({ page }) => {
    await setupPage(page, 'settings');
    const darkBtn = page.locator('[role="group"][aria-label="Theme"] [aria-pressed]')
      .filter({ hasText: 'Dark' });
    await darkBtn.first().waitFor({ state: 'visible', timeout: 8_000 });
    await darkBtn.first().click();
    await expect(darkBtn.first()).toHaveAttribute('aria-pressed', 'true', { timeout: 4_000 });
  });
});

// ── Language controls ─────────────────────────────────────────────────────────

test.describe('Settings screen — language', () => {
  test('language group is visible', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(
      page.locator('[role="group"][aria-label="Language"]')
    ).toBeVisible({ timeout: 8_000 });
  });

  test('language buttons have aria-pressed', async ({ page }) => {
    await setupPage(page, 'settings');
    const langBtns = page.locator('[role="group"][aria-label="Language"] [aria-pressed]');
    await langBtns.first().waitFor({ state: 'visible', timeout: 8_000 });
    expect(await langBtns.count()).toBeGreaterThan(0);
  });

  test('exactly one language button is active (aria-pressed=true)', async ({ page }) => {
    await setupPage(page, 'settings');
    const active = page.locator('[role="group"][aria-label="Language"] [aria-pressed="true"]');
    await expect(active).toHaveCount(1, { timeout: 8_000 });
  });
});

// ── Layout ────────────────────────────────────────────────────────────────────

test.describe('Settings screen — layout', () => {
  test('no horizontal overflow on settings screen', async ({ page }) => {
    await setupPage(page, 'settings');
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });

  test('only one navigation element on settings screen (no double NavBar)', async ({ page }) => {
    await setupPage(page, 'settings');
    const navs = page.locator('[role="navigation"]');
    await expect(navs).toHaveCount(1, { timeout: 8_000 });
  });
});
