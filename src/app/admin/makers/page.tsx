'use client';

import { Plus, Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import type { Maker } from '@/types';
import { getAllMakers, createMaker, updateMaker, deleteMaker, setConsentStatus } from '@/services/makers';
import { AdminLayout } from '@/components/admin';
import { MakerFormModal, type MakerFormData } from '@/components/admin/maker-form-modal';
import { useAdminCrud } from '@/lib/use-admin-crud';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

/**
 * Row-shaped placeholder skeleton displayed while the makers table loads.
 */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading makers"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-32 hidden sm:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Admin page for managing makers (the artisans who create the pieces).
 * Uses the shared useAdminCrud hook for standard CRUD operations, with
 * a custom toggleConsent function for the consent status workflow.
 */
export default function AdminMakersPage() {
  // Use shared CRUD hook instead of manual state management
  const { error: toastError } = useToast();
  const {
    items: makers,
    loading,
    editingItem: editingMaker,
    showForm,
    reload,
    handlers: { handleAdd, handleEdit, handleSave, handleDelete, handleCloseForm },
  } = useAdminCrud<Maker, MakerFormData>({
    loadFn: getAllMakers,
    createFn: (data) =>
      createMaker({
        ...data,
        portraitUrl: data.portraitUrl || null,
        story: data.story || null,
        pieceCount: null,
      }),
    updateFn: (id, data) =>
      updateMaker(id, {
        ...data,
        portraitUrl: data.portraitUrl || null,
        story: data.story || null,
      }),
    deleteFn: deleteMaker,
    entityName: 'maker',
  });

  /**
   * Toggle consent status between "Signed" and "Not Signed".
   * This is unique to the makers workflow and not part of the generic CRUD hook.
   */
  async function toggleConsent(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'Signed' ? 'Not Signed' : 'Signed';
    try {
      await setConsentStatus(id, newStatus as 'Signed' | 'Not Signed');
      reload(); // Reload the list using the hook's reload function
    } catch {
      // A rejected update must not fail silently — surface it so the toggle
      // doesn't appear to have worked when it hasn't.
      toastError('Failed to update consent status. Please try again.');
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-md">
        <h1 className={pageTitleClasses}>Makers</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Maker
        </Button>
      </div>

      {loading ? <TableSkeleton /> : makers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No makers yet."
          action={
            <Button size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Add Maker
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Name</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden sm:table-cell">Village</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Consent</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Published</th>
                <th scope="col" className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {makers.map((maker) => (
                <tr key={maker.id} className="hover:bg-sand-light/50">
                  <td className="px-sm py-xs font-medium text-warm-gray-800">{maker.name}</td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden sm:table-cell">{maker.village}, {maker.province}</td>
                  <td className="px-sm py-xs">
                    <button
                      onClick={() => toggleConsent(maker.id, maker.consentStatus)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
                      aria-label={`Toggle consent for ${maker.name}`}
                    >
                      <StatusBadge status={maker.consentStatus === 'Signed' ? 'success' : 'neutral'}>
                        {maker.consentStatus}
                      </StatusBadge>
                    </button>
                  </td>
                  <td className="px-sm py-xs">
                    {maker.publishedFlag ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-warm-gray-400" />}
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => handleEdit(maker)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Edit ${maker.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(maker.id, maker.name)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Delete ${maker.name}`}>
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
        <MakerFormModal
          maker={editingMaker}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
