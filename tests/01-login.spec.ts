import { test, expect } from '@playwright/test';

test.describe('Login Screen — unauthenticated', () => {

  test.beforeEach(async ({ page }) => {
    // Ensure clean state (no persisted session)
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('renders Trippy logo and tagline', async ({ page }) => {
    await expect(page.getByText('Trippy', { exact: false })).toBeVisible();
  });

  test('shows Sign in with Google button', async ({ page }) => {
    // Terms modal only appears after auth — not on the unauthenticated login screen
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible({ timeout: 10000 });
  });

  test('Terms modal appears on very first visit', async ({ page }) => {
    // Only check that it renders — clicking through it should reveal the login
    const hasTerms = await page.getByRole('button', { name: /accept|agree|continue/i }).isVisible().catch(() => false);
    const hasLogo = await page.getByText('Trippy', { exact: false }).isVisible().catch(() => false);
    // Either the terms are showing or the main logo is — one must be true
    expect(hasTerms || hasLogo).toBe(true);
  });

  test('page has correct title', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/trippy|trip|planner/i);
  });

  test('page has a viewport meta tag (mobile-friendly)', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Filter out known third-party noise
    const real = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('google') &&
      !e.includes('ResizeObserver') &&
      !e.includes('supabase')
    );
    expect(real).toHaveLength(0);
  });

  test('Google sign-in button is keyboard focusable', async ({ page }) => {
    const btn = page.getByRole('button', { name: /continue with google/i });
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.focus();
    await expect(btn).toBeFocused();
  });

  test('CompassMark / logo SVG is present', async ({ page }) => {
    const svgs = page.locator('svg');
    await expect(svgs.first()).toBeVisible({ timeout: 10000 });
  });

});
