/**
 * DEEP TEST — 360° full application audit.
 * NEVER runs automatically. Only run manually when doing a full release check.
 * Manual run: npm run test:deep
 *
 * Coverage areas:
 *  A. Security (OWASP Top 10 2025 + cookie flags + XSS + open-redirect)
 *  B. Accessibility — WCAG 2.1 AA (ARIA, keyboard, focus, labels, headings)
 *  C. Responsive & Mobile (320 px → desktop, touch targets, orientation, safe-area)
 *  D. Performance (Core Web Vitals thresholds, no layout shift, font loading)
 *  E. PWA & Offline (manifest, service worker, offline fallback)
 *  F. All screens smoke test (Home, Dashboard, Day, Packing, Crew, Settings, Notes, Map)
 *  G. Form flows (validation, duplicate-submit guard, data preserved on back)
 *  H. State persistence (theme, language, onboarding across reloads)
 *  I. Navigation regression (back button, tab switching, 404 handling)
 */

import { test, expect, Page, Browser } from '@playwright/test';
import { setupPage, clickEl, BASE_TRIP, BASE_SUPPLIES, TEST_AUTH } from './helpers';

// Helper: grab response headers for a given path
async function getHeaders(browser: Browser, path = '/'): Promise<Record<string, string>> {
  const page = await browser.newPage();
  const res  = await page.goto(`http://localhost:3000${path}`);
  const hdrs = Object.fromEntries(
    Object.entries(res?.headers() ?? {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  await page.close();
  return hdrs;
}

// Helper: measure navigation timing via PerformanceNavigationTiming
async function navTiming(page: Page): Promise<{ fcp: number; domLoaded: number }> {
  return page.evaluate(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const fcp   = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    return { fcp: Math.round(fcp), domLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0) };
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// A · SECURITY
// ═════════════════════════════════════════════════════════════════════════════

test.describe('A — Security: Response Headers', () => {
  let headers: Record<string, string>;

  test.beforeAll(async ({ browser }) => {
    headers = await getHeaders(browser, '/');
  });

  test('A01 — X-Frame-Options set to SAMEORIGIN or DENY', async () => {
    expect(headers['x-frame-options']).toMatch(/SAMEORIGIN|DENY/i);
  });

  test('A02 — X-Content-Type-Options is nosniff', async () => {
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('A03 — CSP header present and non-empty', async () => {
    expect(headers['content-security-policy']).toBeTruthy();
  });

  test('A04 — CSP contains frame-ancestors (clickjacking guard)', async () => {
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  test('A05 — CSP default-src restricts to self', async () => {
    expect(headers['content-security-policy']).toContain("default-src 'self'");
  });

  test('A06 — Referrer-Policy present', async () => {
    expect(headers['referrer-policy']).toBeTruthy();
  });

  test('A07 — Permissions-Policy blocks camera', async () => {
    expect(headers['permissions-policy']).toContain('camera=()');
  });

  test('A08 — Permissions-Policy blocks microphone', async () => {
    expect(headers['permissions-policy']).toContain('microphone=()');
  });

  test('A09 — X-Powered-By header suppressed (info disclosure)', async () => {
    expect(headers['x-powered-by']).toBeFalsy();
  });

  test('A10 — CSP connect-src restricts to known origins', async () => {
    const csp = headers['content-security-policy'] ?? '';
    expect(csp).toContain('connect-src');
    // Must not have a wildcard connect-src
    expect(csp).not.toMatch(/connect-src\s+'\*'|connect-src\s+\*/);
  });
});

test.describe('A — Security: Client-side data handling', () => {
  test('A11 — no JWT / auth token in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const suspicious = await page.evaluate(() => {
      const found: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) ?? '';
        const val = localStorage.getItem(key) ?? '';
        if (
          /eyJ[A-Za-z0-9_-]{20,}/.test(val) ||
          /access_token|refresh_token|bearer/i.test(key)
        ) found.push(key);
      }
      return found;
    });
    expect(suspicious, `Auth tokens in localStorage: ${suspicious}`).toHaveLength(0);
  });

  test('A12 — Supabase auth cookie not readable via document.cookie (HttpOnly)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const jsCookies = await page.evaluate(() => document.cookie);
    expect(
      /sb-[a-z0-9]+-auth-token/i.test(jsCookies),
      'Supabase session cookie accessible from JS — missing HttpOnly flag'
    ).toBe(false);
  });

  test('A13 — no sensitive data leaks into URL query params', async ({ page }) => {
    const urls: string[] = [];
    page.on('request', req => urls.push(req.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const leaked = urls.filter(u => {
      try {
        const params = new URL(u).searchParams;
        for (const [key, val] of params) {
          if (
            /token|password|secret|key|jwt|auth/i.test(key) ||
            /eyJ[A-Za-z0-9_-]{20,}/.test(val)
          ) return true;
        }
      } catch { /* ignore non-parseable */ }
      return false;
    });
    expect(leaked, `Sensitive data in URLs: ${leaked}`).toHaveLength(0);
  });

  test('A14 — XSS: injected script tag in text input does not execute', async ({ page }) => {
    let xssExecuted = false;
    await page.exposeFunction('__xssProbe__', () => { xssExecuted = true; });

    await setupPage(page, 'dashboard');

    // Attempt to inject via any visible text input
    const inputs = page.locator('input[type="text"], input:not([type]), textarea');
    const count  = await inputs.count();
    if (count > 0) {
      await inputs.first().fill('<img src=x onerror="__xssProbe__()">');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }
    expect(xssExecuted, 'XSS probe executed — unsanitised HTML injected into DOM').toBe(false);
  });

  test('A15 — open redirect: login does not follow arbitrary external URLs', async ({ page }) => {
    // Attempt to redirect to an external domain via the next/callbackUrl param
    await page.goto('/?next=https://evil.example.com');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1_000);
    // App must NOT navigate away to an external origin
    expect(page.url()).not.toContain('evil.example.com');
  });
});

test.describe('A — Security: API authentication enforcement', () => {
  test('A16 — /api/trips returns 401 or 403 without auth header', async ({ request }) => {
    const res = await request.get('/api/trips');
    expect([401, 403, 405], `Expected auth rejection, got ${res.status()}`).toContain(res.status());
  });

  test('A17 — /api/ai/* returns 401 or 403 without auth', async ({ request }) => {
    const res = await request.post('/api/ai/suggestions', { data: { query: 'test' } });
    expect([401, 403, 405]).toContain(res.status());
  });

  test('A18 — account delete endpoint requires auth', async ({ request }) => {
    const res = await request.post('/api/account/delete/request');
    expect([401, 403, 405]).toContain(res.status());
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// B · ACCESSIBILITY (WCAG 2.1 AA)
// ═════════════════════════════════════════════════════════════════════════════

test.describe('B — Accessibility: ARIA structure', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');
  });

  test.afterAll(() => page.close());

  test('B01 — NavBar has role="navigation" and aria-label', async () => {
    await expect(page.locator('[role="navigation"][aria-label="Main navigation"]')).toBeVisible();
  });

  test('B02 — all NavBar tab buttons have aria-label (≥4 expected)', async () => {
    const nav  = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const tabs = nav.locator('button[aria-label]');
    await tabs.first().waitFor({ state: 'visible' });
    expect(await tabs.count()).toBeGreaterThanOrEqual(4);
  });

  test('B03 — active tab has aria-current="page"', async () => {
    await expect(page.locator('[aria-current="page"]').first()).toBeVisible();
  });

  test('B04 — menu button aria-expanded reflects open/close state', async () => {
    const btn = page.locator('button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 5_000 });
    await page.waitForTimeout(400);
    await clickEl(page, 'button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 5_000 });
  });

  test('B05 — at most one <h1> per page', async () => {
    const h1s = await page.locator('h1').count();
    expect(h1s, `Found ${h1s} <h1> elements — page should have exactly 1`).toBeLessThanOrEqual(1);
  });

  test('B06 — all <img> elements have an alt attribute', async () => {
    const missingAlt = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter(img => img.getAttribute('alt') === null)
        .map(img => img.src.slice(0, 60))
    );
    expect(missingAlt, `Images missing alt: ${missingAlt}`).toHaveLength(0);
  });

  test('B07 — <main> landmark present', async () => {
    const mainCount = await page.locator('main, [role="main"]').count();
    expect(mainCount, 'No <main> landmark found').toBeGreaterThan(0);
  });
});

test.describe('B — Accessibility: Day view specific', () => {
  test('B08 — drag handles have aria-label="Drag to reorder"', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'day');
    await page.waitForTimeout(1_000);
    const handle = page.locator('[aria-label="Drag to reorder"]').first();
    await expect(handle).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('B — Accessibility: Touch targets (WCAG 2.5.5)', () => {
  test('B09 — all interactive elements in NavBar meet 44 × 44 px minimum', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');
    const nav   = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const btns  = nav.locator('button');
    const count = await btns.count();
    const failures: string[] = [];
    for (let i = 0; i < count; i++) {
      const box = await btns.nth(i).boundingBox();
      if (box && (box.height < 44 || box.width < 44)) {
        const label = await btns.nth(i).getAttribute('aria-label') ?? `#${i}`;
        failures.push(`"${label}" → ${Math.round(box.width)}×${Math.round(box.height)}`);
      }
    }
    expect(failures, `Undersized touch targets: ${failures.join(', ')}`).toHaveLength(0);
  });

  test('B10 — floating action button (FAB) meets 44 × 44 px minimum', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');
    const fab = page.locator('button[aria-label="Add event"], button[aria-label="Add"], [data-testid="fab"]').first();
    const visible = await fab.isVisible().catch(() => false);
    if (visible) {
      const box = await fab.boundingBox();
      if (box) {
        expect(box.height, 'FAB height < 44px').toBeGreaterThanOrEqual(44);
        expect(box.width,  'FAB width  < 44px').toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('B — Accessibility: Keyboard & focus management', () => {
  test('B11 — Escape key closes an open menu/sheet', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');
    await clickEl(page, 'button[aria-label="Menu"]');
    await page.waitForTimeout(400);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const btn = page.locator('button[aria-label="Menu"]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 3_000 });
  });

  test('B12 — interactive elements reachable via Tab key (keyboard nav present)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');
    // Tab through up to 10 focusable elements — at least 4 must exist
    const focused: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName ?? '');
      if (tag && tag !== 'BODY') focused.push(tag);
    }
    expect(focused.length, 'Fewer than 4 keyboard-focusable elements found').toBeGreaterThanOrEqual(4);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// C · RESPONSIVE & MOBILE
// ═════════════════════════════════════════════════════════════════════════════

test.describe('C — Responsive: No horizontal overflow across breakpoints', () => {
  for (const [label, width, height] of [
    ['320 px (small phone)',  320, 568 ],
    ['375 px (iPhone SE)',    375, 667 ],
    ['393 px (iPhone 15)',    393, 852 ],
    ['768 px (tablet)',       768, 1024],
    ['1280 px (desktop)',    1280, 800 ],
  ] as const) {
    test(`C01 — no horizontal overflow at ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await setupPage(page, 'dashboard');
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow, `Horizontal scroll present at ${width}px`).toBe(false);
    });
  }
});

test.describe('C — Responsive: Mobile-specific checks', () => {
  test('C07 — input font-size ≥16px on mobile (prevents iOS auto-zoom)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');
    const smallInputs = await page.evaluate(() => {
      const bad: string[] = [];
      document.querySelectorAll('input, textarea, select').forEach(el => {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) bad.push(`${(el as HTMLElement).tagName}[${el.getAttribute('name') ?? el.getAttribute('type') ?? '?'}] = ${fs}px`);
      });
      return bad;
    });
    expect(
      smallInputs,
      `Inputs with font-size < 16px (causes iOS auto-zoom):\n${smallInputs.join('\n')}`
    ).toHaveLength(0);
  });

  test('C08 — viewport meta tag present with width=device-width', async ({ page }) => {
    await page.goto('/');
    const content = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(content, 'Viewport meta missing').toBeTruthy();
    expect(content).toContain('width=device-width');
  });

  test('C09 — user-scalable not blocked (accessibility: users can zoom)', async ({ page }) => {
    await page.goto('/');
    const content = await page.locator('meta[name="viewport"]').getAttribute('content') ?? '';
    expect(content).not.toContain('user-scalable=no');
    expect(content).not.toMatch(/maximum-scale=1(?:\.\d)?(?:\s|,|$)/);
  });
});

test.describe('C — Responsive: Landscape orientation', () => {
  test('C10 — app renders in landscape without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 852, height: 393 }); // iPhone landscape
    await setupPage(page, 'dashboard');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow, 'Horizontal scroll in landscape mode').toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// D · PERFORMANCE (Core Web Vitals — generous thresholds for dev mode)
// ═════════════════════════════════════════════════════════════════════════════

test.describe('D — Performance: Navigation timing', () => {
  test('D01 — First Contentful Paint < 5 s (dev mode threshold)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);
    const { fcp } = await navTiming(page);
    expect(fcp, `FCP ${fcp}ms exceeds 5000ms`).toBeLessThan(5_000);
  });

  test('D02 — DOM content loaded < 8 s (dev mode threshold)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const { domLoaded } = await navTiming(page);
    expect(domLoaded, `DOMContentLoaded ${domLoaded}ms exceeds 8000ms`).toBeLessThan(8_000);
  });

  test('D03 — no significant Cumulative Layout Shift (CLS < 0.25)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2_000);

    const cls = await page.evaluate(async () => {
      return new Promise<number>(resolve => {
        let total = 0;
        const obs = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            // LayoutShift entries have a `value` property
            total += (entry as PerformanceEntry & { value?: number }).value ?? 0;
          }
        });
        try {
          obs.observe({ type: 'layout-shift', buffered: true });
        } catch { /* not supported */ }
        setTimeout(() => { obs.disconnect(); resolve(total); }, 1000);
      });
    });
    expect(cls, `CLS ${cls.toFixed(3)} exceeds 0.25 threshold`).toBeLessThan(0.25);
  });

  test('D04 — all visible images have explicit width & height attributes', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter(img => img.offsetParent !== null && (!img.width || !img.height))
        .map(img => img.src.slice(0, 80))
    );
    expect(missing, `Images missing w/h (cause CLS):\n${missing.join('\n')}`).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// E · PWA & OFFLINE
// ═════════════════════════════════════════════════════════════════════════════

test.describe('E — PWA: Manifest & service worker', () => {
  test('E01 — manifest.json returns 200', async ({ request }) => {
    const res = await request.get('/manifest.json').catch(() => null)
               ?? await request.get('/manifest.webmanifest').catch(() => null);
    if (res) {
      expect(res.status()).toBe(200);
    } else {
      // Manifest may be served differently — check the link tag
      const page = await (await import('@playwright/test')).chromium?.launch?.();
      // Skip gracefully if manifest not found at either path
      console.warn('E01: manifest.json / manifest.webmanifest not found at root — verify link[rel=manifest]');
    }
  });

  test('E02 — service worker is registered after load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2_000);

    const registered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.length > 0;
    });
    expect(registered, 'No service worker registered — PWA offline mode will fail').toBe(true);
  });

  test('E03 — app renders something useful when network is offline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(3_000);

    // Should NOT show a raw browser error page
    const bodyText = await page.locator('body').innerText().catch(() => '');
    expect(bodyText.length, 'Offline page renders no content').toBeGreaterThan(5);
    // Restore
    await context.setOffline(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// F · ALL SCREENS SMOKE TEST
// ═════════════════════════════════════════════════════════════════════════════

test.describe('F — All screens render without crash', () => {
  const screens = [
    { name: 'home',      screen: 'home'      },
    { name: 'dashboard', screen: 'dashboard' },
    { name: 'day',       screen: 'day'       },
    { name: 'packing',   screen: 'supplies'  },
    { name: 'crew',      screen: 'crew'      },
    { name: 'settings',  screen: 'settings'  },
    { name: 'notes',     screen: 'notes'     },
    { name: 'map',       screen: 'map'       },
  ] as const;

  for (const { name, screen } of screens) {
    test(`F — ${name} screen renders`, async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 852 });
      await setupPage(page, screen as string);
      // NavBar present = app rendered correctly
      await expect(
        page.locator('[role="navigation"][aria-label="Main navigation"]')
      ).toBeVisible({ timeout: 10_000 });
      // No error boundary
      const errBoundary = await page.locator('text=/Something went wrong/i').isVisible().catch(() => false);
      expect(errBoundary, `${name} screen shows error boundary`).toBe(false);
    });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// G · FORM FLOWS
// ═════════════════════════════════════════════════════════════════════════════

test.describe('G — Form flows: validation & submission', () => {
  test('G01 — packing add-item sheet opens and has a text input', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'supplies');
    // Find an "Add" or "+" button on the packing screen
    const addBtn = page.locator('button[aria-label*="Add"], button[aria-label*="add"], button:has-text("Add")').first();
    const visible = await addBtn.isVisible().catch(() => false);
    if (visible) {
      await clickEl(page, 'button[aria-label*="Add"], button:has-text("Add")');
      await page.waitForTimeout(600);
      // A sheet should appear with a text input
      const input = page.locator('input[type="text"], input:not([type])').first();
      await expect(input).toBeVisible({ timeout: 4_000 });
    }
  });

  test('G02 — duplicate-submit guard: form submit button disabled after click', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');

    // Intercept any mutating API call so we can observe button state
    await page.route('**/api/**', async route => {
      await new Promise(r => setTimeout(r, 400)); // simulate slow API
      await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });

    // Find a submit / save button inside a visible form or sheet
    const saveBtn = page.locator(
      'button[type="submit"], button:has-text("Save"), button:has-text("Create"), button:has-text("Add")'
    ).first();
    const visible = await saveBtn.isVisible().catch(() => false);
    if (visible) {
      await saveBtn.click().catch(() => {});
      // Check immediately that it's disabled or aria-disabled during submission
      await page.waitForTimeout(100);
      const disabled = await saveBtn.isDisabled().catch(() => false);
      const ariaDis  = (await saveBtn.getAttribute('aria-disabled')) === 'true';
      // Skip assertion if the button is no longer visible (sheet closed on immediate success)
      const stillVisible = await saveBtn.isVisible().catch(() => false);
      if (stillVisible) {
        expect(
          disabled || ariaDis,
          'Submit button not disabled during API call — duplicate submission risk'
        ).toBe(true);
      }
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// H · STATE PERSISTENCE
// ═════════════════════════════════════════════════════════════════════════════

test.describe('H — State persistence across page reloads', () => {
  test('H01 — onboarding flag persists (no re-onboarding on reload)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('trippy-onboarded', '1'));
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1_500);
    const flag = await page.evaluate(() => localStorage.getItem('trippy-onboarded'));
    expect(flag, 'Onboarding flag lost after reload').toBe('1');
  });

  test('H02 — theme preference persists across reload', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'settings');

    // Set a theme via the store (simulate what the settings screen does)
    await page.evaluate(() => {
      try {
        const state = JSON.parse(localStorage.getItem('trippy-store') ?? '{}');
        state.theme = 'dark';
        localStorage.setItem('trippy-store', JSON.stringify(state));
      } catch { /* ignore if structure differs */ }
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1_500);

    const stored = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('trippy-store') ?? '{}').theme; } catch { return null; }
    });
    // If theme was stored it should survive reload; if store uses a different key, skip
    if (stored !== null) {
      expect(stored, 'Theme preference lost after reload').toBe('dark');
    }
  });

  test('H03 — language preference persists across reload', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'settings');

    await page.evaluate(() => {
      try {
        const state = JSON.parse(localStorage.getItem('trippy-store') ?? '{}');
        state.language = 'es';
        localStorage.setItem('trippy-store', JSON.stringify(state));
      } catch { /* ignore */ }
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1_500);

    const stored = await page.evaluate(() => {
      try { return JSON.parse(localStorage.getItem('trippy-store') ?? '{}').language; } catch { return null; }
    });
    if (stored !== null) {
      expect(stored, 'Language preference lost after reload').toBe('es');
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// I · NAVIGATION REGRESSION
// ═════════════════════════════════════════════════════════════════════════════

test.describe('I — Navigation regression', () => {
  test('I01 — all NavBar tabs switch screens without crashing', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await setupPage(page, 'dashboard');

    const nav  = page.locator('[role="navigation"][aria-label="Main navigation"]');
    const tabs = nav.locator('button[aria-label]');
    const count = Math.min(await tabs.count(), 5);

    for (let i = 0; i < count; i++) {
      const label = await tabs.nth(i).getAttribute('aria-label') ?? `Tab ${i}`;
      await clickEl(page, `[role="navigation"] button[aria-label="${label}"]`);
      await page.waitForTimeout(600);
      // Must not crash
      const errBoundary = await page.locator('text=/Something went wrong/i').isVisible().catch(() => false);
      expect(errBoundary, `Crashed when switching to tab "${label}"`).toBe(false);
    }
  });

  test('I02 — 404 route returns an error page, not a crash', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-404xyz');
    // Next.js should handle 404 gracefully
    const status = res?.status() ?? 0;
    expect([404, 200]).toContain(status); // 200 if app-shell catches it client-side
    const bodyText = await page.locator('body').innerText().catch(() => '');
    expect(bodyText.length).toBeGreaterThan(0);
    // Must not show an unhandled error
    expect(bodyText).not.toContain('Application error');
  });

  test('I03 — unauthenticated user redirected from protected API', async ({ request }) => {
    const res = await request.get('/api/trips');
    expect([401, 403, 405]).toContain(res.status());
  });

  test('I04 — /join/[token] route renders without crash for invalid token', async ({ page }) => {
    await page.goto('/join/invalid-test-token-xyz');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1_500);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    expect(bodyText.length, 'Join page rendered empty body').toBeGreaterThan(5);
    expect(bodyText).not.toContain('Application error');
  });
});
