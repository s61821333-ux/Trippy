// Trippy service worker.
//
// Deliberately minimal: it ONLY caches immutable hashed build assets
// (/_next/static/*). Everything else — HTML navigations, /api/* calls, auth —
// goes straight to the network with no SW interception.
//
// Why: a previous version cached navigations and /api/trips responses. That
// served stale app code after deploys AND masked expired sessions (the cached
// trips list rendered fine, but opening a trip hit the network, got 401, and
// failed — leaving the user stuck on the home screen). Caching only fingerprinted
// assets keeps the repeat-load speed win without ever serving stale app/data.

const CACHE_NAME = 'trippy-v5';

self.addEventListener('install', () => {
  // Activate this version immediately instead of waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Only immutable, content-hashed build assets are safe to cache. Let the
  // browser handle navigations and APIs over the network so they are never stale.
  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheForever(request));
  }
  // All other requests: no respondWith → default browser network fetch (with cookies).
});

async function cacheForever(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}
