'use client';

import { useState, useEffect } from 'react';
import type { OrderRequest } from '@/types';
import { AdminLayout } from '@/components/admin';
import { Select } from '@/components/ui/select';

const STATUS_STYLES: Record<string, string> = {
  Submitted: 'bg-ocean/10 text-ocean',
  Confirmed: 'bg-success/10 text-success',
  Shipped: 'bg-terracotta/10 text-terracotta',
};

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
      <h1 className="font-heading text-2xl font-medium text-deep-blue mb-6">Orders</h1>
      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
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
                  <td className="px-4 py-3 text-warm-gray-800">A${order.totalAud.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[order.status] || ''}`}>{order.status}</span>
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
