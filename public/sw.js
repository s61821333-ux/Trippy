const CACHE_NAME = 'trippy-v3';

// Cache app shell assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/', '/manifest.json']).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache AI suggestions — always needs network
  if (url.pathname === '/api/ai/suggestions') return;

  // Hashed build assets are immutable — serve straight from cache, no network wait.
  // This makes repeat loads near-instant.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheForever(event.request));
    return;
  }

  // StaleWhileRevalidate for weather (TTL 1h via Cache-Control)
  if (url.pathname === '/api/weather') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // CacheFirst for route-time (TTL 7 days) and exchange-rates (TTL 1h)
  if (url.pathname === '/api/route-time' || url.pathname === '/api/exchange-rates') {
    event.respondWith(cacheFirst(event.request, 7 * 24 * 60 * 60 * 1000));
    return;
  }

  // Network-first for trips — always fetch fresh data; fall back to cache only when offline
  if (url.pathname.startsWith('/api/trips')) {
    event.respondWith(networkWithCacheFallback(event.request));
    return;
  }

  // For all other same-origin requests: network with cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(networkWithCacheFallback(event.request));
  }
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

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached ?? await networkFetch ?? new Response('Offline', { status: 503 });
}

async function cacheFirst(request, maxAgeMs) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    const dateHeader = cached.headers.get('date');
    const age = dateHeader ? Date.now() - new Date(dateHeader).getTime() : 0;
    if (age < maxAgeMs) return cached;
  }
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

async function networkWithCacheFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res.ok && request.method === 'GET') cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    return cached ?? new Response('Offline', { status: 503 });
  }
}
