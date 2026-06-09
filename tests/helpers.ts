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

export async function setupPage(page: Page, screen = 'dashboard', colorScheme: 'light' | 'dark' = 'light') {
  if (colorScheme === 'dark') await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript((scheme) => {
    localStorage.setItem('trippy-onboarded', '1');
    (window as unknown as Record<string, unknown>).__trippyTestMode__ = true;
    if (scheme === 'dark') {
      try {
        const stored = localStorage.getItem('app-storage');
        const parsed = stored ? JSON.parse(stored) : {};
        parsed.state = { ...(parsed.state ?? {}), themeMode: 'dark' };
        localStorage.setItem('app-storage', JSON.stringify(parsed));
      } catch {}
    }
  }, colorScheme);
  await page.route('**supabase.co/realtime/**', route => route.abort());

  // Navigate to /app directly so AppShell always mounts (no server-side auth redirect).
  // Retry on transient Next.js dev-server unavailability after a hot-reload.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page.goto('/app', { timeout: 15_000 });
      break;
    } catch {
      if (attempt === 3) throw new Error('Dev server unreachable after 4 attempts — is `npm run dev` running?');
      await page.waitForTimeout(3_000);
    }
  }

  // Wait for AppShell to expose the test hook (set synchronously on first effect run)
  await page.waitForFunction(
    () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
    { timeout: 15_000, polling: 100 }
  );
  // Let the entry animation (600 ms) and auth flow settle before injecting state
  await page.waitForTimeout(1_200);

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

// ── Click via Playwright locator (supports :has-text() and other PW selectors) ─

export async function clickEl(page: Page, selector: string) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 8_000 });
  // force: true bypasses Playwright's stability check — Framer Motion keeps
  // requestAnimationFrame running for gesture detection, so elements are never
  // considered "stable" by Playwright's default heuristic.
  await locator.click({ force: true });
}
