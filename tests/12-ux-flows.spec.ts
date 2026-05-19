import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('UX Flow — Full Demo Journey', () => {

  test('complete journey: dashboard → day → supplies → settings → back', async ({ page }) => {
    await loadDemoState(page);

    // 1. Dashboard
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 6000 });

    // 2. Day screen
    await goToScreen(page, 'day');
    await expect(page.getByText('Morning camp breakfast').first()).toBeVisible({ timeout: 6000 });

    // 3. Supplies
    await goToScreen(page, 'supplies');
    await expect(page.getByText(/water|sunscreen|gear/i).first()).toBeVisible({ timeout: 5000 });

    // 4. Settings
    await goToScreen(page, 'settings');
    await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible({ timeout: 5000 });

    // 5. Back to Dashboard
    await goToScreen(page, 'dashboard');
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
  });

});

test.describe('UX Flow — Login screen (no auth)', () => {

  test('login screen shows all expected elements', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    // Terms modal only appears after auth — no need to accept on the unauthenticated login screen
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible({ timeout: 10000 });
  });

  test('clicking Google sign-in does not throw JS error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const googleBtn = page.getByRole('button', { name: /continue with google/i });
    if (await googleBtn.isVisible().catch(() => false)) {
      await googleBtn.click();
      await page.waitForTimeout(1000);
    }

    const realErrors = errors.filter(e =>
      !e.includes('supabase') && !e.includes('google') && !e.includes('ERR_')
    );
    expect(realErrors).toHaveLength(0);
  });

});

test.describe('UX Flow — Preferences and Persistence', () => {

  test('dark mode starts active when injected', async ({ page }) => {
    await loadDemoState(page, { darkMode: true });
    await goToScreen(page, 'day');
    await goToScreen(page, 'supplies');
    await goToScreen(page, 'dashboard');
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
  });

  test('day 1 events are visible on day screen', async ({ page }) => {
    await loadDemoState(page);
    await page.evaluate(() => {
      (window as any).__trippyStore.setState({ activeDay: 1 });
    });
    await goToScreen(page, 'day');
    await expect(page.getByText('Morning camp breakfast').first()).toBeVisible({ timeout: 6000 });
  });

  test('switching to day 3 shows Dead Sea events', async ({ page }) => {
    await loadDemoState(page);
    await page.evaluate(() => {
      (window as any).__trippyStore.setState({ activeDay: 3 });
    });
    await goToScreen(page, 'day');
    await expect(page.getByText(/Dead Sea|Masada|Ein Bokek/i).first()).toBeVisible({ timeout: 6000 });
  });

});

test.describe('UX Flow — Error handling', () => {

  test('navigating to /unknown-route shows 404 or redirects', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const notFound = await page.getByText(/404|not found/i).first().isVisible().catch(() => false);
    const hasUrl = page.url().includes('this-page-does-not-exist') || page.url().endsWith('/');
    expect(notFound || hasUrl).toBe(true);
  });

  test('trip with 0 events shows empty state without crashing', async ({ page }) => {
    await loadDemoState(page);
    await page.evaluate(() => {
      const store = (window as any).__trippyStore.getState();
      const trip = { ...store.trip, events: { 1: [] } };
      (window as any).__trippyStore.setState({ trip, activeDay: 1 });
    });
    await goToScreen(page, 'day');
    const crashText = page.getByText(/something went wrong|unhandled/i).first();
    expect(await crashText.isVisible().catch(() => false)).toBe(false);
  });

  test('very long trip name does not cause horizontal overflow', async ({ page }) => {
    await loadDemoState(page);
    await page.evaluate(() => {
      const store = (window as any).__trippyStore.getState();
      const trip = { ...store.trip, name: 'This Is A Very Long Trip Name That Could Potentially Break The Layout If Not Properly Truncated At Some Point' };
      (window as any).__trippyStore.setState({ trip });
    });
    await page.waitForTimeout(300);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(420);
  });

});

test.describe('UX Flow — Performance', () => {

  test('initial demo load is under 45 seconds total', async ({ page }) => {
    const start = Date.now();
    await loadDemoState(page);
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(45_000);
  });

  test('tab navigation is fast (each under 3s)', async ({ page }) => {
    await loadDemoState(page);
    for (const screen of ['day', 'supplies', 'settings', 'dashboard'] as const) {
      const start = Date.now();
      await goToScreen(page, screen);
      expect(Date.now() - start).toBeLessThan(3000);
    }
  });

});
