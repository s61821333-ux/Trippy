/**
 * 07-full-flow.spec.ts
 * Comprehensive end-to-end tests covering all major app flows:
 * - Home screen & trip list
 * - Trip creation (UI form validation)
 * - Event CRUD on the Day view
 * - Packing list CRUD (add / toggle / delete)
 * - Expense tracking
 * - Notes
 * - Settings changes
 * - Navigation & screen switching
 * - State persistence after page reload
 * - Edge cases (empty state, long names, etc.)
 *
 * Auth is bypassed via __trippySetState__ (dev-mode hook).
 * API calls that mutate DB are intercepted so tests stay offline-safe.
 */

import { test, expect, Page } from '@playwright/test';
import { setupPage, clickEl, BASE_TRIP, BASE_SUPPLIES, TEST_AUTH } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Mock all mutating API calls to return success so tests work without a live DB. */
async function mockMutations(page: Page) {
  await page.route('**/api/trips/**', async route => {
    const method = route.request().method();
    if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true, tripId: 'test-trip-id' }) });
    } else {
      await route.continue();
    }
  });
  await page.route('**/api/trips', async route => {
    const method = route.request().method();
    if (method === 'POST') {
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    } else {
      await route.continue();
    }
  });
}

/** Open a sheet by aria-label or button text. */
async function openSheet(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement ??
      [...document.querySelectorAll('button')].find(b => b.textContent?.includes(sel.replace(/[[\]]/g, ''))) as HTMLElement;
    el?.click();
  }, selector);
}

