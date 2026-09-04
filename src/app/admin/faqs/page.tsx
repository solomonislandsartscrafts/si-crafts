'use client';

import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import type { Faq } from '@/types';
import { getFaqsForAdmin, createFaq, updateFaq, deleteFaq } from '@/services/faqs';
import { AdminLayout } from '@/components/admin';
import { FaqFormModal, type FaqFormData } from '@/components/admin/faq-form-modal';
import { useAdminCrud } from '@/lib/use-admin-crud';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/**
 * Row-shaped placeholder skeleton displayed while the FAQ table loads.
 */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading FAQs"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-40 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Admin page for managing FAQs (displayed on the public FAQs & Shipping page).
 * Uses the shared useAdminCrud hook to eliminate boilerplate CRUD logic.
 */
export default function AdminFaqsPage() {
  // Use shared CRUD hook instead of manual state management
  const {
    items: faqs,
    loading,
    editingItem: editingFaq,
    showForm,
    handlers: { handleAdd, handleEdit, handleSave, handleDelete, handleCloseForm },
  } = useAdminCrud<Faq, FaqFormData>({
    loadFn: getFaqsForAdmin,
    createFn: (data) =>
      createFaq({
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder,
      }),
    updateFn: (id, data) =>
      updateFaq(id, {
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder,
      }),
    deleteFn: deleteFaq,
    entityName: 'FAQ',
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-2xs">
        <h1 className={pageTitleClasses}>FAQs</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add FAQ
        </Button>
      </div>
      <p className="text-base text-warm-gray-600 mb-md">
        These appear on the public FAQs &amp; Shipping page. Changes can take a few minutes to
        show on the live site.
      </p>

      {loading ? (
        <TableSkeleton />
      ) : faqs.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs yet."
          action={
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" /> Add your first FAQ
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Order</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600">Question</th>
                <th scope="col" className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Answer</th>
                <th scope="col" className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-sand-light/50">
                  <td className="px-sm py-xs text-warm-gray-400 text-xs">{faq.sortOrder}</td>
                  <td className="px-sm py-xs font-medium text-warm-gray-800">{faq.question}</td>
                  <td className="px-sm py-xs text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {faq.answer || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-sm py-xs text-right">
                    <div className="flex items-center justify-end gap-2xs">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Edit "${faq.question}"`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id, faq.question)}
                        className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                        aria-label={`Delete "${faq.question}"`}
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
        <FaqFormModal
          faq={editingFaq}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
