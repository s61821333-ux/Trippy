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
  - alert [ref=e11]
  - generic [ref=e12]:
    - generic [ref=e17]:
      - generic:
        - generic:
          - generic:
            - img
      - generic [ref=e18]:
        - generic [ref=e19]: Trippy.
        - paragraph [ref=e20]: Plan. Explore. Experience.
        - paragraph [ref=e21]: The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
        - button "Start an adventure" [ref=e22] [cursor=pointer]:
          - generic [ref=e23]: Start an adventure
          - img [ref=e26]
        - generic [ref=e29]:
          - generic [ref=e30]: Collaborate
          - generic [ref=e32]: Discover
          - generic [ref=e34]: Document
    - generic [ref=e35]:
      - button "Skip" [ref=e37] [cursor=pointer]
      - generic [ref=e39]:
        - generic [ref=e41]:
          - generic [ref=e42]:
            - generic [ref=e43]: ☕
            - generic [ref=e44]:
              - paragraph [ref=e45]: Coffee & Croissant
              - paragraph [ref=e46]: 09:00
          - generic [ref=e49]:
            - generic [ref=e50]: 🏛️
            - generic [ref=e51]:
              - paragraph [ref=e52]: Louvre Museum
              - paragraph [ref=e53]: 11:00
          - generic [ref=e56]:
            - generic [ref=e57]: 🍽️
            - generic [ref=e58]:
              - paragraph [ref=e59]: Lunch at Le Marais
              - paragraph [ref=e60]: 14:00
        - heading "Plan your trip. Together." [level=1] [ref=e63]
        - paragraph [ref=e64]: Build a shared itinerary in real time with everyone on the trip.
      - generic [ref=e65]:
        - generic [ref=e66]:
          - button [ref=e67] [cursor=pointer]
          - button [ref=e68] [cursor=pointer]
          - button [ref=e69] [cursor=pointer]
        - button "Next →" [ref=e70] [cursor=pointer]
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