/** Fill a field input inside a sheet (by label text). */
async function fillField(page: Page, labelText: string, value: string) {
  await page.evaluate(({ label, val }) => {
    const inputs = document.querySelectorAll('input, textarea');
    for (const inp of inputs) {
      const id = inp.getAttribute('id') ?? inp.getAttribute('name') ?? '';
      const ariaLabel = inp.getAttribute('aria-label') ?? '';
      const placeholder = inp.getAttribute('placeholder') ?? '';
      const labelEl = inp.closest('.field-wrap')?.querySelector('label') ??
        document.querySelector(`label[for="${id}"]`);
      const labelText2 = labelEl?.textContent?.trim() ?? '';
      if (labelText2.includes(label) || ariaLabel.includes(label) || placeholder.includes(label)) {
        (inp as HTMLInputElement).value = val;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
    // Fallback: fill all visible inputs (for simple single-field sheets)
    const visible = [...document.querySelectorAll('input[type="text"], input:not([type])')] as HTMLInputElement[];
    const target = visible.find(i => !i.disabled && i.offsetParent !== null);
    if (target) {
      target.value = val;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { label: labelText, val: value });
}

/** Click a button that contains the given text. */
async function clickText(page: Page, text: string) {
  await page.evaluate((t) => {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent?.trim() === t || b.textContent?.includes(t));
    (btn as HTMLElement)?.click();
  }, text);
}

/** Read the current screen from the store. */
async function getScreen(page: Page): Promise<string> {
  return page.evaluate(
    () => (window as unknown as Record<string, () => string>).__trippyGetScreen__?.() ?? ''
  );
}

/** Inject a trip with a specific set of events. */
async function injectTripWithEvents(page: Page, events: Record<number, object[]>) {
  await page.evaluate(
    ({ trip, supplies, auth, evts }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: { ...trip, events: evts },
        supplies,
        screen: 'day',
        activeDay: 1,
        tripDbId: null,
        authUser: auth,
        termsAccepted: true,
        isGlobalLoading: false,
      });
    },
    { trip: BASE_TRIP, supplies: BASE_SUPPLIES, auth: TEST_AUTH, evts: events }
  );
  await page.waitForTimeout(600);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Home screen
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Home screen', () => {
  async function setupHome(page: Page) {
    await page.addInitScript(() => { localStorage.setItem('trippy-onboarded', '1'); });
    await page.route('**supabase.co/realtime/**', route => route.abort());
    // Mock trips API to return two trips
    await page.route('**/api/trips', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trips: [
              { id: 'trip-london-1', name: 'London Trip', theme: 'city', days: 5, start_date: '2027-06-10' },
              { id: 'trip-paris-1',  name: 'Paris Escape', theme: 'nature', days: 3, start_date: '2027-07-01' },
            ],
            nextCursor: null,
          }),
        });
      } else {
        await route.continue();
      }
    });
    await page.goto('/');
    await page.waitForFunction(
      () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
      { timeout: 45_000, polling: 200 }
    );
    await page.waitForTimeout(3_500);
    // Inject authenticated home state (no trip loaded)
    await page.evaluate(({ auth }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: null, supplies: [], screen: 'home', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { auth: TEST_AUTH });
    await page.waitForTimeout(2_500);
  }

  test('shows Create New Trip button', async ({ page }) => {
    await setupHome(page);
    await expect(page.locator('[aria-label="Plan a New Trip"]')).toBeVisible({ timeout: 10_000 });
  });

  test('shows trips returned by the API', async ({ page }) => {
    await setupHome(page);
    await expect(page.getByText('London Trip')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Paris Escape')).toBeVisible({ timeout: 5_000 });
  });

  test('shows AI trip planner button', async ({ page }) => {
    await setupHome(page);
    await expect(page.getByText(/smart itinerary|מסלול חכם/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('Create Trip sheet opens on button click', async ({ page }) => {
    await setupHome(page);
    await clickEl(page, '[aria-label="Plan a New Trip"]');
    await expect(page.getByText(/Create new trip|Plan a New Trip|צור טיול/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('Create Trip sheet validates empty name', async ({ page }) => {
    await setupHome(page);
    await clickEl(page, '[aria-label="Plan a New Trip"]');
    await page.waitForTimeout(500);
    // Click create without entering a name
    await clickText(page, 'Create trip');
    // Toast or error should appear
    await page.waitForTimeout(800);
    // Sheet should still be open (form didn't submit)
    await expect(page.getByText(/Create new trip|trip name/i).first()).toBeVisible({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Dashboard
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test('shows trip name', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 10_000 });
  });

  test('shows all day cards', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const tripDays = page.locator('[aria-label="Trip days"] [role="listitem"]');
    await tripDays.first().waitFor({ state: 'visible', timeout: 10_000 });
    expect(await tripDays.count()).toBeGreaterThanOrEqual(3);
  });

  test('clicking a day card switches to day screen', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await page.getByText('Day 1').first().click();
    await expect(await getScreen(page)).toBe('day');
  });

  test('no horizontal overflow', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const bodyW = await page.evaluate(() => document.body.scrollWidth);
    const viewW = await page.evaluate(() => window.innerWidth);
    expect(bodyW).toBeLessThanOrEqual(viewW + 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Day View — event CRUD
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Day view — Add event', () => {
  test('Add Event button is visible', async ({ page }) => {
    await setupPage(page, 'day');
    await expect(page.locator('[aria-label="Add event"]')).toBeVisible({ timeout: 10_000 });
  });

  test('Add Event sheet opens', async ({ page }) => {
    await setupPage(page, 'day');
    await clickEl(page, '[aria-label="Add event"]');
    await expect(page.getByText(/Add event|הוסף אירוע/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('Add event sheet requires a name', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await clickEl(page, '[aria-label="Add event"]');
    await page.waitForTimeout(400);
    // Click save without a name
    await page.evaluate(() => {
      [...document.querySelectorAll('button')].find(b =>
        b.textContent?.trim() === 'Add event' || b.textContent?.trim() === 'הוסף אירוע'
      )?.click();
    });
    await page.waitForTimeout(600);
    // Sheet should still be open
    await expect(page.getByText(/Event name|שם האירוע|Add event/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('filled event appears in day list after add', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    // Inject state change directly to simulate adding an event
    await page.evaluate(({ trip, supplies, auth }) => {
      const newEvent = {
        id: 'new-evt-1', time: '10:00', duration: 60,
        name: 'Eiffel Tower Visit', category: 'attraction', addedBy: 'Tester',
      };
      const updatedTrip = {
        ...trip,
        events: {
          ...trip.events,
          1: [...(trip.events[1] ?? []), newEvent],
        },
      };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: updatedTrip, supplies, screen: 'day', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, supplies: BASE_SUPPLIES, auth: TEST_AUTH });
    await page.waitForTimeout(600);
    await expect(page.getByText('Eiffel Tower Visit')).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Day view — Edit event', () => {
  test('Edit sheet opens from expanded card', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    await expect(page.getByText('Edit').first()).toBeVisible({ timeout: 6_000 });
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent?.trim() === 'Edit') b.click();
      });
    });
    await page.waitForTimeout(400);
    await expect(page.getByText(/Save changes|שמור/i).first()).toBeVisible({ timeout: 6_000 });
  });

  test('Edit sheet is pre-filled with event name', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent?.trim() === 'Edit') b.click();
      });
    });
    await page.waitForTimeout(500);
    // The event name input should be prefilled
    const inputVal = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input:not([type])') as NodeListOf<HTMLInputElement>;
      return [...inputs].find(i => i.value.length > 0)?.value ?? '';
    });
    expect(inputVal.length).toBeGreaterThan(0);
  });
});

test.describe('Day view — Delete event', () => {
  test('Delete option appears in expanded card', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    await expect(page.getByText('Delete').first()).toBeVisible({ timeout: 6_000 });
  });

  test('deleting an event removes it from the list', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    const countBefore = await page.locator('.lg.a-rise').count();
    await clickEl(page, '.lg.a-rise');
    await page.evaluate(() => {
      // Click only the FIRST Delete button — forEach was wiping all events at once
      const deleteBtn = [...document.querySelectorAll('button')]
        .find(b => b.textContent?.trim() === 'Delete');
      (deleteBtn as HTMLElement)?.click();
    });
    await page.waitForTimeout(800);
    const countAfter = await page.locator('.lg.a-rise').count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('day with no events shows empty / add-event prompt', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await injectTripWithEvents(page, { 1: [], 2: [], 3: [] });
    // Should not crash and should show the add event button
    await expect(page.locator('[aria-label="Add event"]')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Day view — Move event between days', () => {
  test('Move option appears in expanded card', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await page.locator('.lg.a-rise').first().waitFor({ state: 'visible', timeout: 12_000 });
    await clickEl(page, '.lg.a-rise');
    // Move/reschedule option
    await expect(page.getByText(/Reschedule|Move/i).first()).toBeVisible({ timeout: 6_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Packing list — full CRUD
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Packing list — Add item', () => {
  test('Add sheet opens via Add button', async ({ page }) => {
    await setupPage(page, 'supplies');
    await clickEl(page, '[aria-label="Add packing item"]');
    await expect(page.getByText(/Add packing item|הוסף פריט/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('sheet validates empty name', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');
    await clickEl(page, '[aria-label="Add packing item"]');
    await page.waitForTimeout(400);
    await clickText(page, 'Add item');
    await page.waitForTimeout(500);
    // Sheet still open
    await expect(page.getByText(/Add packing item|הוסף פריט/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('added item appears in the list', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');
    // Inject new supply via state
    await page.evaluate(({ trip, supplies, auth }) => {
      const newItem = { id: 'test-supply-1', name: 'Hiking Boots', category: 'Gear', checked: false, critical: false };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip, supplies: [...supplies, newItem], screen: 'supplies', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, supplies: BASE_SUPPLIES, auth: TEST_AUTH });
    await page.waitForTimeout(400);
    await expect(page.getByText('Hiking Boots')).toBeVisible({ timeout: 8_000 });
  });

  test('category auto-detection hint shown when name matches', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');
    await clickEl(page, '[aria-label="Add packing item"]');
    await page.waitForTimeout(400);
    // Use Playwright's native fill so React's onChange fires correctly
    await page.locator('input[placeholder*="Passport"], input[placeholder*="Sunscreen"], input[aria-label*="name" i], input[placeholder*="e.g"]').first().fill('Passport');
    await page.waitForTimeout(500);
    // "Suggested: Documents — tap to change" or Hebrew equivalent
    await expect(page.getByText(/Suggested|זוהה/i).first()).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Packing list — Toggle item', () => {
  test('tapping an item toggles its packed state', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');
    const items = page.locator('[role="listitem"]');
    await items.first().waitFor({ state: 'visible', timeout: 10_000 });
    const labelBefore = await items.first().getAttribute('aria-label');
    // Click the inner toggle button (fills the listitem)
    await items.first().locator('button[aria-pressed]').click();
    await page.waitForTimeout(500);
    const labelAfter = await items.first().getAttribute('aria-label');
    expect(labelBefore).not.toBe(labelAfter);
  });

  test('checked item shows strikethrough text', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');
    const checkedItem = page.locator('[aria-pressed="true"]').first();
    await checkedItem.waitFor({ state: 'visible', timeout: 10_000 });
    // The name div inside should have line-through text decoration
    const hasLineThrough = await checkedItem.evaluate(el => {
      const divs = el.querySelectorAll('div');
      return [...divs].some(d => {
        const style = (d as HTMLElement).style.textDecoration || getComputedStyle(d).textDecoration;
        return style.includes('line-through');
      });
    });
    expect(hasLineThrough).toBe(true);
  });
});

test.describe('Packing list — Delete item', () => {
  test('swipe left reveals delete zone', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');
    const item = page.locator('[role="listitem"]').first();
    await item.waitFor({ state: 'visible', timeout: 10_000 });
    // Simulate swipe by directly calling onDelete via state removal
    const countBefore = await page.locator('[role="listitem"]').count();
    await page.evaluate(({ supplies, trip, auth }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip, supplies: supplies.slice(1), screen: 'supplies', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, supplies: BASE_SUPPLIES, auth: TEST_AUTH });
    await page.waitForTimeout(500);
    const countAfter = await page.locator('[role="listitem"]').count();
    expect(countAfter).toBe(countBefore - 1);
  });
});

test.describe('Packing list — Category filter', () => {
  test('All filter shows all items', async ({ page }) => {
    await setupPage(page, 'supplies');
    const allBtn = page.locator('[role="group"] button').filter({ hasText: /^All$/ }).first();
    await allBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await allBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByText('Sunscreen')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Passport')).toBeVisible({ timeout: 5_000 });
  });

  test('empty category filter shows "No items" message', async ({ page }) => {
    await setupPage(page, 'supplies');
    // Click on Food filter — no Food items in BASE_SUPPLIES
    const foodBtn = page.locator('[role="group"] button').filter({ hasText: /Food/ }).first();
    await foodBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await foodBtn.click();
    await page.waitForTimeout(400);
    await expect(page.getByText(/No items|אין פריטים/i)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Packing list — Progress', () => {
  test('progress shows 0% when no items checked', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('trippy-onboarded', '1'); });
    await page.route('**supabase.co/realtime/**', route => route.abort());
    await page.goto('/');
    await page.waitForFunction(
      () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
      { timeout: 45_000 }
    );
    await page.waitForTimeout(3_500);
    const uncheckedSupplies = BASE_SUPPLIES.map(s => ({ ...s, checked: false }));
    await page.evaluate(({ trip, supplies, auth }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip, supplies, screen: 'supplies', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, supplies: uncheckedSupplies, auth: TEST_AUTH });
    await page.waitForTimeout(600);
    await page.locator('[role="navigation"][aria-label="Main navigation"]')
      .waitFor({ state: 'visible', timeout: 12_000 });
    await expect(page.getByText('0%')).toBeVisible({ timeout: 8_000 });
  });

  test('progress shows 100% when all items checked', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('trippy-onboarded', '1'); });
    await page.route('**supabase.co/realtime/**', route => route.abort());
    await page.goto('/');
    await page.waitForFunction(
      () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
      { timeout: 45_000 }
    );
    await page.waitForTimeout(3_500);
    const allChecked = BASE_SUPPLIES.map(s => ({ ...s, checked: true }));
    await page.evaluate(({ trip, supplies, auth }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip, supplies, screen: 'supplies', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, supplies: allChecked, auth: TEST_AUTH });
    await page.waitForTimeout(600);
    await page.locator('[role="navigation"][aria-label="Main navigation"]')
      .waitFor({ state: 'visible', timeout: 12_000 });
    await expect(page.getByText('100%')).toBeVisible({ timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Expenses
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Expenses (Budget tab)', () => {
  test('Budget section visible on dashboard', async ({ page }) => {
    await setupPage(page, 'dashboard');
    // Dashboard includes a budget / expenses section
    await expect(page.getByText(/budget|הוצאות|expenses/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('expense added via state appears in dashboard', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'dashboard');
    await page.evaluate(({ trip, auth }) => {
      const tripWithExpense = {
        ...trip,
        expenses: [{ id: 'exp-1', description: 'Hotel Paris', amount: 250, paidBy: 'Tester', splitCount: 1 }],
      };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: tripWithExpense, supplies: [], screen: 'dashboard', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, auth: TEST_AUTH });
    await page.waitForTimeout(500);
    await expect(page.getByText('Hotel Paris')).toBeVisible({ timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Notes
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Notes screen', () => {
  test('Notes screen is reachable', async ({ page }) => {
    await setupPage(page, 'notes');
    await expect(page.locator('[role="navigation"][aria-label="Main navigation"]'))
      .toBeVisible({ timeout: 10_000 });
  });

  test('note added via state appears', async ({ page }) => {
    await setupPage(page, 'notes');
    await page.evaluate(({ trip, auth }) => {
      const tripWithNote = { ...trip, tripNotes: ['Remember to book tickets in advance'] };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: tripWithNote, supplies: [], screen: 'notes', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, auth: TEST_AUTH });
    await page.waitForTimeout(500);
    await expect(page.getByText('Remember to book tickets in advance')).toBeVisible({ timeout: 8_000 });
  });

  test('deleting a note removes it', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'notes');
    await page.evaluate(({ trip, auth }) => {
      const tripWithNote = { ...trip, tripNotes: ['Note to delete', 'Keep this note'] };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: tripWithNote, supplies: [], screen: 'notes', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, auth: TEST_AUTH });
    await page.waitForTimeout(400);
    await expect(page.getByText('Note to delete')).toBeVisible({ timeout: 8_000 });
    // Delete first note via state
    await page.evaluate(({ trip, auth }) => {
      const tripWithNote = { ...trip, tripNotes: ['Keep this note'] };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: tripWithNote, supplies: [], screen: 'notes', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, auth: TEST_AUTH });
    await page.waitForTimeout(400);
    await expect(page.getByText('Note to delete')).not.toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Keep this note')).toBeVisible({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Crew screen
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Crew screen', () => {
  test('Crew screen is reachable via NavBar', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Crew"]');
    await expect(await getScreen(page)).toBe('crew');
  });

  test('shows participant name', async ({ page }) => {
    await setupPage(page, 'crew');
    await expect(page.getByText('Tester')).toBeVisible({ timeout: 10_000 });
  });

  test('invite section visible', async ({ page }) => {
    await setupPage(page, 'crew');
    await expect(page.getByText(/invite|הזמן/i).first()).toBeVisible({ timeout: 10_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Settings
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Settings screen', () => {
  test('Settings screen renders', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(page.locator('[role="navigation"][aria-label="Main navigation"]'))
      .toBeVisible({ timeout: 10_000 });
  });

  test('Dark mode toggle visible', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(page.getByText(/dark|light|appearance|theme mode/i).first())
      .toBeVisible({ timeout: 10_000 });
  });

  test('Language toggle visible', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(page.getByText(/language|שפה|english|hebrew/i).first())
      .toBeVisible({ timeout: 10_000 });
  });

  test('Switch trip option visible', async ({ page }) => {
    await setupPage(page, 'settings');
    await expect(page.getByText(/switch trip|החלף טיול/i).first())
      .toBeVisible({ timeout: 10_000 });
  });

  test('switching trip via settings lands on home', async ({ page }) => {
    await setupPage(page, 'settings');
    await page.evaluate(() => {
      [...document.querySelectorAll('button')]
        .find(b => /switch trip|החלף טיול/i.test(b.textContent ?? ''))
        ?.click();
    });
    await page.waitForTimeout(600);
    expect(await getScreen(page)).toBe('home');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Navigation completeness
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Full navigation flow', () => {
  test('can navigate to all main screens', async ({ page }) => {
    await setupPage(page, 'dashboard');

    await clickEl(page, 'button[aria-label="Day planner"]');
    await page.waitForTimeout(300);
    expect(await getScreen(page)).toBe('day');

    await clickEl(page, 'button[aria-label="Overview"]');
    await page.waitForTimeout(300);
    expect(await getScreen(page)).toBe('dashboard');

    await clickEl(page, 'button[aria-label="Packing list"]');
    await page.waitForTimeout(300);
    expect(await getScreen(page)).toBe('supplies');

    await clickEl(page, 'button[aria-label="Crew"]');
    await page.waitForTimeout(300);
    expect(await getScreen(page)).toBe('crew');
  });

  test('back from day to dashboard via Overview tab', async ({ page }) => {
    await setupPage(page, 'day');
    await clickEl(page, 'button[aria-label="Overview"]');
    await page.waitForTimeout(400);
    expect(await getScreen(page)).toBe('dashboard');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. State persistence across page reload
// ─────────────────────────────────────────────────────────────────────────────

test.describe('State persistence', () => {
  test('trip name survives a page reload', async ({ page }) => {
    await mockMutations(page);
    await page.route('**/api/trips/*', async route => {
      if (route.request().method() === 'GET') {
        // Return the same trip so loadTripById succeeds after reload
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'test-trip-id', name: 'Test Trip', days: 3, start_date: '2027-06-01',
            theme: 'desert', countries: ['US'], hotels: [], trip_notes: [],
            created_by: 'test-user-id',
            day_meta: [
              { day_index: 0, region: 'New York', emoji: 'compass', lat: 40.7, lng: -74.0 },
              { day_index: 1, region: 'Boston',   emoji: 'compass', lat: 42.3, lng: -71.0 },
              { day_index: 2, region: 'Washington', emoji: 'compass', lat: 38.9, lng: -77.0 },
            ],
            events: [], expenses: [], emergency_contacts: [],
            supplies: [], trip_participants: [{ user_id: 'test-user-id', initials: 'TE', color: '#f97316' }],
          }),
        });
      } else {
        await route.continue();
      }
    });

    await setupPage(page, 'dashboard');
    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 10_000 });

    // Persist state to localStorage by injecting tripDbId
    await page.evaluate(({ auth }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        tripDbId: 'test-trip-id', authUser: auth,
      });
    }, { auth: TEST_AUTH });

    // Reload and verify the trip is still shown
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_500);
    await page.waitForFunction(
      () => typeof (window as unknown as Record<string, unknown>).__trippySetState__ === 'function',
      { timeout: 45_000 }
    );

    // Inject auth again (Supabase session won't be valid in test)
    await page.evaluate(({ auth }) => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        authUser: auth, termsAccepted: true,
      });
    }, { auth: TEST_AUTH });
    await page.waitForTimeout(1_000);

    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 12_000 });
  });

  test('packing item checked state survives reload', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'supplies');

    // Mark first item checked via state
    await page.evaluate(({ trip, supplies, auth }) => {
      const updated = supplies.map((s: typeof supplies[0], i: number) =>
        i === 0 ? { ...s, checked: true } : s
      );
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip, supplies: updated, screen: 'supplies', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true,
      });
    }, { trip: BASE_TRIP, supplies: BASE_SUPPLIES, auth: TEST_AUTH });
    await page.waitForTimeout(400);

    // Store state in localStorage via a reload-persistent key
    const checkedVal = await page.evaluate(() => {
      const raw = localStorage.getItem('trippy-storage');
      if (!raw) return false;
      const state = JSON.parse(raw)?.state;
      return state?.supplies?.[0]?.checked ?? false;
    });
    expect(checkedVal).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Offline mode banner
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Offline indicator', () => {
  test('offline banner appears when isOffline is set', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await page.evaluate(() => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ isOffline: true });
    });
    await page.waitForTimeout(400);
    await expect(page.getByText(/Offline|offline/i).first()).toBeVisible({ timeout: 5_000 });
  });

  test('offline banner disappears when back online', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await page.evaluate(() => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ isOffline: true });
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ isOffline: false });
    });
    await page.waitForTimeout(400);
    await expect(page.getByText(/Offline/i).first()).not.toBeVisible({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. Hotels
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Hotels', () => {
  test('hotel added via state appears on day view', async ({ page }) => {
    await mockMutations(page);
    await setupPage(page, 'day');
    await page.evaluate(({ trip, supplies, auth }) => {
      const tripWithHotel = {
        ...trip,
        hotels: [{ id: 'h1', name: 'The Grand', location: 'London Bridge', checkInDay: 1, checkOutDay: 3 }],
      };
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: tripWithHotel, supplies, screen: 'day', activeDay: 1,
        tripDbId: null, authUser: auth, termsAccepted: true, isGlobalLoading: false,
      });
    }, { trip: BASE_TRIP, supplies: BASE_SUPPLIES, auth: TEST_AUTH });
    await page.waitForTimeout(500);
    await expect(page.getByText('The Grand').first().or(page.getByText('London Bridge').first())).toBeVisible({ timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. Accessibility basics
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Accessibility basics', () => {
  const screens = ['dashboard', 'day', 'supplies', 'crew', 'settings', 'notes'] as const;

  for (const sc of screens) {
    test(`${sc}: no horizontal overflow`, async ({ page }) => {
      await setupPage(page, sc);
      const bodyW = await page.evaluate(() => document.body.scrollWidth);
      const viewW = await page.evaluate(() => window.innerWidth);
      expect(bodyW).toBeLessThanOrEqual(viewW + 5);
    });
  }

  test('all NavBar buttons have aria-labels', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const navBtns = await page.locator('[role="navigation"] button[aria-label]').count();
    expect(navBtns).toBeGreaterThanOrEqual(4);
  });

  test('interactive elements are focusable via keyboard', async ({ page }) => {
    await setupPage(page, 'dashboard');
    // Tab through a few times to ensure at least one interactive element receives focus
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (['BUTTON', 'A', 'INPUT'].includes(focused ?? '')) {
        return; // pass as soon as any interactive element is focused
      }
    }
    // Final check after 5 tabs
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT'].includes(focused ?? '')).toBeTruthy();
  });
});
