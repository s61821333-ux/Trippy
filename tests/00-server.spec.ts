/**
 * Server / API health checks.
 *
 * Uses Playwright's `request` fixture (pure HTTP, no browser).
 * Each test asserts the *expected* status for its auth posture:
 *   - Public routes  → 200 (or 400 for bad input)
 *   - Auth-protected → 401 when called without a session cookie
 *
 * These tests never start the browser; they run once (no multi-device repeat).
 */
import { test, expect } from '@playwright/test';

// ── Public routes ─────────────────────────────────────────────────────────────

test.describe('API — public routes', () => {
  test('GET /api/exchange-rates?base=USD → 200', async ({ request }) => {
    const res = await request.get('/api/exchange-rates?base=USD');
    expect(res.status()).toBe(200);
    const json = await res.json();
    // Shape check: should have at least EUR and ILS
    expect(json).toHaveProperty('EUR');
    expect(json).toHaveProperty('ILS');
  });

  test('GET /api/exchange-rates with unsupported base → 400', async ({ request }) => {
    const res = await request.get('/api/exchange-rates?base=XYZ');
    expect(res.status()).toBe(400);
  });

  test('GET /api/invite/[bad-token] with malformed token → 400', async ({ request }) => {
    // Token must be 64 hex chars; sending a short one should 400 immediately
    const res = await request.get('/api/invite/not-a-valid-token');
    expect(res.status()).toBe(400);
  });

  test('GET /auth/callback without code → redirects (3xx)', async ({ request }) => {
    const res = await request.get('/auth/callback', { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
  });
});

// ── Auth-protected routes (no session → 401) ──────────────────────────────────

test.describe('API — auth-protected routes return 401 without session', () => {
  test('GET /api/trips → 401', async ({ request }) => {
    const res = await request.get('/api/trips');
    expect(res.status()).toBe(401);
  });

  test('GET /api/invitations → 401', async ({ request }) => {
    const res = await request.get('/api/invitations');
    expect(res.status()).toBe(401);
  });

  test('GET /api/places?input=Paris → 401', async ({ request }) => {
    const res = await request.get('/api/places?input=Paris');
    expect(res.status()).toBe(401);
  });

  test('GET /api/route-time → 401', async ({ request }) => {
    const res = await request.get('/api/route-time?olat=40&olng=-74&dlat=41&dlng=-73');
    expect(res.status()).toBe(401);
  });

  test('GET /api/timezone → 401', async ({ request }) => {
    const res = await request.get('/api/timezone?lat=40.7&lng=-74');
    expect(res.status()).toBe(401);
  });

  test('POST /api/ai/suggestions → 401', async ({ request }) => {
    const res = await request.post('/api/ai/suggestions', {
      data: { region: 'Paris', day: 1, existingEvents: [] },
    });
    expect(res.status()).toBe(401);
  });
});

// ── Page routes ───────────────────────────────────────────────────────────────

test.describe('Page routes', () => {
  test('GET / → 200', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
  });

  test('GET /join → 200 (join page exists)', async ({ request }) => {
    const res = await request.get('/join');
    // May redirect to / if unauthenticated — both are acceptable
    expect([200, 301, 302, 307, 308]).toContain(res.status());
  });
});
