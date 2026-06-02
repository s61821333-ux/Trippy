/**
 * Auth flow & demo-user tests.
 *
 * The app uses Google OAuth exclusively — no email/password sign-in.
 * A real OAuth round-trip cannot run in CI without a live browser session.
 *
 * Instead, we verify:
 *  1. Unauthenticated flow  — splash → welcome screen renders correctly.
 *  2. Demo-user injection   — __trippySetState__ is the test-time stand-in for
 *                             a real authenticated session. We assert it gives
 *                             the same UX (NavBar, trip data, protected screens)
 *                             as a signed-in user would see.
 *  3. Sign-out guard        — without a trip/auth, protected screens are not shown.
 */
import { test, expect } from '@playwright/test';
import { setupPage, BASE_TRIP, TEST_AUTH } from './helpers';

// ── Unauthenticated flow ──────────────────────────────────────────────────────

test.describe('Auth — unauthenticated flow', () => {
  test('splash screen renders Trippy branding', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    expect(body?.toLowerCase()).toContain('trippy');
  });

  test('page title includes "trippy"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/trippy/i, { timeout: 10_000 });
  });

  test('after splash timer, welcome screen appears', async ({ page }) => {
    // Do NOT set __trippyTestMode__ — let the real 1.9 s timer fire
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait well past the 1.9 s auto-advance
    await page.waitForTimeout(3_500);
    // Look for a visible element that belongs to the welcome/auth screen
    await expect(
      page.getByText(/adventure|sign in|google|continue/i).first()
        .or(page.locator('button').filter({ hasText: /adventure|sign|google/i }).first())
    ).toBeVisible({ timeout: 5_000 });
  });

  test('NavBar is NOT shown on the welcome screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3_500);
    // Nav should not be present without an authenticated trip
    const nav = page.locator('[role="navigation"][aria-label="Main navigation"]');
    await expect(nav).not.toBeVisible({ timeout: 3_000 });
  });
});

// ── Demo-user (state injection) session ──────────────────────────────────────

test.describe('Auth — demo-user via __trippySetState__', () => {
  test('state hook is exposed after app mounts', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__trippyTestMode__ = true;
    });
    await page.route('**supabase.co/realtime/**', route => route.abort());
    await page.goto('/');
    await page.waitForFunction(
      () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
      { timeout: 30_000, polling: 200 }
    );
    const exposed = await page.evaluate(
      () => typeof (window as unknown as Record<string, unknown>).__trippySetState__
    );
    expect(exposed).toBe('function');
  });

  test('injecting demo auth shows the NavBar (equivalent to signed-in UX)', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).toBeVisible();
  });

  test('injected trip name is visible across screens', async ({ page }) => {
    await setupPage(page, 'dashboard');
    // Trip name should appear somewhere on the dashboard
    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 10_000 });
  });

  test('injected participant name is reflected in the crew list', async ({ page }) => {
    await setupPage(page, 'crew');
    // BASE_TRIP has participant with name: 'Tester' (uses Participant.name field)
    await expect(page.getByText('Tester')).toBeVisible({ timeout: 10_000 });
  });

  test('all four tab screens are reachable with demo session', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const tabs = [
      { label: 'Day planner',  screen: 'day' },
      { label: 'Packing list', screen: 'supplies' },
      { label: 'Crew',         screen: 'crew' },
      { label: 'Overview',     screen: 'dashboard' },
    ];
    for (const tab of tabs) {
      await page.evaluate((sel) => {
        (document.querySelector(sel) as HTMLElement)?.click();
      }, `button[aria-label="${tab.label}"]`);
      await expect(page.locator(`button[aria-label="${tab.label}"]`))
        .toHaveAttribute('aria-current', 'page', { timeout: 6_000 });
    }
  });

  test('demo session survives tab switching without re-authentication', async ({ page }) => {
    await setupPage(page, 'dashboard');
    // Switch tabs several times — state injection should remain stable
    for (const label of ['Crew', 'Day planner', 'Overview']) {
      await page.evaluate((sel) => {
        (document.querySelector(sel) as HTMLElement)?.click();
      }, `button[aria-label="${label}"]`);
      await page.waitForTimeout(400);
    }
    // NavBar must still be visible — no auth kick-out happened
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).toBeVisible();
  });
});

test.describe('Persistence — reload regression', () => {
  test('mutated trip state survives a page reload', async ({ page }) => {
    await setupPage(page, 'day');

    const persistedEvent = {
      id: 'evt-persisted-reload',
      time: '18:45',
      duration: 45,
      name: 'Persisted Stop',
      category: 'food',
      addedBy: 'Tester',
    };

    await page.evaluate((event) => {
      const raw = localStorage.getItem('trippy-storage');
      if (!raw) throw new Error('missing persisted store');
      const snapshot = JSON.parse(raw);
      const trip = snapshot?.state?.trip;
      if (!trip) throw new Error('missing trip state');

      const updatedTrip = {
        ...trip,
        events: {
          ...trip.events,
          2: [...(trip.events?.[2] ?? []), event],
        },
      };
      const updatedSupplies = [...(snapshot.state.supplies ?? [])];
      if (updatedSupplies[0]) {
        updatedSupplies[0] = { ...updatedSupplies[0], checked: !updatedSupplies[0].checked };
      }

      (window as unknown as Record<string, (patch: unknown) => void>).__trippySetState__({
        trip: updatedTrip,
        supplies: updatedSupplies,
      });
    }, persistedEvent);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1_000);

    const snapshot = await page.evaluate(() => {
      const raw = localStorage.getItem('trippy-storage');
      return raw ? JSON.parse(raw) : null;
    });

    expect(snapshot?.state?.trip?.events?.['2'] ?? []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'evt-persisted-reload', name: 'Persisted Stop' }),
      ])
    );
    expect(snapshot?.state?.supplies?.[0]?.checked).toBe(true);
  });
});

// ── Sign-out guard ────────────────────────────────────────────────────────────

test.describe('Auth — sign-out guard', () => {
  test('resetting authUser to null hides the NavBar', async ({ page }) => {
    await setupPage(page, 'dashboard');
    // Verify NavBar is up first
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).toBeVisible();
    // Simulate sign-out by clearing trip + auth
    await page.evaluate(() => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: null, authUser: null, screen: 'welcome',
      });
    });
    await expect(
      page.locator('[role="navigation"][aria-label="Main navigation"]')
    ).not.toBeVisible({ timeout: 5_000 });
  });
});
