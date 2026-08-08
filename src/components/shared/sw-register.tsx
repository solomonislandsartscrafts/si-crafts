'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for PWA offline support.
 * Renders nothing — just performs registration on mount.
 */
export function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('[SW] Registration failed:', err));
    }
  }, []);

  return null;
}
