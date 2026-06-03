import { test, expect } from '@playwright/test';
import { setupPage, clickEl } from './helpers';

// ── ARIA roles & labels ───────────────────────────────────────────────────────

test.describe('Accessibility — ARIA', () => {
  test('nav has role=navigation and aria-label', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).toBeVisible();
  });

  test('all NavBar tab buttons have aria-label', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const nav = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const tabs = nav.locator('button[aria-label]');
    await tabs.first().waitFor({ state: 'visible' });
    // Overview, Day planner, Packing list, Crew + Menu + Add = ≥ 4 labelled buttons
    expect(await tabs.count()).toBeGreaterThanOrEqual(4);
  });

  test('active tab is marked with aria-current=page', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(page.locator('[aria-current="page"]').first()).toBeVisible();
  });

  test('menu button aria-expanded toggles open/close', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const btn = page.locator('button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 });
    // Wait for the open animation to settle before clicking again
    await page.waitForTimeout(600);
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 5_000 });
  });

  test('drag handles have aria-label on day screen', async ({ page }) => {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await expect(
      page.locator('[aria-label="Drag to reorder"]').first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

// ── Touch target sizes (WCAG 2.5.5) ──────────────────────────────────────────

test.describe('Accessibility — touch targets', () => {
  test('NavBar tab buttons are at least 44 px tall', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const nav   = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const tabs  = nav.locator('button');
    const count = await tabs.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await tabs.nth(i).boundingBox();
      if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

// ── No critical JS errors ─────────────────────────────────────────────────────

test.describe('Accessibility — runtime errors', () => {
  test('app loads without critical JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2_000);
    const critical = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('ResizeObserver') &&
      !e.includes('motion') &&
      !e.includes('hydration')
    );
    expect(critical).toHaveLength(0);
  });

  test('page title contains "trippy"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/trippy/i);
  });
});
