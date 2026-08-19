'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Mail, Phone, Building2, FileText, Pause, Play, Trash2, Plus, X } from 'lucide-react';
import type { Stockist } from '@/types';
import { AdminLayout } from '@/components/admin';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning-text',
  suspended: 'bg-warm-gray-200 text-warm-gray-600',
  rejected: 'bg-error/10 text-error',
};

export default function AdminStockistsPage() {
  const [stockists, setStockists] = useState<Stockist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      if (!res.ok) { alert('Failed to approve stockist.'); return; }
      const data = await res.json();
      if (data?.message) {
        alert(data.message);
      }
      setExpandedId(null);
      loadStockists();
    } catch {
      alert('Failed to approve stockist.');
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
      if (!res.ok) { alert('Failed to reject stockist.'); return; }
      setExpandedId(null);
      loadStockists();
    } catch {
      alert('Failed to reject stockist.');
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  async function handleSuspend(id: string, businessName: string) {
    if (!confirm(`Suspend "${businessName}"? They will lose access until re-enabled.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'suspend' }),
      });
      setExpandedId(null);
      loadStockists();
    } catch { alert('Failed to suspend stockist.'); }
  }

  async function handleEnable(id: string, businessName: string) {
    if (!confirm(`Re-enable "${businessName}"? They will regain login access.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      await fetch('/api/stockists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id, action: 'enable' }),
      });
      setExpandedId(null);
      loadStockists();
    } catch { alert('Failed to enable stockist.'); }
  }

  async function handleDelete(id: string, businessName: string) {
    if (!confirm(`Permanently delete "${businessName}"? This cannot be undone. Their user account will also be removed.`)) return;
    try {
      const token = localStorage.getItem('admin_session');
      await fetch('/api/stockists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id }),
      });
      setExpandedId(null);
      loadStockists();
    } catch { alert('Failed to delete stockist.'); }
  }

  // Sort: pending first, then approved, then suspended, then rejected
  const sortedStockists = [...stockists].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, approved: 1, suspended: 2, rejected: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const pendingCount = stockists.filter((s) => s.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-medium text-deep-blue">Stockists</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-warning-text mt-1">{pendingCount} application{pendingCount > 1 ? 's' : ''} awaiting review</p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> Add Stockist
        </button>
      </div>

      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
        <div className="space-y-3">
          {sortedStockists.length === 0 && (
            <p className="text-warm-gray-400 text-sm">No stockist applications yet.</p>
          )}

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
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sand-light/50 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-warm-gray-800 truncate">{s.businessName}</p>
                      <p className="text-xs text-warm-gray-400">{s.contactName} · {s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${STATUS_STYLES[s.status] || ''}`}>
                      {s.status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-warm-gray-400" /> : <ChevronDown className="w-4 h-4 text-warm-gray-400" />}
                  </div>
                </button>

                {/* Expanded review panel */}
                {isExpanded && (
                  <div className="border-t border-sand px-5 py-5 bg-sand-light/30">
                    <h3 className="text-sm font-semibold text-deep-blue mb-4">Application Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-warm-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">Business Name</p>
                          <p className="text-sm text-warm-gray-800">{s.businessName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-warm-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">ABN</p>
                          <p className="text-sm text-warm-gray-800">{s.abn || '(not provided)'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-warm-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">Email</p>
                          <p className="text-sm text-warm-gray-800">{s.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-warm-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-warm-gray-400">Phone</p>
                          <p className="text-sm text-warm-gray-800">{s.phone || '(not provided)'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description / reason for applying */}
                    {s.description && (
                      <div className="mb-4">
                        <p className="text-xs text-warm-gray-400 mb-1">Why they want to stock our products</p>
                        <p className="text-sm text-warm-gray-800 bg-white rounded-md p-3 border border-sand">
                          {s.description}
                        </p>
                      </div>
                    )}

                    {/* Applied date */}
                    {s.createdAt && (
                      <p className="text-xs text-warm-gray-400 mb-4">
                        Applied: {new Date(s.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}

                    {/* Action buttons */}
                    {isPending && (
                      <div className="flex items-center gap-3 pt-3 border-t border-sand">
                        <button
                          onClick={() => handleApprove(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-5 py-2.5 bg-success hover:bg-success/90 text-white rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-success"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-5 py-2.5 border-2 border-error text-error hover:bg-error hover:text-white rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-error"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {s.status === 'approved' && (
                      <div className="flex items-center gap-3 pt-3 border-t border-sand">
                        <button
                          onClick={() => handleSuspend(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-4 py-2 border-2 border-warm-gray-400 text-warm-gray-600 hover:bg-warm-gray-200 rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        >
                          <Pause className="w-4 h-4" />
                          Suspend Access
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-4 py-2 text-error hover:text-error/80 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                        <p className="text-xs text-success font-medium ml-auto">Active — has login access</p>
                      </div>
                    )}

                    {s.status === 'suspended' && (
                      <div className="flex items-center gap-3 pt-3 border-t border-sand">
                        <button
                          onClick={() => handleEnable(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-5 py-2.5 bg-ocean hover:bg-ocean-dark text-white rounded-md font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        >
                          <Play className="w-4 h-4" />
                          Re-enable Access
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-4 py-2 text-error hover:text-error/80 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                        <p className="text-xs text-warm-gray-400 font-medium ml-auto">Suspended — no login access</p>
                      </div>
                    )}

                    {s.status === 'rejected' && (
                      <div className="flex items-center gap-3 pt-3 border-t border-sand">
                        <button
                          onClick={() => handleDelete(s.id, s.businessName)}
                          className="tap-target inline-flex items-center gap-2 px-4 py-2 text-error hover:text-error/80 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
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
          onClose={() => setShowAddModal(false)}
          onSuccess={(message) => {
            setShowAddModal(false);
            if (message) alert(message);
            loadStockists();
          }}
        />
      )}
    </AdminLayout>
  );
}

const FIELD_CLASS =
  'w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-blue/50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-md w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-stockist-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2 id="add-stockist-title" className="font-heading text-xl font-medium text-deep-blue">
            Add Stockist
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
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <p className="text-sm text-warm-gray-600">
            Creates an approved stockist with wholesale access straight away — use this
            for shops you already deal with, instead of waiting for an application.
          </p>

          <div>
            <label htmlFor="stockist-business" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Business Name *
            </label>
            <input
              id="stockist-business"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="stockist-contact" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Contact Name *
            </label>
            <input
              id="stockist-contact"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="stockist-email" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Email *
            </label>
            <input
              id="stockist-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD_CLASS}
            />
            <p className="text-xs text-warm-gray-400 mt-1">This is the address they log in with.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stockist-phone" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Phone
              </label>
              <input
                id="stockist-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label htmlFor="stockist-abn" className="block text-sm font-medium text-warm-gray-800 mb-1">
                ABN
              </label>
              <input
                id="stockist-abn"
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div>
            <label htmlFor="stockist-notes" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Notes
            </label>
            <textarea
              id="stockist-notes"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="stockist-password" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Password
            </label>
            <input
              id="stockist-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to email a setup link"
              className={FIELD_CLASS}
            />
            <p className="text-xs text-warm-gray-400 mt-1">
              Leave blank and we&apos;ll email them a one-time link to choose their own
              password. Set one here only if you need to give it to them directly.
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
            <button type="submit" disabled={saving} className="tap-target px-6 py-3 btn-primary">
              {saving ? 'Adding...' : 'Add Stockist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
