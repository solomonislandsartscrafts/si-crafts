'use client';

import { useEffect, useState } from 'react';
import { validateAdminSession, validateStockistSession } from '@/lib/auth-client';

/**
 * The one rule for who sees wholesale pricing on the public site: logged-in
 * stockists and logged-in admins (any active admin role). Anonymous visitors
 * never do.
 */
export function canViewPricing({ isStockist, isAdmin }: { isStockist: boolean; isAdmin: boolean }): boolean {
  return isStockist || isAdmin;
}

export interface PricingAccess {
  isStockist: boolean;
  isAdmin: boolean;
  canViewPricing: boolean;
  /** True until the session checks settle. */
  loading: boolean;
}

/**
 * Validate a stored token. 'invalid' = the backend rejected it; 'error' = the
 * request itself failed (treated as not logged in, but the token is kept).
 */
async function check(validation: Promise<unknown>): Promise<'valid' | 'invalid' | 'error'> {
  try {
    return (await validation) ? 'valid' : 'invalid';
  } catch {
    return 'error';
  }
}

/**
 * Client-side pricing gate for public pages. Validates the stored stockist and
 * admin sessions with the backend (rather than trusting the localStorage key,
 * so an expired token stops showing prices).
 *
 * Order controls (Add to Order, cart) stay keyed on `isStockist` — the cart
 * checkout is stockist-only, so admins get price visibility only.
 *
 * An invalid stockist token is cleared, as before. An invalid admin token is
 * left alone: the admin area owns that session, and a failed check on a public
 * page should not log the admin out of /admin.
 */
export function usePricingAccess(): PricingAccess {
  const [state, setState] = useState({ isStockist: false, isAdmin: false, loading: true });

  useEffect(() => {
    let cancelled = false;

    function run() {
      const stockistToken = localStorage.getItem('stockist_session');
      const adminToken = localStorage.getItem('admin_session');

      if (!stockistToken && !adminToken) {
        setState({ isStockist: false, isAdmin: false, loading: false });
        return;
      }

      Promise.all([
        stockistToken ? check(validateStockistSession(stockistToken)) : Promise.resolve(null),
        adminToken ? check(validateAdminSession(adminToken)) : Promise.resolve(null),
      ]).then(([stockist, admin]) => {
        if (cancelled) return;
        if (stockist === 'invalid') localStorage.removeItem('stockist_session');
        setState({ isStockist: stockist === 'valid', isAdmin: admin === 'valid', loading: false });
      });
    }

    run();

    // Re-check when the session changes. A login/logout in another tab writes
    // the session keys in localStorage, which fires `storage` there; without
    // this the gate would keep showing (or hiding) prices until a reload.
    function onStorage(event: StorageEvent) {
      if (event.key === 'stockist_session' || event.key === 'admin_session') {
        run();
      }
    }
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return { ...state, canViewPricing: canViewPricing(state) };
}
