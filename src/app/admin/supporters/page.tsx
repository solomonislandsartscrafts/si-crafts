'use client';

import Image from 'next/image';
import { Plus, Edit, Trash2, Handshake, EyeOff, Eye } from 'lucide-react';
import type { Supporter } from '@/types';
import { getSupportersForAdmin, createSupporter, updateSupporter, deleteSupporter } from '@/services/supporters';
import { AdminLayout } from '@/components/admin';
import {
  SupporterFormModal,
  type SupporterFormData,
} from '@/components/admin/supporter-form-modal';
import { useAdminCrud } from '@/lib/use-admin-crud';
import { pageTitleClasses } from '@/components/layout/page-header';
import { resolveImageUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/**
 * Row-shaped placeholder skeleton displayed while the supporters table loads.
 */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading supporters"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Admin page for managing supporters (logos displayed below the homepage hero).
 * Uses the shared useAdminCrud hook to eliminate boilerplate CRUD logic.
 */
export default function AdminSupportersPage() {
  // Use shared CRUD hook instead of manual state management
  const {
    items: supporters,
    loading,
    editingItem: editing,
    showForm,
    reload,
    handlers: { handleAdd, handleEdit, handleSave, handleDelete, handleCloseForm },
  } = useAdminCrud<Supporter, SupporterFormData>({
    loadFn: getSupportersForAdmin,
    createFn: createSupporter,
    updateFn: updateSupporter,
    deleteFn: deleteSupporter,
    entityName: 'supporter',
  });

  const { success: toastSuccess, error: toastError } = useToast();

  // Suspend / reactivate without opening the form. Flips only the `active`
  // flag, then reloads so the status column reflects the change.
  async function handleToggleActive(supporter: Supporter) {
    const next = !supporter.active;
    try {
      await updateSupporter(supporter.id, { active: next });
      toastSuccess(`"${supporter.name}" ${next ? 'is now shown on the homepage' : 'suspended'}.`);
      reload();
    } catch {
      toastError(`Failed to update "${supporter.name}". Please try again.`);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-2xs">
        <h1 className={pageTitleClasses}>Supporters</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Supporter
        </Button>
      </div>
      <p className="text-base text-warm-gray-600 mb-md">
        Logos shown below the homepage hero. Add only confirmed supporters — with none shown, the
        band hides itself rather than implying backing that doesn&apos;t exist. Suspend a supporter
        to hide its logo without deleting the record.
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
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Order</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Logo</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Name</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">
                  Links to
                </th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Status</th>
                <th scope="col" className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {supporters.map((supporter) => (
                <tr
                  key={supporter.id}
                  className={`hover:bg-sand-light/50 ${supporter.active ? '' : 'opacity-60'}`}
                >
                  <td className="px-sm py-xs text-warm-gray-400 text-xs">{supporter.sortOrder}</td>
                  <td className="px-sm py-xs">
                    {supporter.logoUrl ? (
                      <div className="relative h-10 w-24 bg-warm-gray-100 rounded">
                        <Image
                          src={resolveImageUrl(supporter.logoUrl)}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-contain p-3xs"
                        />
                      </div>
                    ) : (
                      <span className="text-warm-gray-400 italic">no logo</span>
                    )}
                  </td>
                  <td className="px-sm py-xs font-medium text-warm-gray-800">{supporter.name}</td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {supporter.href || <span className="text-warm-gray-400 italic">not linked</span>}
                  </td>
                  <td className="px-sm py-xs">
                    {supporter.active ? (
                      <StatusBadge status="success" size="compact">Shown</StatusBadge>
                    ) : (
                      <StatusBadge status="neutral" size="compact">Suspended</StatusBadge>
                    )}
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => handleToggleActive(supporter)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={
                          supporter.active
                            ? `Suspend ${supporter.name}`
                            : `Show ${supporter.name} on the homepage`
                        }
                        title={supporter.active ? 'Suspend' : 'Show on homepage'}
                      >
                        {supporter.active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(supporter)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Edit ${supporter.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supporter.id, supporter.name)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
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
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
