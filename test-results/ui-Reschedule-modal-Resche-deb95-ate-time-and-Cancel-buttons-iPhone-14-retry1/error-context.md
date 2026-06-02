# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> Reschedule modal >> Reschedule sheet has Update time and Cancel buttons
- Location: tests\ui.spec.ts:229:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByText('Reschedule') resolved to 2 elements:
    1) <span>Reschedule</span> aka getByRole('button', { name: 'Reschedule' }).first()
    2) <span>Reschedule</span> aka getByRole('button', { name: 'Reschedule' }).nth(1)

Call log:
  - waiting for getByText('Reschedule')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation "Main navigation" [ref=e4]:
      - button "Menu" [ref=e5] [cursor=pointer]:
        - img [ref=e8]
      - button "Overview" [ref=e11] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e20]: Dashboard
      - button "Day planner" [ref=e21] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e28]: Explore
      - button "Packing list" [ref=e29] [cursor=pointer]:
        - img [ref=e32]
        - generic [ref=e35]: Pack
      - button "Crew" [ref=e36] [cursor=pointer]:
        - img [ref=e39]
        - generic [ref=e45]: Crew
    - generic [ref=e50]:
      - generic [ref=e51]:
        - button "Dashboard" [ref=e52] [cursor=pointer]:
          - img [ref=e54]
          - text: Dashboard
        - paragraph [ref=e57]: Test Trip · 2027
        - generic [ref=e58]:
          - heading "Day 1" [level=1] [ref=e59]
          - generic [ref=e60]:
            - button "AI suggestions" [ref=e61] [cursor=pointer]:
              - img [ref=e63]
              - text: AI suggestions
            - generic [ref=e66]:
              - button "List" [ref=e67] [cursor=pointer]
              - button "Time" [ref=e68] [cursor=pointer]
        - paragraph [ref=e69]: Tue, Jun 1 · 2 events · 19h 30m free
        - generic [ref=e70]:
          - button "Jun 1" [ref=e71] [cursor=pointer]
          - button "Jun 2" [ref=e72] [cursor=pointer]
          - button "Jun 3" [ref=e73] [cursor=pointer]
      - generic [ref=e76]:
        - list [ref=e77]:
          - listitem [ref=e78]:
            - generic "Drag to reorder" [ref=e79]:
              - img [ref=e81]
            - generic [ref=e84]:
              - button "09:00 ↓ 11:00 Morning Museum Central Park Museum" [expanded] [ref=e85] [cursor=pointer]:
                - generic [ref=e86]:
                  - generic [ref=e87]: 09:00
                  - generic [ref=e88]: ↓
                  - generic [ref=e89]: 11:00
                - img [ref=e90]
                - generic [ref=e103]:
                  - generic [ref=e104]: Morning Museum
                  - generic [ref=e105]:
                    - img [ref=e107]
                    - text: Central Park
                  - generic [ref=e111]: Museum
                - img [ref=e114]
              - generic [ref=e118]:
                - generic [ref=e121]:
                  - generic [ref=e122]: Duration
                  - generic [ref=e123]: 09:00–11:00 (2h)
                - generic [ref=e124]:
                  - button "Edit" [ref=e125] [cursor=pointer]:
                    - img [ref=e127]
                    - generic [ref=e130]: Edit
                  - button "Reschedule" [ref=e131] [cursor=pointer]:
                    - img [ref=e133]
                    - generic [ref=e137]: Reschedule
                  - button "AI suggest" [ref=e138] [cursor=pointer]:
                    - img [ref=e140]
                    - generic [ref=e143]: AI suggest
                  - button "Delete" [ref=e144] [cursor=pointer]:
                    - img [ref=e146]
                    - generic [ref=e149]: Delete
          - listitem [ref=e150]:
            - generic "Drag to reorder" [ref=e151]:
              - img [ref=e153]
            - generic [ref=e156]:
              - button "13:00 ↓ 14:30 Lunch at Joe's Food" [ref=e157] [cursor=pointer]:
                - generic [ref=e158]:
                  - generic [ref=e159]: 13:00
                  - generic [ref=e160]: ↓
                  - generic [ref=e161]: 14:30
                - img [ref=e162]
                - generic [ref=e171]:
                  - generic [ref=e172]: Lunch at Joe's
                  - generic [ref=e173]: Food
                - img [ref=e176]
              - generic [ref=e179]:
                - generic [ref=e182]:
                  - generic [ref=e183]: Duration
                  - generic [ref=e184]: 13:00–14:30 (1h 30m)
                - generic [ref=e185]:
                  - button "Edit" [ref=e186] [cursor=pointer]:
                    - img [ref=e188]
                    - generic [ref=e191]: Edit
                  - button "Reschedule" [ref=e192] [cursor=pointer]:
                    - img [ref=e194]
                    - generic [ref=e198]: Reschedule
                  - button "AI suggest" [ref=e199] [cursor=pointer]:
                    - img [ref=e201]
                    - generic [ref=e204]: AI suggest
                  - button "Delete" [ref=e205] [cursor=pointer]:
                    - img [ref=e207]
                    - generic [ref=e210]: Delete
        - button "Stay Add hotel / accommodation" [ref=e211] [cursor=pointer]:
          - img [ref=e212]
          - generic [ref=e227]:
            - generic [ref=e228]: Stay
            - paragraph [ref=e229]: Add hotel / accommodation
          - img [ref=e231]
        - button "Add an event" [ref=e234] [cursor=pointer]:
          - img [ref=e236]
          - text: Add an event
  - button "Open Next.js Dev Tools" [ref=e244] [cursor=pointer]:
    - img [ref=e245]
  - alert [ref=e250]
