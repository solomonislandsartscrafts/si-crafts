'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import type { OrderRequest } from '@/types';
import { validateStockistSession } from '@/lib/auth-client';
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
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { router.push('/stockist/login'); return; }
      const stockist = await validateStockistSession(token);
      if (!stockist) { localStorage.removeItem('stockist_session'); router.push('/stockist/login'); return; }

      const result = await getOrdersByStockist(stockist.id);
      setOrders(result);
      setLoading(false);
    }
    load();
  }, [router]);

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
          <Link href="/stockist/catalogue" className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to catalogue
          </Link>
        }
      />

      <div className="site-container pb-16">
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
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-sand rounded-lg p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
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
