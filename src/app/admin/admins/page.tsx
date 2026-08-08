'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Edit, X } from 'lucide-react';
import type { AdminUser, AdminRole } from '@/types';
import { AdminLayout } from '@/components/admin';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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
        <h1 className="font-heading text-2xl font-medium text-deep-blue">
          Admin Users
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 btn-primary text-sm"
        >
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
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{admin.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">{admin.email}</td>
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

      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadAdmins(); }}
        />
      )}
    </AdminLayout>
  );
}

function AddAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create admin.');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-blue/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-md w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-admin-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2 id="add-admin-title" className="font-heading text-xl font-medium text-deep-blue">
            Add Admin User
          </h2>
          <button
            onClick={onClose}
            className="tap-target p-2 text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-name" className="block text-sm font-medium text-warm-gray-800 mb-1">Full Name *</label>
            <input
              id="admin-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-warm-gray-800 mb-1">Email *</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-warm-gray-800 mb-1">Password *</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="admin-role" className="block text-sm font-medium text-warm-gray-800 mb-1">Role *</label>
            <select
              id="admin-role"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            >
              <option value="editor">Editor</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-xs text-warm-gray-400 mt-1">
              Editors can manage content. Super Admins can also manage other admin users.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="tap-target px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="tap-target px-6 py-3 btn-primary"
            >
              {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