```

# Test source

```ts
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
  197 |     await expect(page.getByText('Notes').first()).toBeVisible({ timeout: 5_000 });
  198 |     await clickEl(page, 'button[aria-label="Crew"]');
  199 |     await expect(page.getByText('Notes')).not.toBeVisible({ timeout: 5_000 });
  200 |   });
  201 | });
  202 | 
  203 | // ── TAB NAVIGATION ─────────────────────────────────────────────────────────────
  204 | 
  205 | test.describe('Tab navigation', () => {
  206 |   test('Overview tab has aria-current=page on dashboard', async ({ page }) => {
  207 |     await setupPage(page, 'dashboard');
  208 |     await expect(page.locator('button[aria-label="Overview"]')).toHaveAttribute('aria-current', 'page');
  209 |   });
  210 | 
  211 |   test('Day planner tab switches screen', async ({ page }) => {
  212 |     await setupPage(page, 'dashboard');
  213 |     await clickEl(page, 'button[aria-label="Day planner"]');
  214 |     await expect(page.locator('button[aria-label="Day planner"]'))
  215 |       .toHaveAttribute('aria-current', 'page', { timeout: 5_000 });
  216 |   });
  217 | 
  218 |   test('Crew tab switches screen', async ({ page }) => {
  219 |     await setupPage(page, 'dashboard');
  220 |     await clickEl(page, 'button[aria-label="Crew"]');
  221 |     await expect(page.locator('button[aria-label="Crew"]'))
  222 |       .toHaveAttribute('aria-current', 'page', { timeout: 5_000 });
  223 |   });
  224 | 
  225 |   test('Packing list tab switches screen', async ({ page }) => {
  226 |     await setupPage(page, 'dashboard');
  227 |     await clickEl(page, 'button[aria-label="Packing list"]');
  228 |     await expect(page.locator('button[aria-label="Packing list"]'))
  229 |       .toHaveAttribute('aria-current', 'page', { timeout: 5_000 });
  230 |   });
  231 | });
  232 | 
