'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Mail, Users, Store, Newspaper } from 'lucide-react';
import type { AnyEnquiry, EnquiryType } from '@/types';
import { AdminLayout } from '@/components/admin';
import { listEnquiries, markHandled } from '@/services/enquiries';

const FILTERS: { id: EnquiryType | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All', icon: Mail },
  { id: 'maker-enquiry', label: 'Maker', icon: Users },
  { id: 'stockist-request', label: 'Stockist', icon: Store },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'media', label: 'Media', icon: Newspaper },
];

export default function AdminInboxPage() {
  const [enquiries, setEnquiries] = useState<AnyEnquiry[]>([]);
  const [filter, setFilter] = useState<EnquiryType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEnquiries(); }, [filter]);

  async function loadEnquiries() {
    setLoading(true);
    const data = await listEnquiries(filter === 'all' ? undefined : filter);
    setEnquiries(data);
    setLoading(false);
  }

  async function handleMarkHandled(type: EnquiryType, id: string) {
    await markHandled(type, id);
    loadEnquiries();
  }

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold text-deep-blue mb-6">Inbox</h1>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`tap-target inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ocean text-white'
                  : 'bg-white text-warm-gray-600 border border-sand-dark hover:bg-sand-light'
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Enquiry list */}
      {loading ? (
        <p className="text-warm-gray-400">Loading...</p>
      ) : enquiries.length === 0 ? (
        <p className="text-warm-gray-600 py-8 text-center">No enquiries match this filter.</p>
      ) : (
        <div className="space-y-4">
          {enquiries.map((item) => (
            <EnquiryCard
              key={item.data.id}
              item={item}
              onMarkHandled={() => handleMarkHandled(item.type, item.data.id)}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function EnquiryCard({ item, onMarkHandled }: { item: AnyEnquiry; onMarkHandled: () => void }) {
  const handled = item.data.handled;
  const date = new Date(item.data.submittedAt).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`bg-white rounded-lg shadow-card p-4 sm:p-5 ${handled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <TypeBadge type={item.type} />
          <span className="text-xs text-warm-gray-400">{date}</span>
        </div>
        {!handled && (
          <button
            onClick={onMarkHandled}
            className="tap-target inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-ocean border border-ocean/30 rounded-md hover:bg-ocean/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark handled
          </button>
        )}
        {handled && (
          <span className="text-xs text-success font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Handled
          </span>
        )}
      </div>

      {/* Content based on type */}
      {item.type === 'maker-enquiry' && (
        <div>
          <p className="font-medium text-warm-gray-800">{item.data.name}</p>
          <p className="text-xs text-warm-gray-400">{item.data.village}, {item.data.province}</p>
          <p className="text-sm text-warm-gray-600 mt-2">{item.data.craft}</p>
          {item.data.message && <p className="text-sm text-warm-gray-600 mt-1 italic">{item.data.message}</p>}
          <p className="text-xs text-ocean mt-2">Contact: {item.data.contact}</p>
        </div>
      )}

      {item.type === 'stockist-request' && (
        <div>
          <p className="font-medium text-warm-gray-800">
            {item.data.request.kind === 'replacement-tag' ? 'Replacement Tags' : 'Custom / Bulk Order'}
          </p>
          <p className="text-xs text-warm-gray-400">Stockist: {item.data.stockistId}</p>
          {item.data.request.kind === 'replacement-tag' && (
            <p className="text-sm text-warm-gray-600 mt-2">
              Product: <span className="font-mono">{item.data.request.productCode}</span> × {item.data.request.quantity}
            </p>
          )}
          {item.data.request.kind === 'custom-bulk' && (
            <div className="text-sm text-warm-gray-600 mt-2 space-y-1">
              <p>Product: {item.data.request.product}</p>
              <p>Customisation: {item.data.request.customisation}</p>
              <p>Qty: {item.data.request.quantity}</p>
              {item.data.request.notes && <p className="italic">{item.data.request.notes}</p>}
            </div>
          )}
        </div>
      )}

      {(item.type === 'contact' || item.type === 'media') && (
        <div>
          <p className="font-medium text-warm-gray-800">{item.data.name}</p>
          <p className="text-xs text-warm-gray-400">{item.data.email}</p>
          <p className="text-sm text-warm-gray-600 mt-2">{item.data.message}</p>
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: EnquiryType }) {
  const styles: Record<EnquiryType, string> = {
    'maker-enquiry': 'bg-terracotta/10 text-terracotta',
    'stockist-request': 'bg-ocean/10 text-ocean',
    'contact': 'bg-warm-gray-200 text-warm-gray-600',
    'media': 'bg-warning/10 text-warning',
  };
  const labels: Record<EnquiryType, string> = {
    'maker-enquiry': 'Maker',
    'stockist-request': 'Stockist',
    'contact': 'Contact',
    'media': 'Media',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}
