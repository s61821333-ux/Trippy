import { test, expect } from '@playwright/test';
import { loadDemo } from './helpers';

test.describe('Settings Screen', () => {
  async function openSettings(page: any) {
    await loadDemo(page);
    await page.getByRole('button', { name: /menu/i }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: /settings/i }).last().click();
    await page.waitForTimeout(400);
  }

  test('has only ONE navigation (no double NavBar)', async ({ page }) => {
    await openSettings(page);

    // The global bottom NavBar should NOT be present on settings
    const navCount = await page.getByRole('navigation', { name: /main navigation/i }).count();
    expect(navCount).toBe(0);
  });

  test('has a Dashboard back button', async ({ page }) => {
    await openSettings(page);

    await expect(page.getByRole('button', { name: /dashboard|לוח בקרה/i }).first()).toBeVisible();
  });

  test('back button navigates to dashboard', async ({ page }) => {
    await openSettings(page);

    await page.getByRole('button', { name: /dashboard|לוח בקרה/i }).first().click();
    await page.waitForTimeout(500);

    // NavBar should be back
    await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible();
  });

  test('Settings heading is visible and not blank', async ({ page }) => {
    await openSettings(page);

    await expect(page.getByText(/settings|הגדרות/i).first()).toBeVisible();
  });

  test('content scrolls without layout overflow', async ({ page }) => {
    await openSettings(page);

    const container = page.locator('.lg-scroll').first();
    const overflowY = await container.evaluate(el => window.getComputedStyle(el).overflowY);
    expect(overflowY).toBe('auto');
  });
});
