# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uiux\01-navbar.spec.ts >> NavBar >> Settings screen has a back button
- Location: tests\uiux\01-navbar.spec.ts:53:7

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
  - generic [ref=e2]:
    - generic [ref=e7]:
      - generic:
        - generic:
          - generic:
            - img
      - generic [ref=e8]:
        - generic [ref=e9]: Trippy.
        - paragraph [ref=e10]: Plan. Explore. Experience.
        - paragraph [ref=e11]: The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
        - button "Start an adventure" [ref=e12] [cursor=pointer]:
          - generic [ref=e13]: Start an adventure
          - img [ref=e16]
        - generic [ref=e19]:
          - generic [ref=e20]: Collaborate
          - generic [ref=e22]: Discover
          - generic [ref=e24]: Document
    - generic [ref=e25]:
      - button "Skip" [ref=e27] [cursor=pointer]
      - generic [ref=e29]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]: ☕
            - generic [ref=e34]:
              - paragraph [ref=e35]: Coffee & Croissant
              - paragraph [ref=e36]: 09:00
          - generic [ref=e39]:
            - generic [ref=e40]: 🏛️
            - generic [ref=e41]:
              - paragraph [ref=e42]: Louvre Museum
              - paragraph [ref=e43]: 11:00
          - generic [ref=e46]:
            - generic [ref=e47]: 🍽️
            - generic [ref=e48]:
              - paragraph [ref=e49]: Lunch at Le Marais
              - paragraph [ref=e50]: 14:00
        - heading "Plan your trip. Together." [level=1] [ref=e53]
        - paragraph [ref=e54]: Build a shared itinerary in real time with everyone on the trip.
      - generic [ref=e55]:
        - generic [ref=e56]:
          - button [ref=e57] [cursor=pointer]
          - button [ref=e58] [cursor=pointer]
          - button [ref=e59] [cursor=pointer]
        - button "Next →" [ref=e60] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e66] [cursor=pointer]:
    - img [ref=e67]
  - alert [ref=e72]
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