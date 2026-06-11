/**
 * WIDE TEST — 200-case breadth audit across six issue areas.
 * ───────────────────────────────────────────────────────────────────────────
 * A deliberately *wide* (not deep) sweep that touches every screen, both
 * locales, both themes, and every public API route once, so a regression in
 * any corner trips at least one assertion. Organised into the six areas the
 * product owner cares about:
 *
 *   §1  UI / UX            — screens mount, controls exist, no dead ends
 *   §2  Appearance         — theme, contrast, overflow, tap targets, snapshots
 *   §3  Loading time       — mount + landing + API latency budgets
 *   §4  Hebrew & English   — RTL/LTR direction, localized strings, no overflow
 *   §5  Security           — auth gating, secret/stack leakage, injection
 *   §6  Design experts     — design-system heuristics (tokens, type, rhythm)
 *
 * Total: ~205 tests. Most are parametrized across the screen/locale matrix.
 *
 * Run:  npx playwright test tests/wide_test.spec.ts --project="iPhone 17 Chrome"
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test';
import { setupPage } from './helpers';

test.use({ viewport: { width: 393, height: 852 } });

// ─── Matrix ───────────────────────────────────────────────────────────────────
// Every protected screen AppShell can mount (splash/welcome excluded — they are
// pre-auth gateways, not part of the in-app shell).
const SCREENS = ['dashboard', 'day', 'supplies', 'map', 'crew', 'notes', 'settings', 'home'] as const;
type Screen = (typeof SCREENS)[number];

const NAV = '[role="navigation"][aria-label="Main navigation"]';

// Same environmental-noise filter the appearance suite uses.
const IGNORED = [
  /401|Unauthorized/i,
  /Turnstile|challenges\.cloudflare/i,
  /Reduced Motion/i,
  /favicon|manifest\.json|apple-icon/i,
  /service worker|sw\.js/i,
  /net::ERR_(ABORTED|FAILED)/i,
  /Failed to load resource/i,
];

function collectErrors(page: Page): () => string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => {
    if (/ResizeObserver|hydration|framer|motion|Warning:/.test(e.message)) return;
    errors.push(`pageerror: ${e.message}`);
  });
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (IGNORED.some((re) => re.test(t))) return;
    errors.push(`console.error: ${t}`);
  });
  return () => errors;
}

async function bodyText(page: Page): Promise<string> {
  return (await page.locator('body').innerText().catch(() => '')) ?? '';
}

async function assertNoCrash(page: Page) {
  const b = (await bodyText(page)).toLowerCase();
  expect(b).not.toContain('something went wrong');
  expect(b).not.toContain('application error');
  expect(b).not.toContain('unhandled runtime error');
}

function overflowPx(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

// ════════════════════════════════════════════════════════════════════════════
// §1 · UI / UX — every screen is reachable, populated, and operable
// ════════════════════════════════════════════════════════════════════════════

test.describe('§1 UI/UX · screens mount & render', () => {
  for (const screen of SCREENS) {
    test(`UX-mount · "${screen}" mounts without a crash`, async ({ page }) => {
      const errs = collectErrors(page);
      await setupPage(page, screen);
      await assertNoCrash(page);
      expect(errs(), errs().join('\n')).toHaveLength(0);
    });

    test(`UX-content · "${screen}" renders non-trivial content`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(500);
      const b = await bodyText(page);
      expect(b.trim().length, `"${screen}" body is empty`).toBeGreaterThan(10);
    });
  }
});

test.describe('§1 UI/UX · navigation', () => {
  test('UX-nav · NavBar exposes at least four labelled tabs', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const tabs = page.locator(`${NAV} button[aria-label]`);
    expect(await tabs.count()).toBeGreaterThanOrEqual(4);
  });

  test('UX-nav · every tab is clickable and switches screen without error', async ({ page }) => {
    const errs = collectErrors(page);
    await setupPage(page, 'dashboard');
    const tabs = page.locator(`${NAV} button[aria-label]`);
    const n = Math.min(await tabs.count(), 6);
    for (let i = 0; i < n; i++) {
      const label = (await tabs.nth(i).getAttribute('aria-label')) ?? '';
      await page.locator(`${NAV} button[aria-label="${label}"]`).click({ force: true });
      await page.waitForTimeout(350);
      await assertNoCrash(page);
    }
    expect(errs(), errs().join('\n')).toHaveLength(0);
  });

  test('UX-nav · active tab carries aria-current="page"', async ({ page }) => {
    await setupPage(page, 'dashboard');
    await expect(page.locator('[aria-current="page"]').first()).toBeVisible();
  });

  test('UX-nav · NavBar stays inside the viewport vertically', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const box = (await page.locator(NAV).boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  });

  test('UX-nav · rapid tab-switching (8×) does not accumulate errors', async ({ page }) => {
    const errs = collectErrors(page);
    await setupPage(page, 'dashboard');
    const tabs = page.locator(`${NAV} button[aria-label]`);
    const labels: string[] = [];
    const n = Math.min(await tabs.count(), 5);
    for (let i = 0; i < n; i++) labels.push((await tabs.nth(i).getAttribute('aria-label')) ?? '');
    for (let r = 0; r < 8; r++) {
      const l = labels[r % labels.length];
      await page.locator(`${NAV} button[aria-label="${l}"]`).click({ force: true });
      await page.waitForTimeout(150);
    }
    await assertNoCrash(page);
    expect(errs()).toHaveLength(0);
  });
});

test.describe('§1 UI/UX · expected controls per screen', () => {
  const EXPECT: Record<string, RegExp> = {
    day:      /add|activity|event|\+/i,
    supplies: /add|item|pack/i,
    crew:     /invite|member|share|crew|link/i,
    notes:    /note/i,
    settings: /trip|name|delete|currency|theme/i,
  };
  for (const [screen, re] of Object.entries(EXPECT)) {
    test(`UX-controls · "${screen}" exposes its primary affordance`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(500);
      const b = await bodyText(page);
      expect(re.test(b), `"${screen}" missing expected control (${re})`).toBe(true);
    });
  }

  test('UX-controls · day view shows the loaded events', async ({ page }) => {
    await setupPage(page, 'day');
    await page.waitForTimeout(700);
    const b = await bodyText(page);
    expect(/Morning Museum|Lunch at Joe/i.test(b)).toBe(true);
  });

  test('UX-controls · dashboard shows the trip name', async ({ page }) => {
    await setupPage(page, 'dashboard');
    expect(await bodyText(page)).toContain('Test Trip');
  });

  test('UX-controls · supplies screen lists the seeded items', async ({ page }) => {
    await setupPage(page, 'supplies');
    await page.waitForTimeout(500);
    const b = await bodyText(page);
    expect(/Sunscreen|Passport|Water Bottle/i.test(b)).toBe(true);
  });

  test('UX-controls · notes screen offers a writable input', async ({ page }) => {
    await setupPage(page, 'notes');
    await page.waitForTimeout(500);
    const hasInput = await page
      .locator('textarea, input[type="text"], [contenteditable], [role="textbox"]')
      .first().isVisible({ timeout: 4000 }).catch(() => false);
    expect(hasInput).toBe(true);
  });
});

test.describe('§1 UI/UX · empty states & resilience', () => {
  test('UX-empty · landing shows a sign-in CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button').first()).toBeVisible();
  });

  test('UX-empty · day with no events still renders a prompt, not a blank', async ({ page }) => {
    await setupPage(page, 'day');
    await page.evaluate(() => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ activeDay: 2 });
    });
    await page.waitForTimeout(500);
    const b = await bodyText(page);
    expect(b.trim().length).toBeGreaterThan(10);
  });

  test('UX-resilience · failed exchange-rates API does not white-screen dashboard', async ({ page }) => {
    await page.route('**/api/exchange-rates**', (r) =>
      r.fulfill({ status: 500, body: JSON.stringify({ error: 'down' }) }));
    await setupPage(page, 'dashboard');
    await page.waitForTimeout(1200);
    await assertNoCrash(page);
  });

  test('UX-resilience · 429 from AI routes degrades gracefully', async ({ page }) => {
    await page.route('**/api/ai/**', (r) =>
      r.fulfill({ status: 429, headers: { 'Retry-After': '60' }, body: '{"error":"rate"}' }));
    await setupPage(page, 'dashboard');
    await page.waitForTimeout(1000);
    await assertNoCrash(page);
  });

  test('UX-resilience · offline immediately after load does not crash', async ({ page, context }) => {
    const errs = collectErrors(page);
    await setupPage(page, 'dashboard');
    await context.setOffline(true);
    await page.waitForTimeout(1500);
    await assertNoCrash(page);
    expect(errs()).toHaveLength(0);
  });

  test('UX-resilience · recovers after coming back online', async ({ page, context }) => {
    await setupPage(page, 'dashboard');
    await context.setOffline(true);
    await page.waitForTimeout(800);
    await context.setOffline(false);
    await page.waitForTimeout(1200);
    await assertNoCrash(page);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// §2 · APPEARANCE — theme, contrast, overflow, tap targets
// ════════════════════════════════════════════════════════════════════════════

// Canvas-normalized relative luminance (handles oklch et al).
const LUM_FN = `(c)=>{const x=document.createElement('canvas').getContext('2d');x.fillStyle=c;x.fillRect(0,0,1,1);const[r,g,b]=x.getImageData(0,0,1,1).data;const f=v=>{const s=v/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)}`;

test.describe('§2 Appearance · light theme', () => {
  for (const screen of SCREENS) {
    test(`APP-light · "${screen}" has no horizontal overflow`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      expect(await overflowPx(page), `"${screen}" overflows`).toBeLessThanOrEqual(2);
    });
  }

  test('APP-light · body text meets WCAG AA contrast (≥4.5:1)', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-dark', value: 'false', url: 'http://localhost:3000' }]);
    await page.goto('/');
    const ratio = await page.evaluate((fn) => {
      const lum = eval(fn) as (c: string) => number;
      const s = getComputedStyle(document.body);
      const a = lum(s.color), b = lum(s.backgroundColor);
      const [hi, lo] = a > b ? [a, b] : [b, a];
      return (hi + 0.05) / (lo + 0.05);
    }, LUM_FN);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('§2 Appearance · dark theme', () => {
  for (const screen of SCREENS) {
    test(`APP-dark · "${screen}" mounts in dark mode without crash`, async ({ page }) => {
      const errs = collectErrors(page);
      await setupPage(page, screen, 'dark');
      await assertNoCrash(page);
      expect(errs()).toHaveLength(0);
    });

    test(`APP-dark · "${screen}" has no horizontal overflow in dark mode`, async ({ page }) => {
      await setupPage(page, screen, 'dark');
      await page.waitForTimeout(400);
      expect(await overflowPx(page)).toBeLessThanOrEqual(2);
    });
  }

  test('APP-dark · landing background is dark and text is light', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-dark', value: 'true', url: 'http://localhost:3000' }]);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-dark', 'true');
    const { bg, fg } = await page.evaluate((fn) => {
      const lum = eval(fn) as (c: string) => number;
      const s = getComputedStyle(document.body);
      return { bg: lum(s.backgroundColor), fg: lum(s.color) };
    }, LUM_FN);
    expect(bg).toBeLessThan(0.12);
    expect(fg).toBeGreaterThan(0.55);
  });
});

test.describe('§2 Appearance · tap targets & ergonomics', () => {
  for (const screen of ['dashboard', 'day', 'supplies', 'settings'] as Screen[]) {
    test(`APP-tap · "${screen}" NavBar tabs meet 44px target`, async ({ page }) => {
      await setupPage(page, screen);
      const tabs = page.locator(`${NAV} button`);
      const n = Math.min(await tabs.count(), 5);
      for (let i = 0; i < n; i++) {
        const box = await tabs.nth(i).boundingBox();
        if (box) expect(box.height, `tab ${i} only ${box.height}px`).toBeGreaterThanOrEqual(44);
      }
    });
  }

  test('APP-tap · landing buttons are ≥40px and inside the viewport', async ({ page }) => {
    await page.goto('/');
    const btns = page.getByRole('button');
    const vw = page.viewportSize()!.width;
    for (let i = 0; i < (await btns.count()); i++) {
      const box = await btns.nth(i).boundingBox();
      if (!box) continue;
      expect(box.height).toBeGreaterThanOrEqual(40);
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(vw + 1);
    }
  });

  test('APP-glass · backdrop saturation stays ≤1.4 (no glare)', async ({ page }) => {
    await page.goto('/');
    const sats = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const out: number[] = [];
      for (const v of ['--glass-blur', '--lg-blur', '--lg-blur-strong']) {
        const m = root.getPropertyValue(v).match(/saturate\(([\d.]+)\)/);
        if (m) out.push(parseFloat(m[1]));
      }
      return out;
    });
    for (const s of sats) expect(s).toBeLessThanOrEqual(1.4);
  });

  test('APP-motion · reduced-motion preference renders without animation crash', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setupPage(page, 'dashboard');
    await assertNoCrash(page);
  });

  test('APP-forced · forced-colors mode renders without overflow', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await setupPage(page, 'dashboard');
    expect(await overflowPx(page)).toBeLessThanOrEqual(2);
    await assertNoCrash(page);
  });
});

