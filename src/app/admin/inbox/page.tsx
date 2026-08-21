'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Mail, Users, Store, Newspaper, Inbox } from 'lucide-react';
import type { AnyEnquiry, EnquiryType } from '@/types';
import { AdminLayout } from '@/components/admin';
import { listEnquiries, markHandled } from '@/services/enquiries';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/** Card-shaped placeholder while the enquiry list loads. */
function EnquiryListSkeleton() {
  return (
    <SkeletonRegion label="Loading enquiries" className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

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
      <h1 className={`${pageTitleClasses} mb-6`}>Inbox</h1>

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
        <EnquiryListSkeleton />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No enquiries match this filter."
          action={
            filter === 'all' ? undefined : (
              <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
                Show all enquiries
              </Button>
            )
          }
        />
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
          <Button variant="secondary" size="sm" onClick={onMarkHandled}>
            <CheckCircle className="w-3.5 h-3.5" />
            Mark handled
          </Button>
        )}
        {handled && (
          <StatusBadge status="success" className="gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Handled
          </StatusBadge>
        )}
      </div>

      {/* Content based on type */}
      {item.type === 'maker-enquiry' && (
        <div>
          <p className="font-medium text-warm-gray-800">{item.data.name}</p>
          <p className="text-xs text-warm-gray-400">{item.data.village}, {item.data.province}</p>
          <p className="text-sm text-warm-gray-600 mt-2">{item.data.craft}</p>
          {item.data.message && <p className="text-base text-warm-gray-600 mt-1 italic">{item.data.message}</p>}
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
          <p className="text-base text-warm-gray-600 mt-2">{item.data.message}</p>
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: EnquiryType }) {
  const status: Record<EnquiryType, 'success' | 'info' | 'neutral' | 'warning'> = {
    'maker-enquiry': 'success',
    'stockist-request': 'info',
    'contact': 'neutral',
    'media': 'warning',
  };
  const labels: Record<EnquiryType, string> = {
    'maker-enquiry': 'Maker',
    'stockist-request': 'Stockist',
    'contact': 'Contact',
    'media': 'Media',
  };
  return <StatusBadge status={status[type]}>{labels[type]}</StatusBadge>;
}
