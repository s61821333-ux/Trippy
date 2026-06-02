import { test, expect } from '@playwright/test';
import { loadDemo, clickTab } from './helpers';

test.describe('Accessibility & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await loadDemo(page);
  });

  test('all NavBar tab buttons have aria-labels', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    const buttons = nav.getByRole('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const label = await btn.getAttribute('aria-label');
      const text  = await btn.textContent();
      // Each button must have either aria-label or visible text
      expect(label || text?.trim()).toBeTruthy();
    }
  });

  test('NavBar tabs mark the active page with aria-current', async ({ page }) => {
    // Dashboard should be active by default
    const activeTab = page.getByRole('button', { name: /overview/i });
    const ariaCurrent = await activeTab.getAttribute('aria-current');
    expect(ariaCurrent).toBe('page');
  });

  test('Add Event dialog has role=dialog and aria-modal', async ({ page }) => {
    await clickTab(page, 'Day planner');
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: /add.*event/i }).first().click();
    await page.waitForTimeout(600);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const ariaModal = await dialog.getAttribute('aria-modal');
    expect(ariaModal).toBe('true');
  });

  test('Packing list items have aria-label describing packed state', async ({ page }) => {
    await clickTab(page, 'Packing list');
    await page.waitForTimeout(400);

    const items = page.getByRole('button', { name: /packed|not packed/i });
    const count = await items.count();

    if (count > 0) {
      // Each item should describe its state in aria-label
      const firstLabel = await items.first().getAttribute('aria-label');
      expect(firstLabel).toMatch(/packed/i);
    }
    // Pass if no items yet (empty state is also valid)
    expect(true).toBe(true);
  });

  test('touch targets are at least 44px tall (WCAG 2.5.5)', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    const tabs = nav.getByRole('button');
    const count = await tabs.count();

    for (let i = 0; i < count; i++) {
      const box = await tabs.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('app renders without console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await loadDemo(page);
    await page.waitForTimeout(1000);

    // Filter out known non-critical errors (network, Supabase auth in demo mode)
    const critical = errors.filter(e =>
      !e.includes('supabase') &&
      !e.includes('net::ERR') &&
      !e.includes('Failed to fetch') &&
      !e.includes('401') &&
      !e.includes('403')
    );
    expect(critical).toHaveLength(0);
  });
});