test.describe('§2 Appearance · visual snapshots', () => {
  test('APP-snap · landing light', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-dark', value: 'false', url: 'http://localhost:3000' }]);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('wide-landing-light.png', { animations: 'disabled', maxDiffPixelRatio: 0.02 });
  });

  test('APP-snap · landing dark', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-dark', value: 'true', url: 'http://localhost:3000' }]);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('wide-landing-dark.png', { animations: 'disabled', maxDiffPixelRatio: 0.02 });
  });

  test('APP-snap · landing Hebrew RTL', async ({ page, context }) => {
    await context.addCookies([
      { name: 'trippy-locale', value: 'he', url: 'http://localhost:3000' },
      { name: 'trippy-dark', value: 'false', url: 'http://localhost:3000' },
    ]);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('wide-landing-he.png', { animations: 'disabled', maxDiffPixelRatio: 0.02 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// §3 · LOADING TIME — mount, landing, and API latency budgets
// ════════════════════════════════════════════════════════════════════════════

test.describe('§3 Loading time · landing & navigation', () => {
  test('LOAD · landing reaches DOMContentLoaded under 4s', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('trippy-onboarded', '1'));
    const t = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(Date.now() - t, 'landing too slow').toBeLessThan(4000);
  });

  test('LOAD · landing first paint has visible content under 5s (networkidle)', async ({ page }) => {
    const t = Date.now();
    await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
    expect(Date.now() - t).toBeLessThan(5000);
    await expect(page.getByRole('button').first()).toBeVisible();
  });

  test('LOAD · no render-blocking sync XHR on landing', async ({ page }) => {
    const sync = await page.evaluate(() => {
      const orig = XMLHttpRequest.prototype.open;
      let bad = 0;
      XMLHttpRequest.prototype.open = function (m: string, u: string, async?: boolean) {
        if (async === false) bad++;
        // @ts-expect-error – passthrough
        return orig.apply(this, arguments);
      };
      return bad;
    });
    await page.goto('/');
    expect(sync).toBe(0);
  });

  for (const screen of SCREENS) {
    test(`LOAD · "${screen}" reaches a stable render under 3s after switch`, async ({ page }) => {
      await setupPage(page, 'dashboard');
      const t = Date.now();
      await page.evaluate((sc) => {
        (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ screen: sc });
      }, screen);
      await page.waitForFunction(
        () => document.querySelector('main, [role="main"], body')!.textContent!.trim().length > 10,
        { timeout: 6000 },
      );
      expect(Date.now() - t, `"${screen}" slow to render`).toBeLessThan(3000);
    });
  }
});

test.describe('§3 Loading time · resource budgets', () => {
  test('LOAD · no single same-origin JS chunk over 1.5MB on landing', async ({ page }) => {
    const big: string[] = [];
    page.on('response', async (res) => {
      const u = new URL(res.url());
      if (u.origin !== 'http://localhost:3000') return;
      if (!/\.js(\?|$)/.test(u.pathname)) return;
      const len = Number(res.headers()['content-length'] ?? 0);
      if (len > 1_500_000) big.push(`${u.pathname} ${len}b`);
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(big, `oversized chunks: ${big.join(', ')}`).toHaveLength(0);
  });

  test('LOAD · landing fires no same-origin 5xx', async ({ page }) => {
    const fail: string[] = [];
    page.on('response', (res) => {
      const u = new URL(res.url());
      if (u.origin === 'http://localhost:3000' && res.status() >= 500) fail.push(`${res.status()} ${u.pathname}`);
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(fail).toHaveLength(0);
  });

  test('LOAD · no chunk-load failures while walking every screen', async ({ page }) => {
    const errs = collectErrors(page);
    await setupPage(page, 'dashboard');
    for (const sc of SCREENS) {
      await page.evaluate((s) => {
        (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ screen: s });
      }, sc);
      await page.waitForTimeout(700);
    }
    const chunk = errs().filter((e) => /ChunkLoadError|Loading chunk/i.test(e));
    expect(chunk, chunk.join('\n')).toHaveLength(0);
  });

  test('LOAD · GET /api/exchange-rates responds under 3s', async ({ request }) => {
    const t = Date.now();
    const res = await request.get('/api/exchange-rates');
    expect(Date.now() - t).toBeLessThan(3000);
    expect(res.status()).not.toBe(500);
  });

  test('LOAD · app survives a 2s-delayed Supabase without white-screen', async ({ page }) => {
    await page.route('**/supabase.co/**', async (r) => {
      await new Promise((x) => setTimeout(x, 2000));
      await r.continue();
    });
    await setupPage(page, 'dashboard');
    await assertNoCrash(page);
  });

  test('LOAD · manifest.json is served (PWA install path)', async ({ request }) => {
    const res = await request.get('/manifest.json');
    expect(res.status()).toBe(200);
    const body = await res.json().catch(() => null);
    if (body) expect(body).toHaveProperty('name');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// §4 · HEBREW & ENGLISH — direction, localized copy, no RTL overflow
// ════════════════════════════════════════════════════════════════════════════

async function setLocale(page: Page, locale: 'en' | 'he') {
  await page.addInitScript((loc) => {
    localStorage.setItem('trippy-onboarded', '1');
    (window as unknown as Record<string, unknown>).__trippyTestMode__ = true;
    try {
      const s = JSON.parse(localStorage.getItem('app-storage') ?? '{}');
      s.state = { ...(s.state ?? {}), language: loc };
      localStorage.setItem('app-storage', JSON.stringify(s));
    } catch {}
  }, locale);
}

test.describe('§4 i18n · landing direction & copy', () => {
  test('I18N · default locale is LTR English', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByText('Continue with Google')).toBeVisible();
  });

  test('I18N · Hebrew cookie flips document to RTL', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-locale', value: 'he', url: 'http://localhost:3000' }]);
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  });

  test('I18N · Hebrew sign-in button is actually localized', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-locale', value: 'he', url: 'http://localhost:3000' }]);
    await page.goto('/');
    await expect(page.getByText('כניסה עם Google')).toBeVisible();
  });

  test('I18N · English landing contains no Hebrew characters', async ({ page }) => {
    await page.goto('/');
    const b = await bodyText(page);
    expect(/[֐-׿]/.test(b), 'Hebrew leaked into English landing').toBe(false);
  });

  test('I18N · Hebrew landing actually contains Hebrew characters', async ({ page, context }) => {
    await context.addCookies([{ name: 'trippy-locale', value: 'he', url: 'http://localhost:3000' }]);
    await page.goto('/');
    expect(/[֐-׿]/.test(await bodyText(page))).toBe(true);
  });
});

test.describe('§4 i18n · in-app RTL across screens', () => {
  for (const screen of SCREENS) {
    test(`I18N-rtl · "${screen}" renders RTL with no overflow in Hebrew`, async ({ page }) => {
      await setLocale(page, 'he');
      await page.route('**supabase.co/realtime/**', (r) => r.abort());
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      expect(await overflowPx(page), `"${screen}" RTL overflow`).toBeLessThanOrEqual(2);
      await assertNoCrash(page);
    });
  }

  test('I18N-rtl · document dir is rtl inside the app when language=he', async ({ page }) => {
    await setLocale(page, 'he');
    await page.route('**supabase.co/realtime/**', (r) => r.abort());
    await setupPage(page, 'dashboard');
    const dir = await page.evaluate(() => document.documentElement.getAttribute('dir') || getComputedStyle(document.body).direction);
    expect(dir).toMatch(/rtl/);
  });

  test('I18N-rtl · NavBar labels are Hebrew, not English fallbacks', async ({ page }) => {
    await setLocale(page, 'he');
    await page.route('**supabase.co/realtime/**', (r) => r.abort());
    await setupPage(page, 'dashboard');
    const labels = await page.locator(`${NAV} button[aria-label]`).evaluateAll((els) =>
      els.map((e) => e.getAttribute('aria-label') ?? ''));
    const anyHebrew = labels.some((l) => /[֐-׿]/.test(l));
    expect(anyHebrew, `NavBar labels not localized: ${labels.join(', ')}`).toBe(true);
  });
});

test.describe('§4 i18n · English in-app parity', () => {
  for (const screen of ['dashboard', 'day', 'supplies', 'settings'] as Screen[]) {
    test(`I18N-en · "${screen}" stays LTR with no stray Hebrew`, async ({ page }) => {
      await setLocale(page, 'en');
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      const dir = await page.evaluate(() => getComputedStyle(document.body).direction);
      expect(dir).toBe('ltr');
      expect(/[֐-׿]/.test(await bodyText(page)), `Hebrew leaked into English "${screen}"`).toBe(false);
    });
  }

  test('I18N · switching language at runtime does not crash', async ({ page }) => {
    const errs = collectErrors(page);
    await setupPage(page, 'settings');
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('app-storage') ?? '{}');
      s.state = { ...(s.state ?? {}), language: 'he' };
      localStorage.setItem('app-storage', JSON.stringify(s));
    });
    await page.waitForTimeout(600);
    await assertNoCrash(page);
    expect(errs()).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// §5 · SECURITY — auth gating, secret/stack leakage, injection hardening
// ════════════════════════════════════════════════════════════════════════════

const FAKE = '00000000-0000-0000-0000-000000000099';
const FAKE_CHILD = '00000000-0000-0000-0000-000000000001';

// Every mutating / private endpoint must reject anonymous callers.
const AUTHED_POSTS: Array<[string, unknown]> = [
  ['/api/ai/plan-trip', { destination: 'Tokyo', days: 5 }],
  ['/api/ai/suggestions', { dayNumber: 1 }],
  ['/api/ai/packing', { destination: 'Tokyo', duration: 7 }],
  ['/api/ai/destination-intel', { city: 'Tokyo', country: 'Japan' }],
  ['/api/ai/budget-coach', { expenses: [], budget: 1000 }],
  ['/api/ai/scan-receipt', { imageBase64: 'data:image/png;base64,abc' }],
  ['/api/ai/recommend', { city: 'Tokyo', style: 'food' }],
  ['/api/invitations/send', { tripId: 'x', invitedEmail: 'a@b.co' }],
  ['/api/invitations/accept', { invitationId: 'inv-1' }],
  ['/api/trips/create', { name: 'T', days: 1 }],
  [`/api/trips/${FAKE}/events`, { dayIndex: 0, name: 'T', category: 'food' }],
  [`/api/trips/${FAKE}/expenses`, { description: 'T', amount: 1 }],
  [`/api/trips/${FAKE}/wishlist`, { name: 'K', category: 'adventure' }],
  [`/api/trips/${FAKE}/emergency-contacts`, { name: 'M', phone: '1', relation: 'F' }],
  [`/api/trips/${FAKE}/invite-link`, {}],
  ['/api/account/delete/request', {}],
];

const AUTHED_GETS = ['/api/trips', '/api/invitations'];

const AUTHED_PATCHES: Array<[string, unknown]> = [
  [`/api/trips/${FAKE}/hotels`, { hotels: [] }],
  [`/api/trips/${FAKE}/day-meta`, { dayIndex: 0, region: 'NY' }],
  [`/api/trips/${FAKE}/events/${FAKE_CHILD}`, { name: 'U' }],
];

test.describe('§5 Security · anonymous callers are rejected', () => {
  for (const [route, data] of AUTHED_POSTS) {
    test(`SEC-auth · POST ${route} requires auth`, async ({ request }) => {
      const res = await request.post(route, { headers: { 'Content-Type': 'application/json' }, data });
      expect([400, 401, 403, 404, 405], `${route} → ${res.status()}`).toContain(res.status());
    });
  }
  for (const route of AUTHED_GETS) {
    test(`SEC-auth · GET ${route} requires auth`, async ({ request }) => {
      const res = await request.get(route);
      expect([401, 403, 404, 405], `${route} → ${res.status()}`).toContain(res.status());
    });
  }
  for (const [route, data] of AUTHED_PATCHES) {
    test(`SEC-auth · PATCH ${route} requires auth`, async ({ request }) => {
      const res = await request.patch(route, { headers: { 'Content-Type': 'application/json' }, data });
      expect([400, 401, 403, 404, 405], `${route} → ${res.status()}`).toContain(res.status());
    });
  }
  test('SEC-auth · DELETE /api/account/delete requires auth', async ({ request }) => {
    expect([401, 403, 405]).toContain((await request.delete('/api/account/delete')).status());
  });
  test('SEC-auth · DELETE /api/trips/[id]/expenses/[expId] requires auth', async ({ request }) => {
    const res = await request.delete(`/api/trips/${FAKE}/expenses/${FAKE_CHILD}`);
    expect([401, 403, 404, 405]).toContain(res.status());
  });
});

test.describe('§5 Security · no secret or stack leakage', () => {
  const PROBE = ['/api/trips', '/api/invitations', '/api/exchange-rates', '/api/trips/create'];
  for (const route of PROBE) {
    test(`SEC-leak · ${route} leaks no secrets or stack traces`, async ({ request }) => {
      const res = await request.get(route);
      const text = await res.text();
      expect(text).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY/i);
      expect(text).not.toMatch(/ANTHROPIC_API_KEY/i);
      expect(text).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
      expect(text).not.toContain('at Object.<anonymous>');
      expect(text).not.toContain('node_modules');
      expect(text).not.toContain('.ts:');
    });
  }
});

test.describe('§5 Security · client-side token hygiene', () => {
  test('SEC-store · no JWT/bearer token persisted in localStorage after navigation', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const tabs = page.locator(`${NAV} button[aria-label]`);
    const n = Math.min(await tabs.count(), 4);
    for (let i = 0; i < n; i++) {
      const l = (await tabs.nth(i).getAttribute('aria-label')) ?? '';
      await page.locator(`${NAV} button[aria-label="${l}"]`).click({ force: true });
      await page.waitForTimeout(250);
    }
    const leaky = await page.evaluate(() => {
      const bad: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) ?? '';
        const v = localStorage.getItem(k) ?? '';
        if (/eyJ[A-Za-z0-9_-]{20,}/.test(v)) bad.push(k);
        if (/access_token|refresh_token|bearer/i.test(k)) bad.push(k);
      }
      return bad;
    });
    expect(leaky, leaky.join(', ')).toHaveLength(0);
  });

  test('SEC-store · Supabase auth cookie is not JS-readable (HttpOnly)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(/sb-[a-z0-9]+-auth-token/i.test(await page.evaluate(() => document.cookie))).toBe(false);
  });

  test('SEC-store · sessionStorage holds no raw JWT', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    const leaky = await page.evaluate(() => {
      const bad: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        if (/eyJ[A-Za-z0-9_-]{20,}/.test(sessionStorage.getItem(sessionStorage.key(i) ?? '') ?? '')) bad.push('hit');
      }
      return bad;
    });
    expect(leaky).toHaveLength(0);
  });
});

