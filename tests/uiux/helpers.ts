import { Page, expect } from '@playwright/test';

/**
 * Navigate to the app and click "Explore the demo" to enter demo mode.
 * Returns once the dashboard / NavBar is visible.
 */
export async function loadDemo(page: Page) {
  await page.goto('/');

  // Wait for the app to hydrate — either login screen or the demo button
  await page.waitForLoadState('networkidle');

  // The demo button may be on the login/welcome screen
  const demoBtn = page.getByText(/explore the demo/i).or(page.getByText(/נסה את ההדגמה/i));

  // If the splash/welcome screen is shown first, wait for it to pass
  await page.waitForTimeout(1200);

  // Click demo button
  await demoBtn.first().click();

  // Wait for the NavBar to appear (signals we're inside the app with a trip loaded)
  await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible({ timeout: 10_000 });
}

/** Click a NavBar tab by its accessible label */
export async function clickTab(page: Page, label: string) {
  await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click();
  await page.waitForTimeout(400); // allow screen transition
}
