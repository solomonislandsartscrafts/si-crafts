/**
 * Service Worker — SI Crafts PWA
 *
 * Provides an offline shell: caches the navigation layout and serves a
 * "you are offline" fallback page when the network is unavailable.
 */

const CACHE_NAME = 'si-crafts-v2';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache for the offline shell
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.json',
];

// Install: pre-cache the offline shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from network first, fall back to offline page for navigation requests
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests (POST/PUT/PATCH/DELETE) — API calls like
  // login, uploads, and form submissions must always go straight to the
  // network. The Cache API only supports GET, so attempting to fall back to
  // cache for other methods returns undefined and breaks the request.
  if (request.method !== 'GET') {
    return;
  }

  // Only handle navigation requests (page loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Never intercept API calls — always hit the network directly so errors
  // surface normally instead of being masked by a cache-fallback attempt.
  if (request.url.includes('/api/')) {
    return;
  }

  // For other GET requests, try network first then cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
