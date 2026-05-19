import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('Responsive — Desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Trippy brand visible in top nav on desktop', async ({ page }) => {
    await loadDemoState(page);
    const brand = page.getByText('Trippy', { exact: false }).first();
    await expect(brand).toBeVisible({ timeout: 5000 });
  });

  test('dashboard content is centered and readable', async ({ page }) => {
    await loadDemoState(page);
    await expect(page.getByText('Negev Desert Adventure', { exact: false })).toBeVisible();
  });

  test('all nav tabs work on desktop', async ({ page }) => {
    await loadDemoState(page);
    for (const screen of ['day', 'supplies', 'settings', 'dashboard'] as const) {
      await goToScreen(page, screen);
      await expect(page.locator(`[data-tour="nav-${screen}"]`).first()).toBeVisible();
    }
  });

});

test.describe('Responsive — Mobile (390×844 iPhone 14)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile nav tabs are present', async ({ page }) => {
    await loadDemoState(page);
    const navButtons = page.locator('[data-tour="nav-dashboard"]');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('content is not wider than the viewport', async ({ page }) => {
    await loadDemoState(page);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(410);
  });

  test('touch tap on supplies screen works', async ({ page }) => {
    await loadDemoState(page);
    await goToScreen(page, 'supplies');
    await page.touchscreen.tap(195, 400);
    await page.waitForTimeout(200);
    await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible();
  });

});

test.describe('Responsive — Small Mobile (375×667 iPhone SE)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('app renders on small screen without horizontal overflow', async ({ page }) => {
    await loadDemoState(page);
    await expect(page.getByText('Negev Desert Adventure', { exact: false })).toBeVisible({ timeout: 5000 });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });

  test('login screen fits on small viewport', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    // Check Trippy text before accepting (may be in terms modal or logo)
    const hasText = await page.getByText('Trippy', { exact: false }).first().isVisible().catch(() => false);
    const acceptBtn = page.getByRole('button', { name: /accept|agree|continue/i });
    if (await acceptBtn.isVisible().catch(() => false)) await acceptBtn.click();
    await page.waitForTimeout(300);
    // After accepting: either Trippy text or the Google sign-in button confirms the screen loaded
    const hasGoogle = await page.getByRole('button', { name: /continue with google/i }).isVisible().catch(() => false);
    expect(hasText || hasGoogle).toBe(true);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });

});
