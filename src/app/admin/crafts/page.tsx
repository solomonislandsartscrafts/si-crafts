'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Hammer } from 'lucide-react';
import type { Craft } from '@/types';
import { AdminLayout } from '@/components/admin';
import { CraftFormModal, type CraftFormData } from '@/components/admin/craft-form-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/** Row-shaped placeholder while the crafts table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading crafts"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminCraftsPage() {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCraft, setEditingCraft] = useState<Craft | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => { loadCrafts(); }, []);

  async function loadCrafts() {
    const { getAllCrafts } = await import('@/services/crafts');
    setCrafts(await getAllCrafts());
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const { deleteCraft } = await import('@/services/crafts');
      await deleteCraft(id);
      toastSuccess(`"${name}" deleted.`);
      loadCrafts();
    } catch {
      toastError(`Failed to delete "${name}". Please try again.`);
    }
  }

  function handleEdit(craft: Craft) {
    setEditingCraft(craft);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingCraft(null);
    setShowForm(true);
  }

  async function handleSave(data: CraftFormData) {
    try {
      if (editingCraft) {
        const { updateCraft } = await import('@/services/crafts');
        await updateCraft(editingCraft.id, {
          ...data,
          culturalContext: data.culturalContext || null,
        });
        toastSuccess(`"${data.name}" updated.`);
      } else {
        const { createCraft } = await import('@/services/crafts');
        await createCraft({
          ...data,
          culturalContext: data.culturalContext || null,
        });
        toastSuccess(`"${data.name}" created.`);
      }
      setShowForm(false);
      setEditingCraft(null);
      loadCrafts();
    } catch (err) {
      throw err; // Re-throw so the modal's try/catch surfaces the error
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className={pageTitleClasses}>Crafts</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Craft
        </Button>
      </div>

      {loading ? <TableSkeleton /> : crafts.length === 0 ? (
        <EmptyState
          icon={Hammer}
          title="No crafts yet."
          action={
            <Button size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Add Craft
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Material</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">Cultural Review</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {crafts.map((craft) => (
                <tr key={craft.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{craft.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 capitalize hidden sm:table-cell">{craft.materialCategory}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusBadge status={craft.culturalContextReviewFlag === 'reviewed' ? 'success' : 'warning'}>
                      {craft.culturalContextReviewFlag}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(craft)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${craft.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(craft.id, craft.name)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Delete ${craft.name}`}
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
        <CraftFormModal
          craft={editingCraft}
          onClose={() => { setShowForm(false); setEditingCraft(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
