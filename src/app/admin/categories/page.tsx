'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import type { MaterialCategoryOption, ProductTypeOption } from '@/services/categories';

export default function AdminCategoriesPage() {
  const [materialCategories, setMaterialCategories] = useState<MaterialCategoryOption[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // New material category form
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatInitial, setNewCatInitial] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  // New product type form
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [typeError, setTypeError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { getMaterialCategories, getProductTypes } = await import('@/services/categories');
    const [cats, types] = await Promise.all([getMaterialCategories(), getProductTypes()]);
    setMaterialCategories(cats);
    setProductTypes(types);
    setLoading(false);
  }

  async function handleAddCategory() {
    setCatError(null);
    const label = newCatLabel.trim();
    const initial = newCatInitial.trim().toUpperCase();

    if (!label) { setCatError('Label is required'); return; }
    if (!initial || initial.length > 3) { setCatError('Code initial required (1-3 chars)'); return; }

    const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!value) { setCatError('Invalid label — must contain letters'); return; }

    try {
      const { createMaterialCategory } = await import('@/services/categories');
      await createMaterialCategory({ value, label, codeInitial: initial });
      setNewCatLabel('');
      setNewCatInitial('');
      loadData();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Failed to create');
    }
  }

  async function handleDeleteCategory(value: string, label: string) {
    if (!confirm(`Delete material category "${label}"? Existing products using it will keep their data but may appear uncategorised.`)) return;
    const { deleteMaterialCategory } = await import('@/services/categories');
    await deleteMaterialCategory(value);
    loadData();
  }

  async function handleAddType() {
    setTypeError(null);
    const label = newTypeLabel.trim();
    if (!label) { setTypeError('Label is required'); return; }

    const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!value) { setTypeError('Invalid label — must contain letters'); return; }

    try {
      const { createProductType } = await import('@/services/categories');
      await createProductType({ value, label });
      setNewTypeLabel('');
      loadData();
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : 'Failed to create');
    }
  }

  async function handleDeleteType(value: string, label: string) {
    if (!confirm(`Delete product type "${label}"? Existing products using it will keep their data.`)) return;
    const { deleteProductType } = await import('@/services/categories');
    await deleteProductType(value);
    loadData();
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-ocean animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-2">
          Categories & Types
        </h1>
        <p className="text-sm text-warm-gray-600 mb-8">
          Manage material categories and product types. These appear in dropdown menus across the admin panel and catalogue filters.
        </p>

        {/* Material Categories */}
        <section className="mb-12">
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-4">
            Material Categories
          </h2>
          <p className="text-sm text-warm-gray-600 mb-4">
            Each category has a code initial used in product codes (e.g. P for Pandanus → P-J-1).
          </p>

          {/* Existing categories */}
          <div className="space-y-2 mb-4">
            {materialCategories.map((cat) => (
              <div key={cat.value} className="flex items-center justify-between px-4 py-3 bg-white border border-sand rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-ocean/10 text-ocean font-mono font-bold text-sm rounded">
                    {cat.codeInitial}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-warm-gray-800">{cat.label}</p>
                    <p className="text-xs text-warm-gray-400">{cat.value}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.value, cat.label)}
                  className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-error rounded"
                  aria-label={`Delete ${cat.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div className="flex flex-wrap items-end gap-3 p-4 bg-sand-light rounded-lg">
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="new-cat-label" className="block text-xs font-medium text-warm-gray-800 mb-1">
                Category Name
              </label>
              <input
                id="new-cat-label"
                type="text"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="e.g. Coconut Shell"
                className="w-full px-3 py-2 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              />
            </div>
            <div className="w-20">
              <label htmlFor="new-cat-initial" className="block text-xs font-medium text-warm-gray-800 mb-1">
                Code Initial
              </label>
              <input
                id="new-cat-initial"
                type="text"
                value={newCatInitial}
                onChange={(e) => setNewCatInitial(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="C"
                maxLength={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddCategory}
              className="tap-target inline-flex items-center gap-1.5 px-4 py-2 text-sm btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {catError && <p className="text-sm text-error mt-2">{catError}</p>}
        </section>

        {/* Product Types */}
        <section>
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-4">
            Product Types
          </h2>
          <p className="text-sm text-warm-gray-600 mb-4">
            Types of products that can be assigned in the product form.
          </p>

          {/* Existing types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {productTypes.map((type) => (
              <div key={type.value} className="flex items-center justify-between px-4 py-2.5 bg-white border border-sand rounded-lg">
                <div>
                  <p className="text-sm font-medium text-warm-gray-800">{type.label}</p>
                  <p className="text-xs text-warm-gray-400">{type.value}</p>
                </div>
                <button
                  onClick={() => handleDeleteType(type.value, type.label)}
                  className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-error rounded"
                  aria-label={`Delete ${type.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new type */}
          <div className="flex items-end gap-3 p-4 bg-sand-light rounded-lg">
            <div className="flex-1">
              <label htmlFor="new-type-label" className="block text-xs font-medium text-warm-gray-800 mb-1">
                Type Name
              </label>
              <input
                id="new-type-label"
                type="text"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="e.g. Mats"
                className="w-full px-3 py-2 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddType}
              className="tap-target inline-flex items-center gap-1.5 px-4 py-2 text-sm btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {typeError && <p className="text-sm text-error mt-2">{typeError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}
