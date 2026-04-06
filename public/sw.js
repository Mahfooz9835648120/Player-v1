/**
 * Streamer Pro — Service Worker
 * Provides offline support and asset caching.
 */
const CACHE_NAME   = 'streamer-pro-v1';
const STATIC_CACHE = 'streamer-pro-static-v1';

// Assets to pre-cache on install
const PRE_CACHE = [
  '/',
  '/style.css',
  '/app.js',
  '/manifest.json',
];

// ——— Install ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRE_CACHE).catch(() => {
        // If any pre-cache fails (dev mode), continue anyway
      });
    })
  );
  self.skipWaiting();
});

// ——— Activate — Clean old caches ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ——— Fetch — Network first for API, cache first for static ———
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't intercept WebSocket upgrades
  if (event.request.headers.get('upgrade') === 'websocket') return;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls: network first, no cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // External media (CDN video/audio): pass through, no caching (too large)
  if (!url.hostname.includes(self.location.hostname) && (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.m3u8'))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Static assets: cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses for static assets
        if (response.ok && (url.pathname.match(/\.(css|js|png|svg|ico|json|woff2?)$/))) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// ——— Background sync message handler ———
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
