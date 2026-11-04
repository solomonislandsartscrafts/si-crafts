'use client';

import { useEffect, useState } from 'react';
import { getAdminToken, getStockistToken } from '@/lib/api-client';
import { getProductPrices } from '@/services/products';

/**
 * Wholesale prices for the current visitor, keyed by product id.
 *
 * Prices are never in the public page data — they are fetched here, in the
 * browser, only once `enabled` (pass `canViewPricing` from usePricingAccess).
 * Returns {} while loading, when disabled, and on any error, so callers treat
 * a missing entry as "no price to show".
 */
export function useWholesalePrices(enabled: boolean): Record<string, number> {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!enabled) {
      setPrices({});
      return;
    }
    let cancelled = false;
    getProductPrices(getStockistToken() || getAdminToken())
      .then((result) => {
        if (!cancelled) setPrices(result);
      })
      .catch(() => {
        if (!cancelled) setPrices({});
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return prices;
}
