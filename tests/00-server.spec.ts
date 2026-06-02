/**
 * Server / API health checks.
 *
 * Uses Playwright's `request` fixture (pure HTTP, no browser).
 * Auth-protected routes: we assert the response is NOT 200 (either 401 or 500
 * depending on whether Supabase keys are available in the running dev server).
 */
import { test, expect } from '@playwright/test';

// ── Public routes ─────────────────────────────────────────────────────────────

test.describe('API — public routes', () => {
  test('GET /api/exchange-rates?base=USD → 200', async ({ request }) => {
    const res = await request.get('/api/exchange-rates?base=USD');
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('EUR');
    expect(json).toHaveProperty('ILS');
  });

  test('GET /api/exchange-rates with unsupported base → 400', async ({ request }) => {
    const res = await request.get('/api/exchange-rates?base=XYZ');
    expect(res.status()).toBe(400);
  });

  test('GET /api/invite/[bad-token] with malformed token → 400 or 404', async ({ request }) => {
    // Token must be 64 hex chars; "not-a-valid-token" fails the regex check → 400
    // (404 is acceptable if Next.js router intercepts before the handler)
    const res = await request.get('/api/invite/not-a-valid-token');
    expect([400, 404]).toContain(res.status());
  });

  test('GET /auth/callback without code → redirects (3xx)', async ({ request }) => {
    const res = await request.get('/auth/callback', { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
  });
});

// ── Auth-protected routes (no session → not 200) ──────────────────────────────

test.describe('API — auth-protected routes reject unauthenticated requests', () => {
  test('GET /api/trips → not 200', async ({ request }) => {
    const res = await request.get('/api/trips');
    expect(res.status()).not.toBe(200);
  });

  test('GET /api/invitations → not 200', async ({ request }) => {
    const res = await request.get('/api/invitations');
    expect(res.status()).not.toBe(200);
  });

  test('GET /api/places?input=Paris → not 200', async ({ request }) => {
    const res = await request.get('/api/places?input=Paris');
    expect(res.status()).not.toBe(200);
  });

  test('GET /api/route-time → not 200', async ({ request }) => {
    const res = await request.get('/api/route-time?olat=40&olng=-74&dlat=41&dlng=-73');
    expect(res.status()).not.toBe(200);
  });

  test('GET /api/timezone → not 200', async ({ request }) => {
    const res = await request.get('/api/timezone?lat=40.7&lng=-74');
    expect(res.status()).not.toBe(200);
  });

  test('POST /api/ai/suggestions → not 200', async ({ request }) => {
    const res = await request.post('/api/ai/suggestions', {
      data: { region: 'Paris', day: 1, existingEvents: [] },
    });
    expect(res.status()).not.toBe(200);
  });
});

// ── Page routes ───────────────────────────────────────────────────────────────

test.describe('Page routes', () => {
  test('GET / → 200', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
  });

  test('GET /join/[token] page exists → 200 or redirect', async ({ request }) => {
    // The route is /join/[token] — visiting with a dummy token hits the page
    const res = await request.get('/join/abc123');
    expect([200, 301, 302, 307, 308]).toContain(res.status());
  });
});
