# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> NavBar expand panel >> clicking Settings keeps NavBar visible
- Location: tests\ui.spec.ts:178:7

# Error details

```
Error: page.waitForFunction: SyntaxError: 'button[aria-label="Menu"] ~ button:last-child, .lg-btn:has-text("Settings")' is not a valid selector.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic:
      - generic [ref=e3]:
        - button "switchTrip" [ref=e4] [cursor=pointer]:
          - img [ref=e6]
          - generic [ref=e9]: switchTrip
        - button "Notes" [ref=e10] [cursor=pointer]:
          - img [ref=e12]
          - generic [ref=e15]: Notes
        - button "settings" [ref=e16] [cursor=pointer]:
          - img [ref=e18]
          - generic [ref=e22]: settings
        - button "Log out" [ref=e23] [cursor=pointer]:
          - img [ref=e25]
          - generic [ref=e28]: Log out
      - navigation "Main navigation" [ref=e30]:
        - button "Menu" [expanded] [ref=e31] [cursor=pointer]:
          - img [ref=e34]
        - button "Overview" [ref=e37] [cursor=pointer]:
          - img [ref=e40]
          - generic [ref=e46]: Dashboard
        - button "Day planner" [ref=e47] [cursor=pointer]:
          - img [ref=e50]
          - generic [ref=e54]: Explore
        - button "Packing list" [ref=e55] [cursor=pointer]:
          - img [ref=e58]
          - generic [ref=e61]: Pack
        - button "Crew" [ref=e62] [cursor=pointer]:
          - img [ref=e65]
          - generic [ref=e71]: Crew
    - generic "Trippy" [ref=e76]:
      - generic [ref=e77]:
        - img [ref=e80]
        - generic [ref=e87]: Trippy.
  - generic [ref=e92] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e93]:
      - img [ref=e94]
    - generic [ref=e99]:
      - button "Open issues overlay" [ref=e100]:
        - generic [ref=e101]:
          - generic [ref=e102]: "0"
          - generic [ref=e103]: "1"
        - generic [ref=e104]: Issue
      - button "Collapse issues badge" [ref=e105]:
        - img [ref=e106]
  - alert [ref=e108]
```

# Test source

