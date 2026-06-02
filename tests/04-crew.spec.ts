import { test, expect } from '@playwright/test';
import { setupPage, clickEl } from './helpers';

// ── Crew screen rendering ─────────────────────────────────────────────────────

test.describe('Crew screen — rendering', () => {
  test('crew screen is reachable via Crew tab', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Crew"]');
    await expect(page.locator('button[aria-label="Crew"]'))
      .toHaveAttribute('aria-current', 'page', { timeout: 6_000 });
  });

  test('crew member injected in BASE_TRIP appears in the list', async ({ page }) => {
    await setupPage(page, 'crew');
    await expect(page.getByText('Tester')).toBeVisible({ timeout: 10_000 });
  });

  test('crew list has role=list', async ({ page }) => {
    await setupPage(page, 'crew');
    await expect(page.locator('[role="list"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('trip name is visible on crew screen', async ({ page }) => {
    await setupPage(page, 'crew');
    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 10_000 });
  });
});

// ── Invite / copy link ────────────────────────────────────────────────────────

test.describe('Crew screen — invite controls', () => {
  test('Copy join link button is visible', async ({ page }) => {
    await setupPage(page, 'crew');
    const btn = page.locator('[aria-label="Copy join link"], [aria-label="העתק קישור הצטרפות"]');
    await expect(btn.first()).toBeVisible({ timeout: 10_000 });
  });

  test('Copy join link button is enabled', async ({ page }) => {
    await setupPage(page, 'crew');
    const btn = page.locator('[aria-label="Copy join link"], [aria-label="העתק קישור הצטרפות"]');
    await expect(btn.first()).toBeEnabled({ timeout: 10_000 });
  });
});

// ── Layout ────────────────────────────────────────────────────────────────────

test.describe('Crew screen — layout', () => {
  test('no horizontal overflow on crew screen', async ({ page }) => {
    await setupPage(page, 'crew');
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });

  test('NavBar stays visible on crew screen', async ({ page }) => {
    await setupPage(page, 'crew');
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).toBeVisible();
  });
});
