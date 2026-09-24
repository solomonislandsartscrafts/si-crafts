'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Stockist } from '@/types';
import { validateStockistSession } from '@/lib/auth-client';

export interface RequireStockistResult {
  /** The validated stockist, or null while still checking / when redirecting. */
  stockist: Stockist | null;
  /** True until the auth check settles. Render a loading state while true. */
  loading: boolean;
}

/**
 * Gate a stockist-only page. Reads the stored session, validates it, and on
 * failure sends the visitor to the stockist login — remembering where they were
 * headed so login can return them there.
 *
 * This replaces the copy of this logic that each stockist page carried inline.
 * The important behaviour it adds over those copies is the `?next=` return
 * path: a logged-out visitor who follows a link to a stockist page (e.g. an
 * order-history link in an email) now lands back on that page after logging in,
 * instead of being dropped on the catalogue. A visitor with a valid session
 * never sees the login at all.
 *
 * `next` is the current path + query, URL-encoded. The login form only honours
 * it when it points inside `/stockist/` (see resolveDestination in
 * login-form.tsx), so it can't be turned into an open redirect.
 *
 * Usage:
 *   const { stockist, loading } = useRequireStockist();
 *   if (loading) return <Skeleton />;
 *   if (!stockist) return null; // redirecting
 */
export function useRequireStockist(): RequireStockistResult {
  const router = useRouter();
  const [stockist, setStockist] = useState<Stockist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function redirectToLogin() {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/stockist/login?next=${encodeURIComponent(next)}`);
    }

    async function checkAuth() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { redirectToLogin(); return; }

      const result = await validateStockistSession(token);
      if (cancelled) return;

      if (!result) {
        localStorage.removeItem('stockist_session');
        redirectToLogin();
        return;
      }

      setStockist(result);
      setLoading(false);
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  return { stockist, loading };
}
