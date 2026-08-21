'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, X } from 'lucide-react';
import type { AdminUser, AdminRole } from '@/types';
import { AdminLayout } from '@/components/admin';
import { Select } from '@/components/ui/select';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

/** Row-shaped placeholder while the admin table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading admin users"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-40 hidden sm:block" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { error: toastError } = useToast();

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

    // Check the status before parsing: a 5xx returns an HTML error page, and
    // res.json() on that threw an unhandled rejection instead of showing the
    // toast. A 4xx with a JSON body was worse — it parsed to a truthy object
    // and the list reloaded as though the deactivation had worked.
    if (!res.ok) {
      toastError('Cannot deactivate this account.');
      return;
    }

    const result = await res.json().catch(() => null);
    if (!result) {
      toastError('Cannot deactivate this account.');
      return;
    }
    loadAdmins();
  }

  return (
    <AdminLayout requiredRole="super_admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className={pageTitleClasses}>
          Admin Users
        </h1>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Admin
        </Button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : admins.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No admin users yet."
          action={
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add Admin
            </Button>
          }
        />
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
                    <StatusBadge status={admin.isActive ? 'success' : 'neutral'}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
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
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-3" role="alert">
              {error}
            </div>
          )}

          <FormField label="Full Name *" htmlFor="admin-name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Email *" htmlFor="admin-email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Password *" htmlFor="admin-password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className={inputClasses}
            />
          </FormField>

          <div>
            <label htmlFor="admin-role" className="block text-base font-medium text-warm-gray-800 mb-1">Role *</label>
            <Select
              id="admin-role"
              value={role}
              onChange={(val) => setRole((val || 'editor') as AdminRole)}
              options={[
                { value: 'editor', label: 'Editor' },
                { value: 'super_admin', label: 'Super Admin' },
              ]}
              placeholder="Select role"
              label="Admin role"
              className="w-full"
            />
            <p className="text-xs text-warm-gray-400 mt-1">
              Editors can manage content. Super Admins can also manage other admin users.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Creating...">
              Create Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
