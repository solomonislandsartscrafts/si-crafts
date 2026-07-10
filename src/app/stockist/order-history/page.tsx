'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import type { OrderRequest } from '@/types';
import { validateStockistSession } from '@/services/auth';
import { getOrdersByStockist } from '@/services/orders';

const STATUS_STYLES: Record<string, string> = {
  Submitted: 'bg-ocean/10 text-ocean',
  Confirmed: 'bg-success/10 text-success',
  Shipped: 'bg-terracotta/10 text-terracotta',
};

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
    return <div className="max-w-3xl mx-auto px-4 py-section-lg"><p className="text-warm-gray-400">Loading...</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-section-lg">
      <Link href="/stockist/catalogue" className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to catalogue
      </Link>

      <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-warm-gray-400 mx-auto mb-4" />
          <p className="text-warm-gray-600">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-sand rounded-lg p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-medium text-deep-blue">{order.referenceNumber}</p>
                  <p className="text-xs text-warm-gray-400">
                    {new Date(order.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status] || ''}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-warm-gray-600">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · A${order.totalAud.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
