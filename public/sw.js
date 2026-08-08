/**
 * Service Worker — SI Crafts PWA
 *
 * Provides an offline shell: caches the navigation layout and serves a
 * "you are offline" fallback page when the network is unavailable.
 */

const CACHE_NAME = 'si-crafts-v1';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache for the offline shell
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
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
  // Only handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For other requests, try network first then cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
