'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Mail, Phone, Building2, FileText, Pause, Play, Trash2, Plus, X, Store } from 'lucide-react';
import type { Stockist } from '@/types';
import { AdminLayout } from '@/components/admin';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  suspended: 'neutral',
  rejected: 'error',
};

/** Card-shaped placeholder while the stockist list loads. */
function StockistListSkeleton() {
  return (
    <SkeletonRegion label="Loading stockists" className="space-y-xs">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-card border border-sand flex items-center justify-between px-md py-sm gap-sm"
        >
          <div className="flex-1 space-y-2xs">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminStockistsPage() {
  const [stockists, setStockists] = useState<Stockist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const { success: toastSuccess, error: toastError } = useToast();

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

  async function handleApprove(id: string, businessName: string) {
    if (!confirm(`Approve "${businessName}"? This will create a login account and email them their credentials.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      if (!res.ok) { toastError('Failed to approve stockist.'); return; }
      const data = await res.json();
      if (data?.message) {
        toastSuccess(data.message);
      }
      setExpandedId(null);
      loadStockists();
    } catch {
      toastError('Failed to approve stockist.');
    }
  }

  async function handleReject(id: string, businessName: string) {
    if (!confirm(`Reject "${businessName}"? They will receive a notification email.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'reject' }),
      });
      if (!res.ok) { toastError('Failed to reject stockist.'); return; }
      setExpandedId(null);
      loadStockists();
    } catch {
      toastError('Failed to reject stockist.');
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  async function handleSuspend(id: string, businessName: string) {
    if (!confirm(`Suspend "${businessName}"? They will lose access until re-enabled.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'suspend' }),
      });
      if (!res.ok) { toastError('Failed to suspend stockist.'); return; }
      setExpandedId(null);
      loadStockists();
    } catch { toastError('Failed to suspend stockist.'); }
  }

  async function handleEnable(id: string, businessName: string) {
    if (!confirm(`Re-enable "${businessName}"? They will regain login access.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'enable' }),
      });
      if (!res.ok) { toastError('Failed to enable stockist.'); return; }
      setExpandedId(null);
      loadStockists();
    } catch { toastError('Failed to enable stockist.'); }
  }

  async function handleDelete(id: string, businessName: string) {
    if (!confirm(`Permanently delete "${businessName}"? This cannot be undone. Their user account will also be removed.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { toastError('Failed to delete stockist.'); return; }
      setExpandedId(null);
      loadStockists();
    } catch { toastError('Failed to delete stockist.'); }
  }

  // Sort: pending first, then approved, then suspended, then rejected
  const sortedStockists = [...stockists].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, approved: 1, suspended: 2, rejected: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const pendingCount = stockists.filter((s) => s.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-md">
        <div>
          <h1 className={pageTitleClasses}>Stockists</h1>
          {pendingCount > 0 && (
            <p className="text-base text-warning-text mt-3xs">{pendingCount} application{pendingCount > 1 ? 's' : ''} awaiting review</p>
          )}
        </div>
        <Button ref={addButtonRef} size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Stockist
        </Button>
      </div>

      {loading ? <StockistListSkeleton /> : sortedStockists.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stockist applications yet."
          action={
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add Stockist
            </Button>
          }
        />
      ) : (
        <div className="space-y-xs">
          {sortedStockists.map((s) => {
            const isExpanded = expandedId === s.id;
            const isPending = s.status === 'pending';

            return (
              <div
                key={s.id}
                className={`bg-white rounded-lg shadow-card border overflow-hidden transition-all ${
                  isPending ? 'border-warning/30' : 'border-sand'
                }`}
              >
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(s.id)}
                  className="w-full flex items-center justify-between px-md py-sm text-left hover:bg-sand-light/50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-sm min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-warm-gray-800 truncate">{s.businessName}</p>
                      <p className="text-xs text-warm-gray-400">{s.contactName} · {s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-xs shrink-0">
                    <StatusBadge status={STATUS_BADGE[s.status] ?? 'neutral'} className="capitalize">
                      {s.status}
                    </StatusBadge>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-warm-gray-400" /> : <ChevronDown className="w-4 h-4 text-warm-gray-400" />}
                  </div>
                </button>

                {/* Expanded review panel */}
                {isExpanded && (
                  <div className="border-t border-sand px-md py-md bg-sand-light/30">
                    <h3 className="text-sm font-semibold text-deep-blue mb-sm">Application Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-sm">
                      <div className="flex items-start gap-2xs">
                        <Building2 className="w-4 h-4 text-warm-gray-400 mt-3xs shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">Business Name</p>
                          <p className="text-sm text-warm-gray-800">{s.businessName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2xs">
                        <FileText className="w-4 h-4 text-warm-gray-400 mt-3xs shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">ABN</p>
                          <p className="text-sm text-warm-gray-800">{s.abn || '(not provided)'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2xs">
                        <Mail className="w-4 h-4 text-warm-gray-400 mt-3xs shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">Email</p>
                          <p className="text-sm text-warm-gray-800">{s.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2xs">
                        <Phone className="w-4 h-4 text-warm-gray-400 mt-3xs shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">Phone</p>
                          <p className="text-sm text-warm-gray-800">{s.phone || '(not provided)'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description / reason for applying */}
                    {s.description && (
                      <div className="mb-sm">
                        <p className="text-xs text-warm-gray-400 mb-3xs">Why they want to stock our products</p>
                        <p className="text-base text-warm-gray-800 bg-white rounded-md p-xs border border-sand">
                          {s.description}
                        </p>
                      </div>
                    )}

                    {/* Applied date */}
                    {s.createdAt && (
                      <p className="text-xs text-warm-gray-400 mb-sm">
                        Applied: {new Date(s.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}

                    {/* Action buttons */}
                    {isPending && (
                      <div className="flex items-center gap-xs pt-xs border-t border-sand">
                        <Button size="sm" onClick={() => handleApprove(s.id, s.businessName)}>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleReject(s.id, s.businessName)}>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {s.status === 'approved' && (
                      <div className="flex items-center gap-xs pt-xs border-t border-sand">
                        <Button variant="secondary" size="sm" onClick={() => handleSuspend(s.id, s.businessName)}>
                          <Pause className="w-4 h-4" />
                          Suspend Access
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id, s.businessName)}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                        <p className="text-xs text-success font-medium ml-auto">Active — has login access</p>
                      </div>
                    )}

                    {s.status === 'suspended' && (
                      <div className="flex items-center gap-xs pt-xs border-t border-sand">
                        <Button size="sm" onClick={() => handleEnable(s.id, s.businessName)}>
                          <Play className="w-4 h-4" />
                          Re-enable Access
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id, s.businessName)}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                        <p className="text-xs text-warm-gray-400 font-medium ml-auto">Suspended — no login access</p>
                      </div>
                    )}

                    {s.status === 'rejected' && (
                      <div className="flex items-center gap-xs pt-xs border-t border-sand">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(s.id, s.businessName)}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                        <p className="text-xs text-error font-medium ml-auto">Rejected</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddStockistModal
          onClose={() => { setShowAddModal(false); addButtonRef.current?.focus(); }}
          onSuccess={(message) => {
            setShowAddModal(false);
            addButtonRef.current?.focus();
            if (message) toastSuccess(message);
            loadStockists();
          }}
        />
      )}
    </AdminLayout>
  );
}

function AddStockistModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (message?: string) => void;
}) {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [abn, setAbn] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the dialog on mount and trap focus within it
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (!saving) onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = dialog!.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saving, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!businessName.trim() || !contactName.trim() || !email.trim()) {
      setError('Business name, contact name and email are required.');
      return;
    }
    if (password && password.length < 8) {
      setError('Password must be at least 8 characters, or leave it blank.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/stockists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessName,
          contactName,
          email,
          phone,
          abn,
          description,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to add stockist.');

      onSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stockist.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-deep-blue/50 overflow-y-auto"
      onClick={() => { if (!saving) onClose(); }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-md w-full max-w-md my-lg outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-stockist-title"
      >
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="add-stockist-title" className="font-heading text-xl font-medium text-deep-blue">
            Add Stockist
          </h2>
          <button
            onClick={() => { if (!saving) onClose(); }}
            disabled={saving}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-md py-sm space-y-sm">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <p className="text-base text-warm-gray-600">
            Creates an approved stockist with wholesale access straight away — use this
            for shops you already deal with, instead of waiting for an application.
          </p>

          <FormField label="Business Name *" htmlFor="stockist-business">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={inputClasses}
            />
          </FormField>

          <FormField label="Contact Name *" htmlFor="stockist-contact">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={inputClasses}
            />
          </FormField>

          <div>
            <FormField label="Email *" htmlFor="stockist-email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-3xs">This is the address they log in with.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <FormField label="Phone" htmlFor="stockist-phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClasses}
              />
            </FormField>
            <FormField label="ABN" htmlFor="stockist-abn">
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                className={inputClasses}
              />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="stockist-notes">
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClasses} resize-y`}
            />
          </FormField>

          <div>
            <FormField label="Password" htmlFor="stockist-password">
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to email a setup link"
                className={inputClasses}
              />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-3xs">
              Leave blank and we&apos;ll email them a one-time link to choose their own
              password. Set one here only if you need to give it to them directly.
            </p>
          </div>

          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Adding...">
              Add Stockist
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
