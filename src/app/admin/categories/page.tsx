'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import type { MaterialCategoryOption, ProductTypeOption } from '@/services/categories';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';

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
        <div className="max-w-3xl py-lg">
          <SkeletonText lines={6} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className={`${pageTitleClasses} mb-2xs`}>
          Categories & Types
        </h1>
        <p className="text-base text-warm-gray-600 mb-lg">
          Manage material categories and product types. These appear in dropdown menus across the admin panel and catalogue filters.
        </p>

        {/* Material Categories */}
        <section className="mb-block">
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-sm">
            Material Categories
          </h2>
          <p className="text-base text-warm-gray-600 mb-sm">
            Each category has a code initial used in product codes (e.g. P for Pandanus → P-J-1).
          </p>

          {/* Existing categories */}
          <div className="space-y-2xs mb-sm">
            {materialCategories.map((cat) => (
              <div key={cat.value} className="flex items-center justify-between px-sm py-xs bg-white border border-sand rounded-lg">
                <div className="flex items-center gap-xs">
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
                  className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-error rounded"
                  aria-label={`Delete ${cat.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div className="flex flex-wrap items-end gap-xs p-sm bg-sand-light rounded-lg">
            <FormField label="Category Name" htmlFor="new-cat-label" className="flex-1 min-w-[140px]">
              <input
                type="text"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="e.g. Coconut Shell"
                className={inputClasses}
              />
            </FormField>
            <FormField label="Code Initial" htmlFor="new-cat-initial" className="w-24">
              <input
                type="text"
                value={newCatInitial}
                onChange={(e) => setNewCatInitial(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="C"
                maxLength={3}
                className={`${inputClasses} font-mono uppercase`}
              />
            </FormField>
            <Button size="sm" onClick={handleAddCategory}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {catError && <p className="text-sm text-error mt-2xs">{catError}</p>}
        </section>

        {/* Product Types */}
        <section>
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-sm">
            Product Types
          </h2>
          <p className="text-base text-warm-gray-600 mb-sm">
            Types of products that can be assigned in the product form.
          </p>

          {/* Existing types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2xs mb-sm">
            {productTypes.map((type) => (
              <div key={type.value} className="flex items-center justify-between px-sm py-xs bg-white border border-sand rounded-lg">
                <div>
                  <p className="text-sm font-medium text-warm-gray-800">{type.label}</p>
                  <p className="text-xs text-warm-gray-400">{type.value}</p>
                </div>
                <button
                  onClick={() => handleDeleteType(type.value, type.label)}
                  className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-error rounded"
                  aria-label={`Delete ${type.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new type */}
          <div className="flex items-end gap-xs p-sm bg-sand-light rounded-lg">
            <FormField label="Type Name" htmlFor="new-type-label" className="flex-1">
              <input
                type="text"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="e.g. Mats"
                className={inputClasses}
              />
            </FormField>
            <Button size="sm" onClick={handleAddType}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {typeError && <p className="text-sm text-error mt-2xs">{typeError}</p>}
        </section>
      </div>
    </AdminLayout>
  );
}
