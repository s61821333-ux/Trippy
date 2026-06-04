import { Page } from '@playwright/test';

// ── Shared trip fixture ───────────────────────────────────────────────────────

export const BASE_TRIP = {
  name:         'Test Trip',
  days:         3,
  startDate:    '2027-06-01',
  countries:    ['US'],
  participants: [{ id: 1, name: 'Tester', initials: 'TE', color: '#f97316' }],
  dayMeta:      [{ region: 'New York' }, { region: 'Boston' }, { region: 'Washington' }],
  events: {
    1: [
      { id: 'evt-1', time: '09:00', duration: 120, name: 'Morning Museum',  category: 'museum',  location: 'Central Park', addedBy: 'Tester' },
      { id: 'evt-2', time: '13:00', duration:  90, name: "Lunch at Joe's",  category: 'food',    addedBy: 'Tester' },
    ],
    2: [],
    3: [],
  },
  hotels:   [],
  expenses: [],
};

export const BASE_SUPPLIES = [
  { id: 's1', name: 'Sunscreen',    category: 'Medical',   checked: false, critical: false },
  { id: 's2', name: 'Passport',     category: 'Documents', checked: true,  critical: true  },
  { id: 's3', name: 'Water Bottle', category: 'Water',     checked: false, critical: false },
];

export const TEST_AUTH = { id: 'test-user-id', username: 'Test User' };

// ── State injection ───────────────────────────────────────────────────────────

export async function setupPage(page: Page, screen = 'dashboard') {
  await page.addInitScript(() => {
    localStorage.setItem('trippy-onboarded', '1');
    (window as unknown as Record<string, unknown>).__trippyTestMode__ = true;
  });
  await page.route('**supabase.co/realtime/**', route => route.abort());
  await page.goto('/');

  // Wait for AppShell to expose the hook
  await page.waitForFunction(
    () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
    { timeout: 45_000, polling: 200 }
  );
  // Let Splash's 1.9 s timer fire so it doesn't compete with our injection
  await page.waitForTimeout(3_500);

  // Inject with retry in case a redirect fires after us
  for (let i = 0; i < 3; i++) {
    await page.evaluate(
      ({ trip, supplies, sc, auth }) => {
        (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
          trip, supplies, screen: sc, activeDay: 1,
          tripDbId: null, authUser: auth,
          termsAccepted: true, isGlobalLoading: false,
        });
      },
      { trip: BASE_TRIP, supplies: BASE_SUPPLIES, sc: screen, auth: TEST_AUTH }
    );
    await page.waitForTimeout(600);
    const cur = await page.evaluate(
      () => (window as unknown as Record<string, () => string>).__trippyGetScreen__?.()
    );
    if (cur === screen) break;
    await page.waitForTimeout(500);
  }

  // Wait for NavBar (appears on all protected screens)
  await page.locator('[role="navigation"][aria-label="Main navigation"]')
    .waitFor({ state: 'visible', timeout: 12_000 });
  await page.waitForTimeout(400);
}

// ── Click via evaluate (bypasses Framer Motion stability check) ───────────────

export async function clickEl(page: Page, selector: string) {
  await page.waitForFunction(
    (sel) => !!document.querySelector(sel), selector, { timeout: 8_000 }
  );
  await page.evaluate(
    (sel) => (document.querySelector(sel) as HTMLElement)?.click(), selector
  );
}
