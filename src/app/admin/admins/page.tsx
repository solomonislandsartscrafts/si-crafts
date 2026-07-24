'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Edit } from 'lucide-react';
import type { AdminUser } from '@/types';
import { AdminLayout } from '@/components/admin';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/admins', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load admins');
      const data = await res.json();
      if (Array.isArray(data)) setAdmins(data);
    } catch (err) {
      console.error('[admins] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(id: string, name: string) {
    const msg = `Deactivate "${name}"? They will lose admin access.`;
    if (!confirm(msg)) return;
    const token = localStorage.getItem('admin_session');
    if (!token) return;

    const res = await fetch('/api/admins/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token }),
    });
    const result = await res.json();
    if (!result) {
      alert('Cannot deactivate this account.');
      return;
    }
    loadAdmins();
  }

  return (
    <AdminLayout requiredRole="super_admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-deep-blue">
          Admin Users
        </h1>
        <button className="tap-target inline-flex items-center gap-2 px-4 py-2 bg-ocean hover:bg-ocean-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light">
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {loading ? (
        <p className="text-warm-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-medium text-warm-gray-800">
                    {admin.name}
                  </td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Editor'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${admin.isActive ? 'bg-success/10 text-success' : 'bg-warm-gray-200 text-warm-gray-600'}`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean" aria-label={`Edit ${admin.name}`}>
                        <Edit className="w-4 h-4" />
                      </button>
                      {admin.isActive && (
                        <button
                          onClick={() => handleDeactivate(admin.id, admin.name)}
                          className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                          aria-label={`Deactivate ${admin.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
