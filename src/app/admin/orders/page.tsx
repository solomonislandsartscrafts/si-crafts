'use client';

import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import type { OrderRequest } from '@/types';
import { AdminLayout } from '@/components/admin';
import { Select } from '@/components/ui/select';
import { pageTitleClasses } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/price';

/** Which badge colour each order status maps to. */
const STATUS_BADGE: Record<string, 'success' | 'info' | 'neutral'> = {
  Submitted: 'info',
  Confirmed: 'success',
  Shipped: 'success',
};

/** Row-shaped placeholder while the orders table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading orders"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28 hidden sm:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    const { getAllOrders } = await import('@/services/orders');
    setOrders(await getAllOrders());
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    const { updateOrderStatus } = await import('@/services/orders');
    await updateOrderStatus(id, status as 'Submitted' | 'Confirmed' | 'Shipped');
    loadOrders();
  }

  return (
    <AdminLayout>
      <h1 className={`${pageTitleClasses} mb-6`}>Orders</h1>
      {loading ? <TableSkeleton /> : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet."
          description="Wholesale order requests from stockists will appear here."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{order.referenceNumber}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">
                    {new Date(order.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-warm-gray-800">{formatPrice(order.totalAud)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={STATUS_BADGE[order.status] ?? 'neutral'}>{order.status}</StatusBadge>
                    {order.notes && (
                      <p className="text-xs text-warm-gray-400 mt-1 max-w-xs whitespace-pre-line">{order.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Select
                      value={order.status}
                      onChange={(val) => handleStatusChange(order.id, val || 'Submitted')}
                      options={[
                        { value: 'Submitted', label: 'Submitted' },
                        { value: 'Confirmed', label: 'Confirmed' },
                        { value: 'Shipped', label: 'Shipped' },
                      ]}
                      placeholder="Status"
                      label={`Order ${order.id} status`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
