import { test, expect } from '@playwright/test';
import { loadDemo, clickTab } from './helpers';

test.describe('NavBar', () => {
  test.beforeEach(async ({ page }) => {
    await loadDemo(page);
  });

  test('is visible on all main screens', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });

    for (const tab of ['Day planner', 'Packing list', 'Crew']) {
      await clickTab(page, tab);
      await expect(nav).toBeVisible();
    }
  });

  test('has visible text labels on tabs', async ({ page }) => {
    // Each tab button should contain its label text
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    for (const label of ['Dashboard', 'Explore', 'Pack', 'Crew']) {
      // label text rendered inside nav (case-insensitive partial match)
      await expect(nav.getByText(new RegExp(label, 'i')).first()).toBeVisible();
    }
  });

  test('expand panel closes automatically when switching tabs', async ({ page }) => {
    // Open the expand panel via the menu handle (☰)
    await page.getByRole('button', { name: /menu/i }).click();
    await page.waitForTimeout(300);

    // Confirm expand panel is visible (contains "Settings" action)
    await expect(page.getByRole('button', { name: /settings/i }).last()).toBeVisible();

    // Switch to Packing tab
    await clickTab(page, 'Packing list');

    // Expand panel should be gone
    await expect(page.getByRole('button', { name: /switch trip/i })).not.toBeVisible();
  });

  test('is hidden on Settings screen', async ({ page }) => {
    // Open settings via expand menu
    await page.getByRole('button', { name: /menu/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /settings/i }).last().click();
    await page.waitForTimeout(400);

    // The main nav should NOT be visible on settings
    await expect(page.getByRole('navigation', { name: /main navigation/i })).not.toBeVisible();
  });

  test('Settings screen has a back button', async ({ page }) => {
    await page.getByRole('button', { name: /menu/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /settings/i }).last().click();
    await page.waitForTimeout(400);

    // Back button should be present
    await expect(page.getByRole('button', { name: /dashboard/i }).first()).toBeVisible();
  });
});