> 233 | // ── RESCHEDULE MODAL ───────────────────────────────────────────────────────────
      |                                        ^ Error: locator.click: Error: strict mode violation: getByText('Reschedule') resolved to 2 elements:
  234 | 
  235 | test.describe('Reschedule modal', () => {
  236 |   test('event card shows Reschedule quick action', async ({ page }) => {
  237 |     await setupPage(page, 'day');
  238 |     await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
  239 |     await clickEl(page, '.lg.a-rise');
  240 |     await expect(page.getByText('Reschedule')).toBeVisible({ timeout: 5_000 });
  241 |   });
  242 | 
  243 |   test('Reschedule opens time-only sheet — no Event name field', async ({ page }) => {
  244 |     await setupPage(page, 'day');
  245 |     await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
  246 |     await clickEl(page, '.lg.a-rise');
  247 |     await page.evaluate(() => {
  248 |       document.querySelectorAll('button').forEach(b => {
  249 |         if (b.textContent?.trim() === 'Reschedule') b.click();
  250 |       });
  251 |     });
  252 |     await expect(page.getByText('Start time')).toBeVisible({ timeout: 5_000 });
  253 |     await expect(page.getByText('End time')).toBeVisible({ timeout: 5_000 });
  254 |     await expect(page.getByText('Duration shortcut')).toBeVisible({ timeout: 5_000 });
  255 |     await expect(page.getByText('Event name')).not.toBeVisible();
  256 |   });
  257 | 
  258 |   test('Reschedule sheet has Update time and Cancel buttons', async ({ page }) => {
  259 |     await setupPage(page, 'day');
  260 |     await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
  261 |     await clickEl(page, '.lg.a-rise');
  262 |     await page.evaluate(() => {
  263 |       document.querySelectorAll('button').forEach(b => {
  264 |         if (b.textContent?.trim() === 'Reschedule') b.click();
  265 |       });
  266 |     });
  267 |     await expect(page.getByText('Update time')).toBeVisible({ timeout: 5_000 });
  268 |     await expect(page.getByText('Cancel').first()).toBeVisible({ timeout: 5_000 });
  269 |   });
  270 | 
  271 |   test('Cancel closes the reschedule sheet', async ({ page }) => {
  272 |     await setupPage(page, 'day');
  273 |     await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
  274 |     await clickEl(page, '.lg.a-rise');
  275 |     await page.evaluate(() => {
  276 |       document.querySelectorAll('button').forEach(b => {
  277 |         if (b.textContent?.trim() === 'Reschedule') b.click();
  278 |       });
  279 |     });
  280 |     await expect(page.getByText('Update time')).toBeVisible({ timeout: 5_000 });
  281 |     await page.evaluate(() => {
  282 |       document.querySelectorAll('button').forEach(b => {
  283 |         if (b.textContent?.trim() === 'Cancel') b.click();
  284 |       });
  285 |     });
  286 |     await expect(page.getByText('Update time')).not.toBeVisible({ timeout: 5_000 });
  287 |   });
  288 | 
  289 |   test('Edit opens full sheet with Event name field', async ({ page }) => {
  290 |     await setupPage(page, 'day');
  291 |     await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
  292 |     await clickEl(page, '.lg.a-rise');
  293 |     await page.evaluate(() => {
  294 |       document.querySelectorAll('button').forEach(b => {
  295 |         if (b.textContent?.trim() === 'Edit') b.click();
  296 |       });
  297 |     });
  298 |     await expect(page.getByText('Event name')).toBeVisible({ timeout: 5_000 });
  299 |     await expect(page.getByText('Update time')).not.toBeVisible();
  300 |   });
  301 | });
  302 | 
  303 | // ── RESPONSIVE LAYOUT ──────────────────────────────────────────────────────────
  304 | 
  305 | test.describe('Responsive layout', () => {
  306 |   test('no horizontal overflow on dashboard', async ({ page }) => {
  307 |     await setupPage(page, 'dashboard');
  308 |     const bodyW = await page.evaluate(() => document.body.scrollWidth);
  309 |     const viewW = await page.evaluate(() => window.innerWidth);
  310 |     expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  311 |   });
  312 | 
  313 |   test('NavBar anchored near bottom of viewport', async ({ page }) => {
  314 |     await setupPage(page, 'dashboard');
  315 |     const nav = page.locator('[role="navigation"][aria-label="Main navigation"]');
  316 |     const box = await nav.boundingBox();
  317 |     const vpH = page.viewportSize()?.height ?? 844;
  318 |     if (box) expect(box.y + box.height).toBeGreaterThan(vpH * 0.75);
  319 |   });
  320 | 
  321 |   test('NavBar fits within viewport width', async ({ page }) => {
  322 |     await setupPage(page, 'dashboard');
  323 |     const nav = page.locator('[role="navigation"][aria-label="Main navigation"]');
  324 |     const box = await nav.boundingBox();
  325 |     const vpW = page.viewportSize()?.width ?? 390;
  326 |     if (box) expect(box.x + box.width).toBeLessThanOrEqual(vpW + 2);
  327 |   });
  328 | 
  329 |   test('day pill rail does not cause horizontal overflow', async ({ page }) => {
  330 |     await setupPage(page, 'day');
  331 |     const bodyW = await page.evaluate(() => document.body.scrollWidth);
  332 |     const viewW = await page.evaluate(() => window.innerWidth);
  333 |     expect(bodyW).toBeLessThanOrEqual(viewW + 5);
```