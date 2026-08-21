'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import type { Maker } from '@/types';
import { AdminLayout } from '@/components/admin';
import { MakerFormModal, type MakerFormData } from '@/components/admin/maker-form-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/** Row-shaped placeholder while the makers table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading makers"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-32 hidden sm:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminMakersPage() {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMaker, setEditingMaker] = useState<Maker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => { loadMakers(); }, []);

  async function loadMakers() {
    const { getAllMakers } = await import('@/services/makers');
    const data = await getAllMakers();
    setMakers(data);
    setLoading(false);
  }

  async function toggleConsent(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'Signed' ? 'Not Signed' : 'Signed';
    const { setConsentStatus } = await import('@/services/makers');
    await setConsentStatus(id, newStatus as 'Signed' | 'Not Signed');
    loadMakers();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const { deleteMaker } = await import('@/services/makers');
      await deleteMaker(id);
      toastSuccess(`"${name}" deleted.`);
      loadMakers();
    } catch {
      toastError(`Failed to delete "${name}". Please try again.`);
    }
  }

  function handleEdit(maker: Maker) {
    setEditingMaker(maker);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingMaker(null);
    setShowForm(true);
  }

  async function handleSave(data: MakerFormData) {
    try {
      if (editingMaker) {
        const { updateMaker } = await import('@/services/makers');
        await updateMaker(editingMaker.id, {
          ...data,
          portraitUrl: data.portraitUrl || null,
          story: data.story || null,
        });
        toastSuccess(`"${data.name}" updated.`);
      } else {
        const { createMaker } = await import('@/services/makers');
        await createMaker({
          ...data,
          portraitUrl: data.portraitUrl || null,
          story: data.story || null,
          pieceCount: null,
        });
        toastSuccess(`"${data.name}" created.`);
      }
      setShowForm(false);
      setEditingMaker(null);
      loadMakers();
    } catch (err) {
      throw err;
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
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
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden sm:table-cell">Village</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Consent</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Published</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {makers.map((maker) => (
                <tr key={maker.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{maker.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden sm:table-cell">{maker.village}, {maker.province}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleConsent(maker.id, maker.consentStatus)}
                      className="focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
                      aria-label={`Toggle consent for ${maker.name}`}
                    >
                      <StatusBadge status={maker.consentStatus === 'Signed' ? 'success' : 'neutral'}>
                        {maker.consentStatus}
                      </StatusBadge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {maker.publishedFlag ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-warm-gray-400" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(maker)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit ${maker.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(maker.id, maker.name)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
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
          onClose={() => { setShowForm(false); setEditingMaker(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
