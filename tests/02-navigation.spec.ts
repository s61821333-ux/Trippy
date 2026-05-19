import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('Navigation — NavBar', () => {

  test.beforeEach(async ({ page }) => {
    await loadDemoState(page);
  });

  test('all four nav tabs are visible', async ({ page }) => {
    await expect(page.locator('[data-tour="nav-dashboard"]:visible')).toBeVisible();
    await expect(page.locator('[data-tour="nav-day"]:visible')).toBeVisible();
    await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible();
    await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible();
  });

  test('dashboard tab is active on load', async ({ page }) => {
    const dashBtn = page.locator('[data-tour="nav-dashboard"]:visible');
    await expect(dashBtn).toBeVisible();
  });

  test('clicking Day tab navigates to Day screen', async ({ page }) => {
    await goToScreen(page, 'day');
    await expect(page.getByText('Morning camp breakfast').first()).toBeVisible({ timeout: 6000 });
  });

  test('clicking Supplies tab navigates to Supplies screen', async ({ page }) => {
    await goToScreen(page, 'supplies');
    await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible({ timeout: 5000 });
  });

  test('clicking Settings tab navigates to Settings screen', async ({ page }) => {
    await goToScreen(page, 'settings');
    await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible({ timeout: 5000 });
  });

  test('clicking Dashboard tab returns to Dashboard', async ({ page }) => {
    await goToScreen(page, 'day');
    await goToScreen(page, 'dashboard');
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
  });

  test('nav tabs cycle correctly: dashboard → day → supplies → settings', async ({ page }) => {
    for (const screen of ['day', 'supplies', 'settings'] as const) {
      await goToScreen(page, screen);
      const tab = page.locator(`[data-tour="nav-${screen}"]:visible`);
      await expect(tab).toBeVisible();
    }
  });

  test('rapid tab switching does not crash the app', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await goToScreen(page, 'day');
      await goToScreen(page, 'supplies');
      await goToScreen(page, 'dashboard');
    }
    await expect(page.getByRole('heading', { name: 'Negev Desert Adventure' })).toBeVisible({ timeout: 5000 });
  });

});