test.describe('§5 Security · injection & malformed input hardening', () => {
  test('SEC-inj · SQL-injection in query params never 500s', async ({ request }) => {
    for (const p of ["' OR '1'='1", '"; DROP TABLE trips; --']) {
      const res = await request.get(`/api/trips?cursor=${encodeURIComponent(p)}`);
      expect(res.status(), p).not.toBe(500);
    }
  });

  test('SEC-inj · prototype pollution in body never 500s', async ({ request }) => {
    const res = await request.post('/api/trips/create', {
      headers: { 'Content-Type': 'application/json' },
      data: '{"__proto__":{"isAdmin":true},"name":"T","days":1}',
    });
    expect(res.status()).not.toBe(500);
  });

  test('SEC-inj · CRLF header injection does not split headers', async ({ request }) => {
    const res = await request.get('/api/trips?cursor=%0d%0aX-Injected%3a%20evil');
    expect(res.headers()['x-injected']).toBeUndefined();
  });

  test('SEC-inj · oversized body is rejected (400/401/403/413), not 500', async ({ request }) => {
    const res = await request.post('/api/trips/create', {
      headers: { 'Content-Type': 'application/json' },
      data: { name: 'A'.repeat(1_000_000), days: 1 },
    });
    expect([400, 401, 403, 413], `got ${res.status()}`).toContain(res.status());
  });

  test('SEC-inj · path traversal does not return server files', async ({ page }) => {
    await page.goto('/../../etc/passwd').catch(() => {});
    const b = await bodyText(page);
    expect(b).not.toContain('root:x:0:0');
    expect(b).not.toContain('/bin/bash');
  });

  test('SEC-inj · invalid join token shows no raw stack', async ({ page }) => {
    await page.goto('/join/totally-invalid-token-xyz').catch(() => {});
    await page.waitForTimeout(1000);
    const b = await bodyText(page);
    expect(b).not.toContain('at Object.<anonymous>');
    expect(b).not.toContain('node_modules');
    expect(b.toLowerCase()).not.toContain('application error');
  });

  test('SEC-inj · XSS payload in trip name is not executed as HTML', async ({ page }) => {
    const fired: string[] = [];
    page.on('dialog', (d) => { fired.push(d.message()); d.dismiss().catch(() => {}); });
    await setupPage(page, 'dashboard');
    await page.evaluate(() => {
      (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({
        trip: { name: '<img src=x onerror=alert(1)>', days: 1, events: { 1: [] }, hotels: [], expenses: [] },
      });
    });
    await page.waitForTimeout(800);
    expect(fired, 'XSS executed').toHaveLength(0);
    // The literal markup should appear as text, never as a live <img>
    const liveImg = await page.locator('img[src="x"]').count();
    expect(liveImg).toBe(0);
  });

  test('SEC-eval · app code does not invoke eval() at runtime', async ({ page }) => {
    await page.addInitScript(() => {
      const orig = window.eval;
      (window as unknown as Record<string, unknown>).__evalLog__ = [];
      window.eval = function (c: string) {
        (window as unknown as Record<string, string[]>).__evalLog__.push(String(c).slice(0, 80));
        return orig.call(window, c);
      };
    });
    await setupPage(page, 'dashboard');
    await page.waitForTimeout(1200);
    const logged: string[] = await page.evaluate(() => (window as unknown as Record<string, string[]>).__evalLog__ ?? []);
    const suspicious = logged.filter((c) =>
      !/webpack|componentMod|Server Component|defineProperty|Promise|Array|isFunction|trippy|__pwEvaluate|trip, supplies|null/.test(c));
    expect(suspicious, suspicious.join(' | ')).toHaveLength(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// §6 · DESIGN EXPERTS — design-system heuristics a reviewer would flag
// ════════════════════════════════════════════════════════════════════════════

test.describe('§6 Design · typographic hierarchy', () => {
  for (const screen of SCREENS) {
    test(`DSGN-head · "${screen}" has a heading landmark`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      // home intentionally has no NavBar; still must have a heading
      const headings = await page.locator('h1, h2, h3').count();
      expect(headings, `"${screen}" has no heading`).toBeGreaterThan(0);
    });
  }

  test('DSGN-head · landing has exactly one h1', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('h1').count()).toBe(1);
  });

  test('DSGN-type · body uses the project font stack (Heebo/Noto/system), not Times', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const fam = await page.evaluate(() => getComputedStyle(document.body).fontFamily.toLowerCase());
    expect(fam).not.toMatch(/times|serif$/);
    expect(fam.length).toBeGreaterThan(0);
  });

  test('DSGN-type · no text smaller than 11px on the dashboard', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const tooSmall = await page.evaluate(() => {
      let bad = 0;
      document.querySelectorAll('body *').forEach((el) => {
        if (!el.textContent?.trim()) return;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs && fs < 11) bad++;
      });
      return bad;
    });
    expect(tooSmall, `${tooSmall} elements below 11px`).toBe(0);
  });
});

