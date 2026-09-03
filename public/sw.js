/**
 * Service Worker — SI Crafts PWA
 *
 * Provides an offline shell: caches a "you are offline" fallback page and
 * serves it when a NAVIGATION fails with no network. It deliberately does as
 * little as possible otherwise.
 *
 * Why so conservative: an over-eager service worker is the classic cause of
 * "the site works on my desktop but is dead on my phone". If the worker
 * intercepts the app's JavaScript and returns a stale or empty response, the
 * page never hydrates and every button — including the mobile menu — stops
 * responding, with no visible error. So this worker NEVER touches Next's build
 * output (`/_next/...`): those files are content-hashed, the browser and the
 * Cloudflare edge already cache them correctly, and the worker has no business
 * in that path.
 */

// Bump this string on every meaningful worker change. A new name makes the
// `activate` handler below delete every previous cache, which is what forces a
// phone that cached the old buggy worker to drop it. This is v3 specifically to
// evict the v2 cache that was intercepting asset requests.
const CACHE_NAME = 'si-crafts-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [OFFLINE_URL, '/manifest.json'];

// Install: pre-cache the offline shell, then activate immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete every cache that isn't the current version, then take
// control of open pages right away. Deleting old caches is what recovers a
// device stuck on a previous worker.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET is cacheable; let everything else (POST/PUT/PATCH/DELETE) go
  // straight to the network untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // NEVER intercept:
  //  - cross-origin requests (API calls to Render, fonts, R2 images)
  //  - Next.js build assets (`/_next/...`) — hashed JS/CSS the app needs to
  //    hydrate. Touching these is what breaks the page on mobile.
  //  - explicit API routes
  // Returning without calling respondWith hands the request back to the
  // browser's own network + HTTP cache, which is exactly what we want.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_next/')) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navigations (page loads): network-first, fall back to the cached offline
  // page only if the network genuinely fails. Never return undefined — if the
  // offline page somehow isn't cached, re-throw so the browser shows its own
  // error rather than a blank respondWith.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        if (cached) return cached;
        return Response.error();
      })
    );
    return;
  }

  // Any other same-origin GET (e.g. /manifest.json, icons): try the network,
  // fall back to cache, and if neither has it return a proper error Response
  // instead of undefined (which would abort the request).
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached || Response.error();
    })
  );
});
