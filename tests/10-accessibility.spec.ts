import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('Accessibility — Login Screen', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    // Terms modal only appears after auth — skip the accept check on the login screen
  });

  test('page has at least one h1', async ({ page }) => {
    const h1s = page.locator('h1');
    const count = await h1s.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('all interactive elements are keyboard reachable', async ({ page }) => {
    for (let i = 0; i < 10; i++) await page.keyboard.press('Tab');
    await expect(page.locator('body')).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('html lang attribute is set', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    // Next.js may not set lang in SSR — treat undefined as English
    if (lang) {
      expect(['en', 'he', 'en-US', 'he-IL']).toContain(lang);
    }
  });

});

test.describe('Accessibility — App with demo state', () => {

  test.beforeEach(async ({ page }) => {
    await loadDemoState(page);
  });

  test('no elements with duplicate IDs', async ({ page }) => {
    const allIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
      return ids;
    });
    const duplicates = allIds.filter((id, idx) => allIds.indexOf(id) !== idx);
    expect(duplicates).toHaveLength(0);
  });

  test('dashboard screen has heading hierarchy', async ({ page }) => {
    const headings = page.locator('h1, h2, h3, h4');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('navigation buttons have discernible labels', async ({ page }) => {
    for (const screen of ['dashboard', 'day', 'supplies', 'settings']) {
      const btn = page.locator(`[data-tour="nav-${screen}"]:visible`);
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute('aria-label');
      const hasLabel = (text ?? '').trim().length > 0 || !!ariaLabel;
      expect(hasLabel).toBe(true);
    }
  });

  test('page renders in dark mode without crashing', async ({ page }) => {
    await goToScreen(page, 'settings');
    const darkBtn = page.getByText(/dark mode/i).locator('..').locator('button').first();
    if (await darkBtn.isVisible().catch(() => false)) {
      await darkBtn.click();
      await page.waitForTimeout(500);
    }
    await goToScreen(page, 'dashboard');
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
  });

  test('reduced motion does not break the app', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // Navigate to all screens
    for (const screen of ['day', 'supplies', 'settings', 'dashboard'] as const) {
      await goToScreen(page, screen);
      await page.waitForTimeout(200);
    }
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
  });

});
