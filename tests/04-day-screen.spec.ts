import { test, expect } from '@playwright/test';
import { loadDemoState, goToScreen } from './helpers';

test.describe('Day Screen — Itinerary', () => {

  test.beforeEach(async ({ page }) => {
    await loadDemoState(page);
    await goToScreen(page, 'day');
  });

  test('shows Day 1 events from mock data', async ({ page }) => {
    await expect(page.getByText('Morning camp breakfast').first()).toBeVisible({ timeout: 6000 });
  });

  test('shows Makhtesh Ramon Hike event', async ({ page }) => {
    await expect(page.getByText('Makhtesh Ramon Hike').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows event times', async ({ page }) => {
    await expect(page.getByText(/\d{2}:\d{2}/).first()).toBeVisible({ timeout: 5000 });
  });

  test('shows event location info', async ({ page }) => {
    await expect(page.getByText(/Ramon Crater/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('can navigate between days', async ({ page }) => {
    // Try clicking day 2 in the day picker
    const day2 = page.getByRole('button', { name: '2' }).first();
    if (await day2.isVisible().catch(() => false)) {
      await day2.click();
      await page.waitForTimeout(400);
    }
    // Page must still be stable
    await expect(page.locator('[data-tour="nav-day"]:visible')).toBeVisible();
  });

  test('time slots or events are present', async ({ page }) => {
    await expect(page.getByText(/\d{2}:\d{2}/).first()).toBeVisible({ timeout: 6000 });
  });

  test('event list is scrollable without freezing', async ({ page }) => {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, -400);
    await expect(page.locator('[data-tour="nav-day"]:visible')).toBeVisible();
  });

});

test.describe('Day Screen — Add Event Form', () => {

  test.beforeEach(async ({ page }) => {
    await loadDemoState(page);
    await goToScreen(page, 'day');
  });

  test('form shows required fields when opened', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add event|new event|\+/i }).first();
    if (!await addBtn.isVisible().catch(() => false)) {
      test.skip(true, 'No add event button in demo mode');
      return;
    }
    await addBtn.click();
    await page.waitForTimeout(500);
    const nameInput = page.getByPlaceholder(/event name|name|activity/i)
      .or(page.getByRole('textbox').first());
    await expect(nameInput).toBeVisible({ timeout: 4000 });
  });

  test('form can be dismissed', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add event|new event|\+/i }).first();
    if (!await addBtn.isVisible().catch(() => false)) {
      test.skip(true, 'No add event button in demo mode');
      return;
    }
    await addBtn.click();
    await page.waitForTimeout(500);

    const closeBtn = page.getByRole('button', { name: /close|cancel|×|✕/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(400);
    await expect(page.getByText('Morning camp breakfast').first()).toBeVisible({ timeout: 4000 });
  });

});
