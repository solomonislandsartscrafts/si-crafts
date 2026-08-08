'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Mail, Phone, Building2, FileText, Pause, Play, Trash2 } from 'lucide-react';
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
    </AdminLayout>
  );
}
