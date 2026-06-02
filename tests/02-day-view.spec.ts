import { test, expect } from '@playwright/test';
import { setupPage, clickEl } from './helpers';

// ── Event cards ───────────────────────────────────────────────────────────────

test.describe('Day view — event cards', () => {
  test('event cards are rendered for day 1', async ({ page }) => {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    const cards = page.locator('.lg.a-rise');
    await expect(cards).toHaveCount(2, { timeout: 8_000 });
  });

  test('event card shows the event name', async ({ page }) => {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await expect(page.getByText('Morning Museum')).toBeVisible();
  });

  test('clicking a card expands quick actions (Edit, Reschedule)', async ({ page }) => {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    // Use .first() — multiple cards may each have an Edit/Reschedule label
    await expect(page.getByText('Edit').first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Reschedule').first()).toBeVisible({ timeout: 5_000 });
  });

  test('drag handles are present on each event card', async ({ page }) => {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await expect(
      page.locator('[aria-label="Drag to reorder"]').first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('no horizontal overflow on day screen', async ({ page }) => {
    await setupPage(page, 'day');
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});

// ── Reschedule sheet ──────────────────────────────────────────────────────────

test.describe('Day view — Reschedule sheet', () => {
  async function openReschedule(page: Parameters<typeof setupPage>[0]) {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    await expect(page.getByText('Reschedule').first()).toBeVisible({ timeout: 5_000 });
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent?.trim() === 'Reschedule') b.click();
      });
    });
  }

  test('Reschedule opens a time-only sheet (no Event name field)', async ({ page }) => {
    await openReschedule(page);
    await expect(page.getByText('Start time')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('End time')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Duration shortcut')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Event name')).not.toBeVisible();
  });

  test('Reschedule sheet has Update time and Cancel buttons', async ({ page }) => {
    await openReschedule(page);
    await expect(page.getByText('Update time')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Cancel').first()).toBeVisible({ timeout: 5_000 });
  });

  test('Cancel closes the reschedule sheet', async ({ page }) => {
    await openReschedule(page);
    await expect(page.getByText('Update time')).toBeVisible({ timeout: 5_000 });
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent?.trim() === 'Cancel') b.click();
      });
    });
    await expect(page.getByText('Update time')).not.toBeVisible({ timeout: 5_000 });
  });
});

// ── Edit (full) sheet ─────────────────────────────────────────────────────────

test.describe('Day view — Edit sheet', () => {
  test('Edit opens full sheet with Event name field', async ({ page }) => {
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    await expect(page.getByText('Edit').first()).toBeVisible({ timeout: 5_000 });
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent?.trim() === 'Edit') b.click();
      });
    });
    await expect(page.getByText('Event name')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Update time')).not.toBeVisible();
  });
});
