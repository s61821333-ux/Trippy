import { Page } from '@playwright/test';

/**
 * Loads the app in demo mode.
 *
 * Why this approach: AppShell's onAuthStateChange fires INITIAL_SESSION on every
 * page load and resets screen→'login', overwriting anything set in localStorage
 * (screen is NOT persisted by the store's partialize fn). We call loadDemoTrip()
 * AFTER the login screen has rendered, which guarantees INITIAL_SESSION already
 * fired and won't reset our state again.
 */
export async function loadDemoState(page: Page, extraState: Record<string, unknown> = {}) {
  // Pre-set persisted prefs & suppress the tour overlay
  await page.addInitScript((extra) => {
    const current = JSON.parse(localStorage.getItem('trippy-storage') || '{"state":{}}');
    current.state = {
      ...current.state,
      termsAccepted: true,
      darkMode: extra.darkMode === true,
    };
    localStorage.setItem('trippy-storage', JSON.stringify(current));
    localStorage.setItem('trippy-tour-done', '1'); // skip tour overlay
  }, extraState);

  await page.goto('/');

  // Wait for the login screen's "Continue with Google" button — proves React has
  // hydrated, INITIAL_SESSION has fired, and screen='login'
  await page.waitForSelector('button:has-text("Continue with Google")', { timeout: 30_000 });

  // Apply extra state (darkMode, activeDay, etc.) then load the demo trip
  await page.evaluate((extra) => {
    const store = (window as any).__trippyStore;
    if (store && Object.keys(extra).length > 0) {
      store.setState(extra);
    }
    store.getState().loadDemoTrip();
  }, extraState);

  // Wait for dashboard content — using :visible to skip the hidden desktop nav bar
  // (NavBar renders both mobile + desktop nav; both have [data-tour] but only one
  // is visible at a given viewport width)
  await page.waitForSelector('[data-tour="nav-dashboard"]:visible', { timeout: 15_000 });
  await page.waitForTimeout(300); // framer-motion settle
}

/** Navigate to a screen via the nav bar — only clicks the visible tab. */
export async function goToScreen(page: Page, screen: 'dashboard' | 'day' | 'supplies' | 'settings') {
  // dispatchEvent fires directly on the DOM element, bypassing any Next.js dev overlay
  // that may intercept pointer-based clicks. The :visible selector avoids the hidden desktop nav twin.
  await page.locator(`[data-tour="nav-${screen}"]:visible`).dispatchEvent('click');
  await page.waitForTimeout(300);
}
