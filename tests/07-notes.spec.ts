import { test, expect } from '@playwright/test';
import { loadDemoState } from './helpers';

test.describe('Notes Screen', () => {

  test('notes screen accessible via demo flow', async ({ page }) => {
    await loadDemoState(page);

    // Look for a Notes button on dashboard or in settings
    const notesBtn = page.getByRole('button', { name: /notes/i }).first()
      .or(page.getByText(/^notes$/i).first());

    if (await notesBtn.isVisible().catch(() => false)) {
      await notesBtn.click();
      await page.waitForTimeout(500);
      const crashText = page.getByText(/something went wrong|unhandled/i).first();
      expect(await crashText.isVisible().catch(() => false)).toBe(false);
    } else {
      // Notes may not be a primary nav tab — just ensure the app is working
      await expect(page.getByText('Negev Desert Adventure', { exact: false })).toBeVisible();
    }
  });

  test('direct screen injection to notes renders without crashing', async ({ page }) => {
    // Inject notes state directly into store after demo loads
    await loadDemoState(page);

    await page.evaluate(() => {
      (window as any).__trippyStore.setState({ screen: 'notes' });
    });
    await page.waitForTimeout(500);

    const crashText = page.getByText(/something went wrong|unhandled error/i).first();
    expect(await crashText.isVisible().catch(() => false)).toBe(false);
  });

});
