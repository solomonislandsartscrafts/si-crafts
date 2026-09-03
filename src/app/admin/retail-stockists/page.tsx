'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Store } from 'lucide-react';
import type { RetailStockist } from '@/types';
import { AdminLayout } from '@/components/admin';
import {
  RetailStockistFormModal,
  type RetailStockistFormData,
} from '@/components/admin/retail-stockist-form-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading stockists"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-40 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminRetailStockistsPage() {
  const [stockists, setStockists] = useState<RetailStockist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<RetailStockist | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { getRetailStockistsForAdmin } = await import('@/services/retail-stockists');
      setStockists(await getRetailStockistsForAdmin());
    } catch {
      toastError('Failed to load stockists. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the public stockist list? This cannot be undone.`)) return;
    try {
      const { deleteRetailStockist } = await import('@/services/retail-stockists');
      await deleteRetailStockist(id);
      toastSuccess(`"${name}" removed.`);
      load();
    } catch {
      toastError(`Failed to remove "${name}". Please try again.`);
    }
  }

  async function handleSave(data: RetailStockistFormData) {
    if (editing) {
      const { updateRetailStockist } = await import('@/services/retail-stockists');
      await updateRetailStockist(editing.id, data);
      toastSuccess(`"${data.name}" updated.`);
    } else {
      const { createRetailStockist } = await import('@/services/retail-stockists');
      await createRetailStockist(data);
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
      <div className="flex items-center justify-between mb-2xs">
        <h1 className={pageTitleClasses}>Retail Stockists</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Stockist
        </Button>
      </div>
      <p className="text-base text-warm-gray-600 mb-md">
        The museum and gallery shops listed publicly on the Stockists page. Separate from wholesale
        accounts, which are managed under Stockists.
      </p>

      {loading ? (
        <TableSkeleton />
      ) : stockists.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No stockists listed yet."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Add your first stockist
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Order</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Shop</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden sm:table-cell">
                  City
                </th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">
                  Contact
                </th>
                <th className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {stockists.map((stockist) => (
                <tr key={stockist.id} className="hover:bg-sand-light/50">
                  <td className="px-sm py-xs text-warm-gray-400 text-xs">{stockist.sortOrder}</td>
                  <td className="px-sm py-xs font-medium text-warm-gray-800">{stockist.name}</td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden sm:table-cell">
                    {stockist.city || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {stockist.email || stockist.phone || (
                      <span className="text-warm-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => {
                          setEditing(stockist);
                          setShowForm(true);
                        }}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${stockist.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stockist.id, stockist.name)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Remove ${stockist.name}`}
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
        <RetailStockistFormModal
          stockist={editing}
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
