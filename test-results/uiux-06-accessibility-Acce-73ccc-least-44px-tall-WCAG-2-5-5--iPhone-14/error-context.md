# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\06-accessibility.spec.ts >> Accessibility & Layout >> touch targets are at least 44px tall (WCAG 2.5.5)
- Location: tests\uiux\06-accessibility.spec.ts:59:7

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
    - generic [ref=e19]:
      - generic:
        - generic:
          - generic:
            - img
      - generic [ref=e20]:
        - generic [ref=e21]: Trippy.
        - paragraph [ref=e22]: Plan. Explore. Experience.
        - paragraph [ref=e23]: The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
        - button "Start an adventure" [ref=e24] [cursor=pointer]:
          - generic [ref=e25]: Start an adventure
          - img [ref=e28]
        - generic [ref=e31]:
          - generic [ref=e32]: Collaborate
          - generic [ref=e34]: Discover
          - generic [ref=e36]: Document
    - generic [ref=e37]:
      - button "Skip" [ref=e39] [cursor=pointer]
      - generic [ref=e41]:
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]: ☕
            - generic [ref=e46]:
              - paragraph [ref=e47]: Coffee & Croissant
              - paragraph [ref=e48]: 09:00
          - generic [ref=e51]:
            - generic [ref=e52]: 🏛️
            - generic [ref=e53]:
              - paragraph [ref=e54]: Louvre Museum
              - paragraph [ref=e55]: 11:00
          - generic [ref=e58]:
            - generic [ref=e59]: 🍽️
            - generic [ref=e60]:
              - paragraph [ref=e61]: Lunch at Le Marais
              - paragraph [ref=e62]: 14:00
        - heading "Plan your trip. Together." [level=1] [ref=e65]
        - paragraph [ref=e66]: Build a shared itinerary in real time with everyone on the trip.
      - generic [ref=e67]:
        - generic [ref=e68]:
          - button [ref=e69] [cursor=pointer]
          - button [ref=e70] [cursor=pointer]
          - button [ref=e71] [cursor=pointer]
        - button "Next →" [ref=e72] [cursor=pointer]
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