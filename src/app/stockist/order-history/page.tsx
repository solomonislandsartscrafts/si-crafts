'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import type { OrderRequest } from '@/types';
import { useRequireStockist } from '@/lib/use-require-stockist';
import { getOrdersByStockist } from '@/services/orders';
import { PageHeader } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonText } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatPrice } from '@/lib/price';
import { formatShortDate } from '@/lib/format-date';

/** Order status → badge variant. Anything we don't recognise stays neutral. */
function statusVariant(status: OrderRequest['status']) {
  switch (status) {
    case 'Submitted':
      return 'info' as const;
    case 'Confirmed':
      return 'success' as const;
    case 'Shipped':
      return 'info' as const;
    default:
      return 'neutral' as const;
  }
}

export default function OrderHistoryPage() {
  const { stockist, loading: authLoading } = useRequireStockist();
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!stockist) return;
    let cancelled = false;
    async function load() {
      const result = await getOrdersByStockist(stockist!.id);
      if (cancelled) return;
      setOrders(result);
      setOrdersLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [stockist]);

  // Still checking the session, redirecting, or loading orders.
  const loading = authLoading || !stockist || ordersLoading;

  if (loading) {
    return (
      <div className="site-container page-y">
        <SkeletonText lines={4} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Order History"
        eyebrow={
          <Link href="/stockist/catalogue" className="inline-flex items-center gap-3xs text-sm text-ocean hover:text-ocean-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to catalogue
          </Link>
        }
      />

      <div className="site-container pb-section">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet."
            action={
              <ButtonLink href="/stockist/catalogue" variant="secondary" size="sm">
                Browse the catalogue
              </ButtonLink>
            }
          />
        ) : (
          <div className="space-y-sm">
            {orders.map((order) => (
              <div key={order.id} className="border border-sand rounded-lg p-sm sm:p-md">
                <div className="flex items-start justify-between gap-sm mb-xs">
                  <div>
                    <p className="font-medium text-deep-blue">{order.referenceNumber}</p>
                    <p className="text-xs text-warm-gray-400">
                      {formatShortDate(order.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge status={statusVariant(order.status)}>{order.status}</StatusBadge>
                </div>
                <div className="text-sm text-warm-gray-600">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {formatPrice(order.totalAud)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