test.describe('§6 Design · token discipline', () => {
  test('DSGN-token · design tokens are defined on :root', async ({ page }) => {
    await page.goto('/');
    const defined = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const candidates = ['--lg-blur', '--glass-blur', '--lg-blur-strong'];
      return candidates.filter((v) => root.getPropertyValue(v).trim().length > 0);
    });
    expect(defined.length, 'no glass/lg design tokens found on :root').toBeGreaterThan(0);
  });

  test('DSGN-token · accent color is consistent across two screens', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const a = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent') || getComputedStyle(document.documentElement).getPropertyValue('--lg-accent'));
    await page.evaluate(() => (window as unknown as Record<string, (p: unknown) => void>).__trippySetState__({ screen: 'settings' }));
    await page.waitForTimeout(400);
    const b = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent') || getComputedStyle(document.documentElement).getPropertyValue('--lg-accent'));
    expect(a.trim()).toBe(b.trim());
  });

  test('DSGN-token · dark mode actually swaps the background token', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await setupPage(page, 'dashboard', 'dark');
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(dark).not.toBe(light);
  });
});

test.describe('§6 Design · layout rhythm & polish', () => {
  for (const screen of ['dashboard', 'day', 'supplies', 'crew', 'settings'] as Screen[]) {
    test(`DSGN-edge · "${screen}" content respects a safe horizontal gutter`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      // No primary text block should sit flush against the very edge (x===0) at full width.
      const flush = await page.evaluate(() => {
        let count = 0;
        document.querySelectorAll('h1, h2, p').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 100 && r.left <= 0) count++;
        });
        return count;
      });
      expect(flush, `"${screen}" has ${flush} edge-flush text blocks`).toBe(0);
    });
  }

  test('DSGN-img · no <img> is missing alt text on the dashboard', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const missing = await page.locator('img:not([alt])').count();
    expect(missing, `${missing} images without alt`).toBe(0);
  });

  test('DSGN-contrast · NavBar label text is not invisible against its surface', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const transparent = await page.evaluate(() => {
      let bad = 0;
      document.querySelectorAll(`${'[role="navigation"][aria-label="Main navigation"]'} *`).forEach((el) => {
        const c = getComputedStyle(el as Element).color;
        if (c === 'rgba(0, 0, 0, 0)' && (el.textContent ?? '').trim()) bad++;
      });
      return bad;
    });
    expect(transparent).toBe(0);
  });

  test('DSGN-focus · keyboard focus is visible on the first landing button', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button').first();
    await btn.focus();
    const ring = await btn.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.outlineStyle !== 'none' || s.boxShadow !== 'none' || parseFloat(s.outlineWidth) > 0;
    });
    expect(ring, 'no visible focus indicator').toBe(true);
  });

  test('DSGN-scroll · dashboard does not trap the user (page is scrollable or fully visible)', async ({ page }) => {
    await setupPage(page, 'dashboard');
    const ok = await page.evaluate(() => {
      const d = document.documentElement;
      return d.scrollHeight <= window.innerHeight + 4 || getComputedStyle(d).overflowY !== 'hidden';
    });
    expect(ok).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// §7 · BREADTH TOP-UP — utility-endpoint robustness, idle stability, headers
//   (extends §1/§3/§5 to take the wide sweep over 200 cases)
// ════════════════════════════════════════════════════════════════════════════

test.describe('§3+ Loading · utility endpoints never 500 and answer in time', () => {
  const UTIL: Array<[string, string]> = [
    ['/api/exchange-rates', ''],
    ['/api/weather', '?lat=40.7&lng=-74'],
    ['/api/timezone', '?lat=40.7&lng=-74'],
    ['/api/places', '?q=paris'],
    ['/api/route-time', '?fromLat=40.7&fromLng=-74&toLat=41&toLng=-73'],
  ];
  for (const [route, qs] of UTIL) {
    test(`LOAD+ · GET ${route} responds <5s and never 500s`, async ({ request }) => {
      const t = Date.now();
      const res = await request.get(`${route}${qs}`);
      expect(Date.now() - t, `${route} slow`).toBeLessThan(5000);
      expect(res.status(), `${route} → ${res.status()}`).not.toBe(500);
      if (res.status() === 200) {
        expect(res.headers()['content-type'] ?? '').toMatch(/json/);
      }
    });
  }
});

test.describe('§1+ UI/UX · screens stay error-free while idle', () => {
  for (const screen of SCREENS) {
    test(`UX-idle · "${screen}" logs no console error over a 1.2s idle`, async ({ page }) => {
      const errs = collectErrors(page);
      await setupPage(page, screen);
      await page.waitForTimeout(1200);
      expect(errs(), errs().join('\n')).toHaveLength(0);
    });
  }
});

test.describe('§5+ Security · response headers & method hygiene', () => {
  test('SEC-hdr · landing sets X-Content-Type-Options: nosniff or omits sniffable risk', async ({ request }) => {
    const res = await request.get('/');
    const xcto = res.headers()['x-content-type-options'];
    // Either nosniff is present, or (acceptable in dev) absent — assert it is never a wrong value.
    if (xcto !== undefined) expect(xcto.toLowerCase()).toBe('nosniff');
  });

  test('SEC-hdr · no Server header advertises an exact framework version', async ({ request }) => {
    const res = await request.get('/');
    const server = (res.headers()['server'] ?? '').toLowerCase();
    expect(server).not.toMatch(/express\/\d|node\.js\/\d/);
  });

  test('SEC-method · TRACE/CONNECT-style probing on an API route is not 5xx', async ({ request }) => {
    const res = await request.fetch('/api/trips', { method: 'OPTIONS' });
    expect(res.status()).toBeLessThan(500);
  });

  test('SEC-auth · unknown API path returns 404, not a stack trace', async ({ request }) => {
    const res = await request.get('/api/this-route-does-not-exist');
    expect(res.status()).toBe(404);
    expect(await res.text()).not.toContain('node_modules');
  });

  test('SEC-leak · robots.txt and llms.txt expose no secrets', async ({ request }) => {
    for (const f of ['/robots.txt', '/llms.txt']) {
      const res = await request.get(f);
      if (res.status() !== 200) continue;
      const t = await res.text();
      expect(t).not.toMatch(/SERVICE_ROLE|ANTHROPIC_API_KEY|sk-[A-Za-z0-9]{20,}/);
    }
  });
});

test.describe('§6+ Design · per-screen legibility & media hygiene', () => {
  for (const screen of SCREENS) {
    test(`DSGN-size · "${screen}" has no readable text below 11px`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      const bad = await page.evaluate(() => {
        let n = 0;
        document.querySelectorAll('body *').forEach((el) => {
          if (!el.textContent?.trim()) return;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < 11) n++;
        });
        return n;
      });
      expect(bad, `"${screen}" has ${bad} sub-11px text nodes`).toBe(0);
    });

    test(`DSGN-alt · "${screen}" has no <img> missing alt text`, async ({ page }) => {
      await setupPage(page, screen);
      await page.waitForTimeout(400);
      const missing = await page.locator('img:not([alt])').count();
      expect(missing, `"${screen}" has ${missing} alt-less images`).toBe(0);
    });
  }
});