```ts
  1   | /**
  2   |  * Trippy UI/UX tests — iPhone 14 & Desktop Chrome
  3   |  *
  4   |  * Key decisions:
  5   |  * - Inject state via window.__trippySetState__ AFTER Splash's 1.9s timer fires
  6   |  * - Use el.click() via page.evaluate to bypass Framer Motion animation-stability checks
  7   |  * - Supabase INITIAL_SESSION redirect is blocked by isTestMode check in AppShell
  8   |  * - Splash timer is skipped via __trippyTestMode__ flag set before page load
  9   |  */
  10  | import { test, expect, Page } from '@playwright/test';
  11  | 
  12  | // ── trip fixture ───────────────────────────────────────────────────────────────
  13  | 
  14  | const BASE_TRIP = {
  15  |   name:         'Test Trip',
  16  |   days:         3,
  17  |   startDate:    '2027-06-01',
  18  |   countries:    ['US'],
  19  |   participants: [{ id: 'u1', nickname: 'Tester', color: '#f97316' }],
  20  |   dayMeta:      [{ region: 'New York' }, { region: 'Boston' }, { region: 'Washington' }],
  21  |   events: {
  22  |     1: [
  23  |       { id: 'evt-1', time: '09:00', duration: 120, name: 'Morning Museum',   category: 'museum', location: 'Central Park', addedBy: 'Tester' },
  24  |       { id: 'evt-2', time: '13:00', duration:  90, name: "Lunch at Joe's",   category: 'food',   addedBy: 'Tester' },
  25  |     ],
  26  |     2: [],
  27  |     3: [],
  28  |   },
  29  |   hotels:   [],
  30  |   expenses: [],
  31  | };
  32  | 
  33  | const TEST_AUTH = { id: 'test-user-id', username: 'Test User' };
  34  | 
  35  | // ── helpers ────────────────────────────────────────────────────────────────────
  36  | 
  37  | async function injectTestState(page: Page, screen = 'dashboard') {
  38  |   // Wait for Shell's useEffect (sets __trippySetState__ after mount)
  39  |   await page.waitForFunction(
  40  |     () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
  41  |     { timeout: 45_000, polling: 200 }
  42  |   );
  43  |   // Wait past Splash_V2's 1.9s auto-advance timer so injection happens after it fires
  44  |   await page.waitForTimeout(3_500);
  45  |   // Inject — with retry loop in case something resets the screen
  46  |   for (let attempt = 0; attempt < 3; attempt++) {
  47  |     await page.evaluate(
  48  |       ({ trip, sc, auth }) => {
  49  |         (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
  50  |           trip,
  51  |           screen: sc,
  52  |           activeDay: 1,
  53  |           tripDbId: null,
  54  |           authUser: auth,
  55  |           termsAccepted: true,
  56  |           isGlobalLoading: false,
  57  |         });
  58  |       },
  59  |       { trip: BASE_TRIP, sc: screen, auth: TEST_AUTH }
  60  |     );
  61  |     await page.waitForTimeout(600);
  62  |     const cur = await page.evaluate(() =>
  63  |       (window as unknown as Record<string, () => string>).__trippyGetScreen__?.()
  64  |     );
  65  |     if (cur === screen) break;
  66  |     await page.waitForTimeout(500);
  67  |   }
  68  | }
  69  | 
  70  | async function waitForNav(page: Page) {
  71  |   await page.locator('[role="navigation"][aria-label="Main navigation"]')
  72  |     .waitFor({ state: 'visible', timeout: 12_000 });
  73  |   // Brief wait for any Framer Motion animation to settle
  74  |   await page.waitForTimeout(500);
  75  | }
  76  | 
  77  | async function setupPage(page: Page, screen = 'dashboard') {
  78  |   // Set test-mode flags BEFORE page load via addInitScript
  79  |   await page.addInitScript(() => {
  80  |     localStorage.setItem('trippy-onboarded', '1');
  81  |     // __trippyTestMode__ is read by Splash_V2.tsx to skip auto-advance timer
  82  |     (window as unknown as Record<string, boolean>).__trippyTestMode__ = true;
  83  |   });
  84  |   await page.route('**supabase.co/realtime/**', route => route.abort());
  85  |   await page.goto('/');
  86  |   await injectTestState(page, screen);
  87  |   await waitForNav(page);
  88  | }
  89  | 
  90  | /**
  91  |  * Click via evaluate to bypass Playwright's element-stability check.
  92  |  * Framer Motion animated elements are "not stable" during animation, but
  93  |  * React's synthetic events still work via direct .click().
  94  |  */
  95  | async function clickEl(page: Page, selector: string) {
> 96  |   await page.waitForFunction(
      |              ^ Error: page.waitForFunction: SyntaxError: 'button[aria-label="Menu"] ~ button:last-child, .lg-btn:has-text("Settings")' is not a valid selector.
  97  |     (sel) => !!document.querySelector(sel),
  98  |     selector,
  99  |     { timeout: 8_000 }
  100 |   );
  101 |   await page.evaluate((sel) => {
  102 |     (document.querySelector(sel) as HTMLElement)?.click();
  103 |   }, selector);
  104 | }
  105 | 
  106 | // ── PUBLIC SCREENS ─────────────────────────────────────────────────────────────
  107 | 
  108 | test.describe('Public screens', () => {
  109 |   test('app loads without critical JS errors', async ({ page }) => {
  110 |     const errors: string[] = [];
  111 |     page.on('pageerror', e => errors.push(e.message));
  112 |     await page.goto('/');
  113 |     await page.waitForLoadState('domcontentloaded');
  114 |     await page.waitForTimeout(2_000);
  115 |     const criticalErrors = errors.filter(e =>
  116 |       !e.includes('Warning:') && !e.includes('ResizeObserver') &&
  117 |       !e.includes('motion') && !e.includes('hydration')
  118 |     );
  119 |     expect(criticalErrors).toHaveLength(0);
  120 |   });
  121 | 
  122 |   test('page has correct title', async ({ page }) => {
  123 |     await page.goto('/');
  124 |     await expect(page).toHaveTitle(/trippy/i);
  125 |   });
  126 | 
  127 |   test('initial screen shows Trippy branding', async ({ page }) => {
  128 |     await page.goto('/');
  129 |     await page.waitForLoadState('domcontentloaded');
  130 |     await page.waitForTimeout(2_000);
  131 |     const body = await page.textContent('body');
  132 |     expect(body?.toLowerCase()).toContain('trippy');
  133 |   });
  134 | });
  135 | 
  136 | // ── NAVBAR VISIBILITY ──────────────────────────────────────────────────────────
  137 | 
  138 | test.describe('NavBar — always visible on protected screens', () => {
  139 |   for (const screen of ['dashboard', 'day', 'settings', 'notes', 'crew', 'supplies']) {
  140 |     test(`NavBar visible on ${screen}`, async ({ page }) => {
  141 |       await setupPage(page, screen);
  142 |       await expect(
  143 |         page.locator('[role="navigation"][aria-label="Main navigation"]')
  144 |       ).toBeVisible();
  145 |     });
  146 |   }
  147 | });
  148 | 
  149 | // ── NAVBAR EXPAND PANEL ────────────────────────────────────────────────────────
  150 | 
  151 | test.describe('NavBar expand panel', () => {
  152 |   test('expand panel opens on menu click', async ({ page }) => {
  153 |     await setupPage(page, 'dashboard');
  154 |     await clickEl(page, 'button[aria-label="Menu"]');
  155 |     await expect(page.getByText('Settings').first()).toBeVisible({ timeout: 5_000 });
  156 |   });
  157 | 
  158 |   test('aria-expanded toggles on menu click', async ({ page }) => {
  159 |     await setupPage(page, 'dashboard');
  160 |     const btn = page.locator('button[aria-label="Menu"]');
  161 |     await expect(btn).toHaveAttribute('aria-expanded', 'false');
  162 |     await clickEl(page, 'button[aria-label="Menu"]');
  163 |     await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 });
  164 |   });
  165 | 
  166 |   test('panel does not overflow viewport width', async ({ page }) => {
  167 |     await setupPage(page, 'dashboard');
  168 |     await clickEl(page, 'button[aria-label="Menu"]');
  169 |     await page.waitForTimeout(400);
  170 |     const panel = page.locator('.lg.lg-strong').filter({ hasText: 'Settings' }).first();
  171 |     const box   = await panel.boundingBox();
  172 |     if (box) {
  173 |       const vpW = page.viewportSize()?.width ?? 390;
  174 |       expect(box.x + box.width).toBeLessThanOrEqual(vpW + 2);
  175 |     }
  176 |   });
  177 | 
  178 |   test('clicking Settings keeps NavBar visible', async ({ page }) => {
  179 |     await setupPage(page, 'dashboard');
  180 |     await clickEl(page, 'button[aria-label="Menu"]');
  181 |     await expect(page.getByText('Settings').first()).toBeVisible({ timeout: 5_000 });
  182 |     await clickEl(page, 'button[aria-label="Menu"] ~ button:last-child, .lg-btn:has-text("Settings")');
  183 |     // Click Settings text
  184 |     await page.evaluate(() => {
  185 |       document.querySelectorAll('.lg-btn').forEach((el) => {
  186 |         if (el.textContent?.includes('Settings')) (el as HTMLElement).click();
  187 |       });
  188 |     });
  189 |     await expect(
  190 |       page.locator('[role="navigation"][aria-label="Main navigation"]')
  191 |     ).toBeVisible({ timeout: 8_000 });
  192 |   });
  193 | 
  194 |   test('panel closes after switching tab', async ({ page }) => {
  195 |     await setupPage(page, 'dashboard');
  196 |     await clickEl(page, 'button[aria-label="Menu"]');
```