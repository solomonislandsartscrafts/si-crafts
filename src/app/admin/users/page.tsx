'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Mail, Shield, Store, User as UserIcon } from 'lucide-react';
import { AdminLayout, UserFormModal } from '@/components/admin';
import { Select } from '@/components/ui/select';
import { ROLE_LABELS } from '@/types';
import type { AccountRole, AccountUser } from '@/types';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { inputClasses } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const ROLE_BADGE: Record<AccountRole, 'info' | 'success' | 'neutral'> = {
  super_admin: 'info',
  editor: 'info',
  stockist: 'success',
  user: 'neutral',
};

/** Row-shaped placeholder while the accounts table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading accounts"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-40 hidden md:block" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20 hidden sm:block" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

const ROLE_ICONS: Record<AccountRole, typeof Shield> = {
  super_admin: Shield,
  editor: Shield,
  stockist: Store,
  user: UserIcon,
};

const FILTER_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'super_admin', label: 'Super Admins' },
  { value: 'editor', label: 'Editors' },
  { value: 'stockist', label: 'Stockists' },
  { value: 'user', label: 'No role' },
];

/**
 * Accounts — one place to add, edit, re-role and remove every login.
 *
 * Super admins only. Includes promoting an existing sign-in to a stockist and
 * filling in their business details by hand, for shops that never applied
 * through the public form.
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notice, setNotice] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AccountUser | null>(null);
  const { error: toastError } = useToast();

  // Typing shouldn't fire a request per keystroke. The debounced value is what
  // actually goes to the server; `search` stays bound to the input so it
  // remains responsive.
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = useCallback(async () => {
    // Set this first, before awaiting anything: reloads after a delete or a
    // modal save used to swap the rows in with no loading state at all.
    setLoading(true);
    setLoadError('');
    try {
      const token = localStorage.getItem('admin_session');
      const query = new URLSearchParams();
      if (roleFilter) query.set('role', roleFilter);
      if (debouncedSearch) query.set('search', debouncedSearch);
      const suffix = query.toString() ? `?${query.toString()}` : '';

      const res = await fetch(`/api/users${suffix}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load accounts.');
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, debouncedSearch]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function handleDelete(user: AccountUser) {
    // Drop any earlier success notice first, so a failure doesn't leave a
    // stale green "Account deleted." sitting next to the error toast.
    setNotice('');
    const warning = user.stockist
      ? `Delete the login for ${user.email}? Their stockist record and order history are kept — remove those from Stockists if needed.`
      : `Delete the login for ${user.email}? This cannot be undone.`;
    if (!confirm(warning)) return;

    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete the account.');
      setNotice(data.message || 'Account deleted.');
      loadUsers();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to delete the account.');
    }
  }

  async function handleSendPasswordLink(user: AccountUser) {
    setNotice('');
    if (!confirm(`Email ${user.email} a link to set their password?`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/users/send-password-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send the email.');
      setNotice(data.message || 'Password setup email sent.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to send the email.');
    }
  }

  // Role and search are applied by the server (see loadUsers), so the rows that
  // arrive are already the ones to show. Filtering again here would only hide
  // results from the current page.
  const visible = users;
  const hasActiveFilters = !!(debouncedSearch || roleFilter);

  return (
    <AdminLayout requiredRole="super_admin">
      <div className="flex flex-wrap items-start justify-between gap-sm mb-2xs">
        <div>
          <h1 className={pageTitleClasses}>Accounts</h1>
          <p className="text-base text-warm-gray-600 mt-3xs">
            Every login on the site. Change someone&apos;s role to make them a stockist,
            editor or super admin.
          </p>
        </div>
        <Button size="sm" onClick={() => { setNotice(''); setShowAdd(true); }}>
          <Plus className="w-4 h-4" /> Add Account
        </Button>
      </div>

      {notice && (
        <div
          className="bg-success/10 border border-success/20 text-success text-base rounded-md p-xs mt-sm"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-xs mt-md mb-sm">
        <label htmlFor="user-search" className="sr-only">Search accounts</label>
        <input
          id="user-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or business"
          className={`${inputClasses} flex-1`}
        />
        <Select
          id="user-role-filter"
          value={roleFilter}
          onChange={(val) => setRoleFilter(val || '')}
          options={FILTER_OPTIONS}
          placeholder="All roles"
          label="Filter by role"
          className="sm:w-56"
        />
      </div>

      {loadError && (
        <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs mb-sm" role="alert">
          {loadError}
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={UserIcon}
          title={hasActiveFilters ? 'No accounts match that search.' : 'No accounts yet.'}
          action={
            hasActiveFilters ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSearch(''); setRoleFilter(''); }}
              >
                Clear search
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" /> Add Account
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Email</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Role</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden sm:table-cell">Status</th>
                <th className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {visible.map((u) => {
                const RoleIcon = ROLE_ICONS[u.role];
                return (
                  <tr key={u.id} className="hover:bg-sand-light/50">
                    <td className="px-sm py-xs">
                      <p className="font-medium text-warm-gray-800">{u.name}</p>
                      <p className="text-xs text-warm-gray-400 md:hidden">{u.email}</p>
                      {u.stockist && (
                        <p className="text-xs text-warm-gray-400">{u.stockist.businessName}</p>
                      )}
                    </td>
                    <td className="px-sm py-xs text-warm-gray-600 hidden md:table-cell">{u.email}</td>
                    <td className="px-sm py-xs">
                      <StatusBadge status={ROLE_BADGE[u.role]} className="gap-3xs">
                        <RoleIcon className="w-3 h-3" />
                        {ROLE_LABELS[u.role]}
                      </StatusBadge>
                    </td>
                    <td className="px-sm py-xs hidden sm:table-cell">
                      <StatusBadge status={u.isActive ? 'success' : 'neutral'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                      {!u.hasPassword && (
                        <span className="block text-xs text-warning-text mt-3xs">No password set</span>
                      )}
                    </td>
                    <td className="px-sm py-xs">
                      <div className="flex items-center justify-end gap-3xs">
                        <button
                          onClick={() => { setNotice(''); setEditing(u); }}
                          className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u.stockist && (
                          <button
                            onClick={() => handleSendPasswordLink(u)}
                            className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                            aria-label={`Email ${u.name} a password link`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {!u.isSuperuser && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <UserFormModal
          onClose={() => setShowAdd(false)}
          onSuccess={(message) => {
            setShowAdd(false);
            setNotice(message);
            loadUsers();
          }}
        />
      )}

      {editing && (
        <UserFormModal
          user={editing}
          onClose={() => setEditing(null)}
          onSuccess={(message) => {
            setEditing(null);
            setNotice(message);
            loadUsers();
          }}
        />
      )}
    </AdminLayout>
  );
}
