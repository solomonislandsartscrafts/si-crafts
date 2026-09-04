'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA offline support, and — just as
 * importantly — makes sure a device never gets stranded on an OLD worker.
 *
 * A stale service worker is the classic cause of "works on desktop, dead on my
 * phone": the phone keeps serving a cached bundle that either predates a fix or
 * fails to hydrate, so every button (the mobile menu included) goes dead. Three
 * things here guard against that:
 *
 *  1. `updateViaCache: 'none'` — the browser always revalidates sw.js against
 *     the network instead of trusting its HTTP cache, so a new worker is picked
 *     up on the next visit rather than days later.
 *  2. An explicit `registration.update()` on load, to trigger that check even
 *     for an already-registered worker.
 *  3. A `controllerchange` listener that reloads the page once a new worker
 *     takes control, so the user immediately runs the fresh assets.
 */
export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let reloading = false;
    // When the active worker changes (a new version called skipWaiting +
    // clients.claim), reload once so the page runs against the new worker's
    // assets rather than a half-old/half-new mix.
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // Force an immediate update check so an already-installed worker
        // doesn't linger.
        registration.update().catch(() => {});
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return null;
}
