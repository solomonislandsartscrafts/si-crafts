'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import type { Faq } from '@/types';
import { AdminLayout } from '@/components/admin';
import { FaqFormModal, type FaqFormData } from '@/components/admin/faq-form-modal';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';

/** Row-shaped placeholder while the FAQ table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading FAQs"
      className="bg-white rounded-lg shadow-card p-4 space-y-4"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-40 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => { loadFaqs(); }, []);

  async function loadFaqs() {
    try {
      const { getFaqsForAdmin } = await import('@/services/faqs');
      const data = await getFaqsForAdmin();
      setFaqs(data);
    } catch {
      toastError('Failed to load FAQs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, question: string) {
    if (!confirm(`Delete "${question}"? This cannot be undone.`)) return;
    try {
      const { deleteFaq } = await import('@/services/faqs');
      await deleteFaq(id);
      toastSuccess('FAQ deleted.');
      loadFaqs();
    } catch {
      toastError('Failed to delete the FAQ. Please try again.');
    }
  }

  function handleEdit(faq: Faq) {
    setEditingFaq(faq);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingFaq(null);
    setShowForm(true);
  }

  async function handleSave(data: FaqFormData) {
    if (editingFaq) {
      const { updateFaq } = await import('@/services/faqs');
      await updateFaq(editingFaq.id, {
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder,
      });
      toastSuccess('FAQ updated.');
    } else {
      const { createFaq } = await import('@/services/faqs');
      await createFaq({
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder,
      });
      toastSuccess('FAQ added.');
    }
    setShowForm(false);
    setEditingFaq(null);
    loadFaqs();
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-2">
        <h1 className={pageTitleClasses}>FAQs</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add FAQ
        </Button>
      </div>
      <p className="text-base text-warm-gray-600 mb-6">
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
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Question</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">Answer</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 text-warm-gray-400 text-xs">{faq.sortOrder}</td>
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{faq.question}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden md:table-cell max-w-xs truncate">
                    {faq.answer || <span className="text-warm-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                        aria-label={`Edit "${faq.question}"`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id, faq.question)}
                        className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
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
          onClose={() => { setShowForm(false); setEditingFaq(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
