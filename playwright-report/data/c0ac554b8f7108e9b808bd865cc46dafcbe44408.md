# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\05-settings.spec.ts >> Settings Screen >> has only ONE navigation (no double NavBar)
- Location: tests\uiux\05-settings.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText(/explore the demo/i).or(getByText(/נסה את ההדגמה/i)).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic "Trippy" [ref=e7]:
      - generic [ref=e8]:
        - img [ref=e11]
        - generic [ref=e18]: Trippy.
    - generic [ref=e19]:
      - button "Skip" [ref=e21] [cursor=pointer]
      - generic [ref=e23]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]: ☕
            - generic [ref=e28]:
              - paragraph [ref=e29]: Coffee & Croissant
              - paragraph [ref=e30]: 09:00
          - generic [ref=e33]:
            - generic [ref=e34]: 🏛️
            - generic [ref=e35]:
              - paragraph [ref=e36]: Louvre Museum
              - paragraph [ref=e37]: 11:00
          - generic [ref=e40]:
            - generic [ref=e41]: 🍽️
            - generic [ref=e42]:
              - paragraph [ref=e43]: Lunch at Le Marais
              - paragraph [ref=e44]: 14:00
        - heading "Plan your trip. Together." [level=1] [ref=e47]
        - paragraph [ref=e48]: Build a shared itinerary in real time with everyone on the trip.
      - generic [ref=e49]:
        - generic [ref=e50]:
          - button [ref=e51] [cursor=pointer]
          - button [ref=e52] [cursor=pointer]
          - button [ref=e53] [cursor=pointer]
        - button "Next →" [ref=e54] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e60] [cursor=pointer]:
    - img [ref=e61]
  - alert [ref=e66]
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