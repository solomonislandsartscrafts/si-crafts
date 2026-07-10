'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Maker } from '@/types';
import { AdminLayout } from '@/components/admin';

export default function AdminMakersPage() {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMakers(); }, []);

  async function loadMakers() {
    const { getAllMakers } = await import('@/services/makers');
    const data = await getAllMakers();
    setMakers(data);
    setLoading(false);
  }

  async function toggleConsent(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'Signed' ? 'Not Signed' : 'Signed';
    const { setConsentStatus } = await import('@/services/makers');
    await setConsentStatus(id, newStatus as 'Signed' | 'Not Signed');
    loadMakers();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    const { deleteMaker } = await import('@/services/makers');
    await deleteMaker(id);
    loadMakers();
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-deep-blue">Makers</h1>
        <button className="tap-target inline-flex items-center gap-2 px-4 py-2 bg-ocean hover:bg-ocean-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light">
          <Plus className="w-4 h-4" /> Add Maker
        </button>
      </div>

      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Village</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Consent</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Published</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {makers.map((maker) => (
                <tr key={maker.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{maker.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">{maker.village}, {maker.province}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleConsent(maker.id, maker.consentStatus)}
                      className={`px-2 py-1 rounded text-xs font-medium ${maker.consentStatus === 'Signed' ? 'bg-success/10 text-success' : 'bg-warm-gray-200 text-warm-gray-600'}`}>
                      {maker.consentStatus}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {maker.publishedFlag ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-warm-gray-400" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors" aria-label={`Edit ${maker.name}`}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(maker.id, maker.name)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors" aria-label={`Delete ${maker.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
