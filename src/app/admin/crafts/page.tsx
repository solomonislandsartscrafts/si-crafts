'use client';

import { Plus, Edit, Trash2, Hammer } from 'lucide-react';
import type { Craft } from '@/types';
import { getAllCrafts, createCraft, updateCraft, deleteCraft } from '@/services/crafts';
import { AdminLayout } from '@/components/admin';
import { CraftFormModal, type CraftFormData } from '@/components/admin/craft-form-modal';
import { useAdminCrud } from '@/lib/use-admin-crud';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/**
 * Row-shaped placeholder skeleton displayed while the crafts table loads.
 */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading crafts"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Admin page for managing craft types (pandanus weaving, shell money, wood carving, etc.).
 * Uses the shared useAdminCrud hook to eliminate boilerplate CRUD logic.
 */
export default function AdminCraftsPage() {
  // Use shared CRUD hook instead of manual state management
  const {
    items: crafts,
    loading,
    editingItem: editingCraft,
    showForm,
    handlers: { handleAdd, handleEdit, handleSave, handleDelete, handleCloseForm },
  } = useAdminCrud<Craft, CraftFormData>({
    loadFn: getAllCrafts,
    createFn: (data) =>
      createCraft({
        ...data,
        culturalContext: data.culturalContext || null,
      }),
    updateFn: (id, data) =>
      updateCraft(id, {
        ...data,
        culturalContext: data.culturalContext || null,
      }),
    deleteFn: deleteCraft,
    entityName: 'craft',
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-md">
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
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Name</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden sm:table-cell">Material</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Cultural Review</th>
                <th scope="col" className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {crafts.map((craft) => (
                <tr key={craft.id} className="hover:bg-sand-light/50">
                  <td className="px-sm py-xs font-medium text-warm-gray-800">{craft.name}</td>
                  <td className="px-sm py-xs text-warm-gray-600 capitalize hidden sm:table-cell">{craft.materialCategory}</td>
                  <td className="px-sm py-xs hidden md:table-cell">
                    <StatusBadge status={craft.culturalContextReviewFlag === 'reviewed' ? 'success' : 'warning'}>
                      {craft.culturalContextReviewFlag}
                    </StatusBadge>
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => handleEdit(craft)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Edit ${craft.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(craft.id, craft.name)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
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
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
