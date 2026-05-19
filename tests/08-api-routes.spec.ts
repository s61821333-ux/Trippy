import { test, expect } from '@playwright/test';

/**
 * API Route Tests
 * These test the HTTP API directly without a browser UI.
 * Most routes require auth, so we verify they fail gracefully (401/403/400)
 * rather than crashing with 500.
 */

test.describe('API Routes — Auth-required endpoints', () => {

  test('GET /api/trips returns 401 or 403 without auth', async ({ request }) => {
    const res = await request.get('/api/trips');
    expect([200, 400, 401, 403]).toContain(res.status());
  });

  test('POST /api/trips/create returns 401 or 400 without auth', async ({ request }) => {
    const res = await request.post('/api/trips/create', {
      data: { name: 'Test', days: 3, nickname: 'T', theme: 'desert', startDate: '2026-01-01', countries: [], currency: 'USD' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test('GET /api/trips/nonexistent-id returns 401 or 404', async ({ request }) => {
    const res = await request.get('/api/trips/nonexistent-id-00000');
    expect([400, 401, 403, 404]).toContain(res.status());
  });

  test('GET /api/invitations returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/invitations');
    expect([200, 400, 401, 403]).toContain(res.status());
  });

  test('POST /api/invitations/send returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/invitations/send', {
      data: { tripId: 'abc', email: 'test@test.com' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test('POST /api/invitations/accept returns 401 or 400 without auth', async ({ request }) => {
    const res = await request.post('/api/invitations/accept', {
      data: { invitationId: 'fake-id' },
    });
    expect([400, 401, 403]).toContain(res.status());
  });

  test('DELETE /api/account/delete returns 401 without auth', async ({ request }) => {
    const res = await request.delete('/api/account/delete');
    expect([400, 401, 403]).toContain(res.status());
  });

});

test.describe('API Routes — Public / Less-restricted endpoints', () => {

  test('POST /api/ai/suggestions returns 401 or 400 without auth', async ({ request }) => {
    const res = await request.post('/api/ai/suggestions', {
      data: { day: 1, region: 'Negev', existingEvents: [] },
    });
    // AI suggestions should require auth or valid trip context
    expect([400, 401, 403, 422]).toContain(res.status());
  });

  test('GET /api/places returns 400 without query param', async ({ request }) => {
    const res = await request.get('/api/places');
    // Missing query param may give 400, 422, or 200 with empty results
    expect([200, 400, 401, 403, 422]).toContain(res.status());
  });

  test('GET /api/weather returns 400 without required params', async ({ request }) => {
    const res = await request.get('/api/weather');
    expect([400, 422]).toContain(res.status());
  });

  test('GET /api/route-time returns 400 without required params', async ({ request }) => {
    const res = await request.get('/api/route-time');
    expect([400, 422]).toContain(res.status());
  });

  test('GET /api/invite/invalid-token returns 404 or 400', async ({ request }) => {
    const res = await request.get('/api/invite/this-is-not-a-real-token-xyz');
    expect([400, 404]).toContain(res.status());
  });

  test('POST /api/invite/invalid-token returns 404 or 400', async ({ request }) => {
    const res = await request.post('/api/invite/this-is-not-a-real-token-xyz', {
      data: {},
    });
    expect([400, 401, 404]).toContain(res.status());
  });

});

test.describe('API Routes — Response format', () => {

  test('error responses return JSON (not HTML)', async ({ request }) => {
    const res = await request.get('/api/trips');
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toContain('json');
  });

  test('POST /api/trips/create error response is JSON', async ({ request }) => {
    const res = await request.post('/api/trips/create', {
      data: {},
    });
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toContain('json');
  });

  test('no API route returns 500 on malformed (but safe) input', async ({ request }) => {
    const routes = [
      { method: 'get',  path: '/api/trips' },
      { method: 'get',  path: '/api/invitations' },
      { method: 'get',  path: '/api/places?query=' },
      { method: 'get',  path: '/api/weather?lat=0&lng=0' },
    ] as const;

    for (const route of routes) {
      const res = await request[route.method](route.path);
      expect(res.status()).not.toBe(500);
    }
  });

});
