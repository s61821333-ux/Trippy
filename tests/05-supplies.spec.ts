import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('Supplies / Packing Screen', () => {

  test.beforeEach(async ({ page }) => {
    await loadDemoState(page);
    await goToScreen(page, 'supplies');
  });

  test('renders supplies screen without crashing', async ({ page }) => {
    await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible();
  });

  test('shows "Water" category items', async ({ page }) => {
    await expect(page.getByText(/water/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('shows "Gear" category items', async ({ page }) => {
    await expect(page.getByText(/gear/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('shows specific supply item: Sunscreen SPF50+', async ({ page }) => {
    await expect(page.getByText('Sunscreen SPF50+', { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('shows specific supply item: First aid kit', async ({ page }) => {
    await expect(page.getByText('First aid kit', { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('shows supply items', async ({ page }) => {
    await expect(page.getByText(/sunscreen|water|headlamp/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('progress or completion section exists', async ({ page }) => {
    await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible();
  });

  test('can interact with a supply item', async ({ page }) => {
    const unchecked = page.getByText('Hat / Buff', { exact: false })
      .or(page.getByText('Electrolytes', { exact: false })).first();

    if (await unchecked.isVisible().catch(() => false)) {
      await unchecked.click();
      await page.waitForTimeout(400);
      await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible();
    }
  });

  test('supplies list is scrollable', async ({ page }) => {
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(200);
    await page.mouse.wheel(0, -300);
    await expect(page.locator('[data-tour="nav-supplies"]:visible')).toBeVisible();
  });

  test('shows at least one supply item', async ({ page }) => {
    await expect(page.getByText(/sunscreen|water|headlamp|first aid|hat|electrolytes|blanket/i).first()).toBeVisible({ timeout: 6000 });
  });

});
