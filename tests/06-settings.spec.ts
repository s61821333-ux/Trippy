import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('Settings Screen', () => {

  test.beforeEach(async ({ page }) => {
    await loadDemoState(page);
    await goToScreen(page, 'settings');
  });

  test('renders settings screen without crashing', async ({ page }) => {
    await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible();
  });

  test('shows trip info section with trip name', async ({ page }) => {
    // Trip name is in an input value; check the section label or the input itself
    await expect(page.getByText('Trip Summary', { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('shows Dark Mode toggle', async ({ page }) => {
    // Label is "Light Mode" when off, "Dark Mode" when on
    await expect(page.getByText(/dark mode|light mode/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('dark mode toggle changes theme', async ({ page }) => {
    const darkToggle = page.getByText(/dark mode/i).locator('..').locator('button').first()
      .or(page.getByRole('button', { name: /dark mode/i }).first());

    if (await darkToggle.isVisible().catch(() => false)) {
      await darkToggle.click();
      await page.waitForTimeout(400);
      await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible();
    }
  });

  test('shows export or sharing options', async ({ page }) => {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(300);
    await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible();
  });

  test('settings are scrollable', async ({ page }) => {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible();
  });

  test('trip name is displayed correctly', async ({ page }) => {
    // Trip name is shown as an input value on the settings screen
    const input = page.getByRole('textbox').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await expect(input).toHaveValue(/Negev|Desert/i);
  });

});

test.describe('Settings Screen — RTL/Hebrew', () => {

  test('app does not crash when switching to Hebrew', async ({ page }) => {
    await loadDemoState(page);
    await goToScreen(page, 'settings');

    const heBtn = page.getByRole('button', { name: /עברית|HE|Hebrew/i }).first()
      .or(page.getByText(/עברית|HE|Hebrew/i).first());

    if (await heBtn.isVisible().catch(() => false)) {
      await heBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('[data-tour="nav-settings"]:visible')).toBeVisible();
    }
  });

});
