'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Craft } from '@/types';
import { AdminLayout } from '@/components/admin';
import { CraftFormModal, type CraftFormData } from '@/components/admin/craft-form-modal';

export default function AdminCraftsPage() {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCraft, setEditingCraft] = useState<Craft | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadCrafts(); }, []);

  async function loadCrafts() {
    const { getAllCrafts } = await import('@/services/crafts');
    setCrafts(await getAllCrafts());
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    const { deleteCraft } = await import('@/services/crafts');
    await deleteCraft(id);
    loadCrafts();
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
      } else {
        const { createCraft } = await import('@/services/crafts');
        await createCraft({
          ...data,
          culturalContext: data.culturalContext || null,
        });
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
        <h1 className="font-heading text-2xl font-bold text-deep-blue">Crafts</h1>
        <button
          onClick={handleAdd}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 bg-ocean hover:bg-ocean-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          <Plus className="w-4 h-4" /> Add Craft
        </button>
      </div>

      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${craft.culturalContextReviewFlag === 'reviewed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {craft.culturalContextReviewFlag}
                    </span>
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
