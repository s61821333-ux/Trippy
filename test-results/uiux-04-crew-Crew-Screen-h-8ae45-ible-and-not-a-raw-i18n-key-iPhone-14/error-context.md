# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\04-crew.spec.ts >> Crew Screen >> heading is visible and not a raw i18n key
- Location: tests\uiux\04-crew.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText(/explore the demo/i).or(getByText(/נסה את ההדגמה/i)).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e13]
  - generic [ref=e14]:
    - img [ref=e15]
    - generic [ref=e22]: Trippy.
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Navigate to the app and click "Explore the demo" to enter demo mode.
  5  |  * Returns once the dashboard / NavBar is visible.
  6  |  */
  7  | export async function loadDemo(page: Page) {
  8  |   await page.goto('/');
  9  | 
  10 |   // Wait for the app to hydrate — either login screen or the demo button
  11 |   await page.waitForLoadState('networkidle');
  12 | 
  13 |   // The demo button may be on the login/welcome screen
  14 |   const demoBtn = page.getByText(/explore the demo/i).or(page.getByText(/נסה את ההדגמה/i));
  15 | 
  16 |   // If the splash/welcome screen is shown first, wait for it to pass
  17 |   await page.waitForTimeout(1200);
  18 | 
  19 |   // Click demo button
> 20 |   await demoBtn.first().click();
     |                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  21 | 
  22 |   // Wait for the NavBar to appear (signals we're inside the app with a trip loaded)
  23 |   await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible({ timeout: 10_000 });
  24 | }
  25 | 
  26 | /** Click a NavBar tab by its accessible label */
  27 | export async function clickTab(page: Page, label: string) {
  28 |   await page.getByRole('button', { name: new RegExp(label, 'i') }).first().click();
  29 |   await page.waitForTimeout(400); // allow screen transition
  30 | }
  31 | 
```