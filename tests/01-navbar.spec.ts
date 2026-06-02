import { test, expect } from '@playwright/test';
import { setupPage, clickEl } from './helpers';

// ── NavBar visibility ─────────────────────────────────────────────────────────

test.describe('NavBar — visibility', () => {
  for (const screen of ['dashboard', 'day', 'settings', 'notes', 'crew', 'supplies']) {
    test(`visible on "${screen}" screen`, async ({ page }) => {
      await setupPage(page, screen);
      await expect(
        page.locator('[role="navigation"][aria-label="Main navigation"]')
      ).toBeVisible();
    });
  }
});

// ── Tab switching ─────────────────────────────────────────────────────────────

test.describe('NavBar — tab switching', () => {
  test('Overview tab active on dashboard', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(page.locator('button[aria-label="Overview"]')).toHaveAttribute('aria-current', 'page');
  });

  test('Day planner tab switches screen and becomes active', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Day planner"]');
    await expect(page.locator('button[aria-label="Day planner"]'))
      .toHaveAttribute('aria-current', 'page', { timeout: 6_000 });
  });

  test('Crew tab switches screen and becomes active', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Crew"]');
    await expect(page.locator('button[aria-label="Crew"]'))
      .toHaveAttribute('aria-current', 'page', { timeout: 6_000 });
  });

  test('Packing list tab switches screen and becomes active', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Packing list"]');
    await expect(page.locator('button[aria-label="Packing list"]'))
      .toHaveAttribute('aria-current', 'page', { timeout: 6_000 });
  });
});

// ── Menu expand panel ─────────────────────────────────────────────────────────

test.describe('NavBar — expand panel', () => {
  test('menu button starts with aria-expanded=false', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(page.locator('button[aria-label="Menu"]')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking Menu opens the panel (aria-expanded becomes true)', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(page.locator('button[aria-label="Menu"]'))
      .toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 });
  });

  test('panel shows Settings option when open', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(page.getByText('Settings').first()).toBeVisible({ timeout: 5_000 });
  });

  test('panel closes when switching to another tab', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(page.getByText('Notes').first()).toBeVisible({ timeout: 5_000 });
    await clickEl(page, 'button[aria-label="Crew"]');
    await expect(page.getByText('Notes')).not.toBeVisible({ timeout: 5_000 });
  });

  test('clicking Menu twice closes the panel', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(page.locator('button[aria-label="Menu"]'))
      .toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 });
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(page.locator('button[aria-label="Menu"]'))
      .toHaveAttribute('aria-expanded', 'false', { timeout: 5_000 });
  });
});

// ── Layout constraints ────────────────────────────────────────────────────────

test.describe('NavBar — layout', () => {
  test('NavBar fits within viewport width', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const nav = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const box = await nav.boundingBox();
    const vpW = page.viewportSize()?.width ?? 390;
    if (box) expect(box.x + box.width).toBeLessThanOrEqual(vpW + 2);
  });

  test('NavBar is anchored near the bottom of the viewport', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const nav = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const box = await nav.boundingBox();
    const vpH = page.viewportSize()?.height ?? 844;
    if (box) expect(box.y + box.height).toBeGreaterThan(vpH * 0.75);
  });

  test('no horizontal overflow on dashboard', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});
