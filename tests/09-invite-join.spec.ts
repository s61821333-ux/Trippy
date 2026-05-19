import { test, expect } from '@playwright/test';

test.describe('/join/[token] — Invite Link Page', () => {

  test('renders join page for an invalid token gracefully', async ({ page }) => {
    await page.goto('/join/this-is-a-fake-token-12345');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should show some UI — either an error, a login prompt, or a join message
    // Must NOT show a raw Next.js error page
    const rawError = page.getByText(/application error|chunk load|unexpected token/i).first();
    const hasRawError = await rawError.isVisible().catch(() => false);
    expect(hasRawError).toBe(false);

    // Should show Trippy branding or a meaningful message
    const hasContent = await page.getByText(/trippy|join|invite|sign in|not found|invalid|expired/i).first().isVisible().catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('join page with empty token redirects or shows 404', async ({ page }) => {
    // Navigate to a URL that doesn't match the [token] pattern
    const res = await page.goto('/join/');
    // Either redirects or shows 404/login
    const status = res?.status() ?? 200;
    expect([200, 301, 302, 404]).toContain(status);
  });

  test('join page shows Sign In button or prompt when not authenticated', async ({ page }) => {
    await page.goto('/join/fake-token-for-testing-only');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Unauthenticated users should see a sign-in option
    const signIn = page.getByRole('button', { name: /sign in|google|login|continue/i }).first()
      .or(page.getByText(/sign in|log in|google/i).first());
    const hasSignIn = await signIn.isVisible().catch(() => false);

    // Or it shows an error for invalid token
    const hasError = await page.getByText(/invalid|expired|not found/i).first().isVisible().catch(() => false);

    expect(hasSignIn || hasError).toBe(true);
  });

  test('join page has proper page title', async ({ page }) => {
    await page.goto('/join/fake-token-xyz');
    await page.waitForLoadState('domcontentloaded');
    const title = await page.title();
    // Should be some non-empty title
    expect(title.length).toBeGreaterThan(0);
  });

  test('join page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/join/fake-token-xyz-99');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const real = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('supabase') &&
      !e.includes('ResizeObserver') &&
      !e.includes('net::ERR') &&
      !e.includes('404') &&
      !e.includes('Not Found') &&
      !e.includes('Failed to load resource')
    );
    expect(real).toHaveLength(0);
  });

});
