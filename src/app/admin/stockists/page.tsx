'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Stockist } from '@/types';
import { AdminLayout } from '@/components/admin';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  rejected: 'bg-error/10 text-error',
};

export default function AdminStockistsPage() {
  const [stockists, setStockists] = useState<Stockist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStockists(); }, []);

  async function loadStockists() {
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load stockists');
      const data = await res.json();
      if (Array.isArray(data)) setStockists(data);
    } catch (err) {
      console.error('[stockists] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      if (!res.ok) { alert('Failed to approve stockist.'); return; }
      loadStockists();
    } catch {
      alert('Failed to approve stockist.');
    }
  }

  async function handleReject(id: string) {
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'reject' }),
      });
      if (!res.ok) { alert('Failed to reject stockist.'); return; }
      loadStockists();
    } catch {
      alert('Failed to reject stockist.');
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold text-deep-blue mb-6">Stockists</h1>
      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Business</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {stockists.map((s) => (
                <tr key={s.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-warm-gray-800">{s.businessName}</p>
                    <p className="text-xs text-warm-gray-400">ABN: {s.abn}</p>
                  </td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">
                    <p>{s.contactName}</p>
                    <p className="text-xs text-warm-gray-400">{s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${STATUS_STYLES[s.status] || ''}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(s.id)} className="tap-target p-2 text-success hover:text-success/80" aria-label={`Approve ${s.businessName}`}><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(s.id)} className="tap-target p-2 text-error hover:text-error/80" aria-label={`Reject ${s.businessName}`}><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
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
