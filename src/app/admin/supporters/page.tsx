'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Handshake } from 'lucide-react';
import type { Supporter } from '@/types';
import { AdminLayout } from '@/components/admin';
import {
  SupporterFormModal,
  type SupporterFormData,
} from '@/components/admin/supporter-form-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { resolveImageUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading supporters"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminSupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { getSupportersForAdmin } = await import('@/services/supporters');
      setSupporters(await getSupportersForAdmin());
    } catch {
      toastError('Failed to load supporters. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the homepage? This cannot be undone.`)) return;
    try {
      const { deleteSupporter } = await import('@/services/supporters');
      await deleteSupporter(id);
      toastSuccess(`"${name}" removed.`);
      load();
    } catch {
      toastError(`Failed to remove "${name}". Please try again.`);
    }
  }

  async function handleSave(data: SupporterFormData) {
    if (editing) {
      const { updateSupporter } = await import('@/services/supporters');
      await updateSupporter(editing.id, data);
      toastSuccess(`"${data.name}" updated.`);
    } else {
      const { createSupporter } = await import('@/services/supporters');
      await createSupporter(data);
      toastSuccess(`"${data.name}" added.`);
    }
    setShowForm(false);
    setEditing(null);
    load();
  }

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className={pageTitleClasses}>Supporters</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Supporter
        </Button>
      </div>
      <p className="text-base text-warm-gray-600 mb-6">
        Logos shown below the homepage hero. Add only confirmed supporters — with none listed, the
        band hides itself rather than implying backing that doesn&apos;t exist.
      </p>

      {loading ? (
        <TableSkeleton />
      ) : supporters.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No supporters listed yet."
          description="The homepage supporters band is hidden until you add one."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Add your first supporter
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Logo</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">
                  Links to
                </th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {supporters.map((supporter) => (
                <tr key={supporter.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 text-warm-gray-400 text-xs">{supporter.sortOrder}</td>
                  <td className="px-4 py-3">
                    {supporter.logoUrl ? (
                      <div className="relative h-10 w-24 bg-warm-gray-100 rounded">
                        <Image
                          src={resolveImageUrl(supporter.logoUrl)}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <span className="text-warm-gray-400 italic">no logo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{supporter.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {supporter.href || <span className="text-warm-gray-400 italic">not linked</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(supporter);
                          setShowForm(true);
                        }}
                        className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${supporter.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supporter.id, supporter.name)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Remove ${supporter.name}`}
                      >
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

      {showForm && (
        <SupporterFormModal
          supporter={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
