'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import type { Product } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ProductFormModal, type ProductFormData } from '@/components/admin/product-form-modal';
import type { MaterialCategoryOption, ProductTypeOption } from '@/services/categories';
import { SafeImage } from '@/components/ui/safe-image';
import { useToast } from '@/components/ui/toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Options for dropdowns
  const [materialOptions, setMaterialOptions] = useState<MaterialCategoryOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<ProductTypeOption[]>([]);

  useEffect(() => { loadProducts(); loadCategories(); }, []);

  async function loadProducts() {
    const { getAllProducts } = await import('@/services/products');
    const data = await getAllProducts();
    setProducts(data);
    setLoading(false);
  }

  async function loadCategories() {
    const { getMaterialCategories, getProductTypes } = await import('@/services/categories');
    const [mats, types] = await Promise.all([getMaterialCategories(), getProductTypes()]);
    setMaterialOptions(mats);
    setTypeOptions(types);
  }

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedMaterial) {
      result = result.filter((p) => p.materialCategory === selectedMaterial);
    }

    if (selectedType) {
      result = result.filter((p) => p.productType === selectedType);
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.productCode.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, selectedMaterial, selectedType, searchQuery]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const { deleteProduct } = await import('@/services/products');
      await deleteProduct(id);
      toastSuccess(`"${name}" deleted.`);
      loadProducts();
    } catch {
      toastError(`Failed to delete "${name}". Please try again.`);
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingProduct(null);
    setShowForm(true);
  }

  async function handleSave(data: ProductFormData) {
    try {
      if (editingProduct) {
        const { updateProduct } = await import('@/services/products');
        await updateProduct(editingProduct.id, {
          ...data,
          dimensions: data.dimensions || null,
          careNotes: data.careNotes || null,
        });
        toastSuccess(`"${data.name}" updated.`);
      } else {
        const { createProduct } = await import('@/services/products');
        await createProduct({
          ...data,
          dimensions: data.dimensions || null,
          careNotes: data.careNotes || null,
        });
        toastSuccess(`"${data.name}" created.`);
      }
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      throw err;
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-medium text-deep-blue">Products</h1>
        <button
          onClick={handleAdd}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
          />
        </div>

        {/* Material category filter */}
        <select
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          <option value="">All materials</option>
          {materialOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Product type filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          <option value="">All types</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Results count */}
        <span className="text-xs text-warm-gray-400">
          {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 w-14">Image</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">Material</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden lg:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-medium text-warm-gray-600 hidden lg:table-cell">Created</th>
                <th className="text-right px-4 py-3 font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-warm-gray-400">
                    {products.length === 0 ? 'No products yet. Click "Add Product" to create one.' : 'No products match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-sand-light/50">
                    <td className="px-4 py-2">
                      <div className="w-10 h-10 relative rounded overflow-hidden bg-sand-light flex-shrink-0">
                        <SafeImage
                          src={product.imageUrls[0] || null}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-warm-gray-600">{product.productCode}</td>
                    <td className="px-4 py-3 font-medium text-warm-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-warm-gray-600 capitalize hidden md:table-cell">{product.materialCategory}</td>
                    <td className="px-4 py-3 text-warm-gray-600 capitalize hidden md:table-cell">{product.productType}</td>
                    <td className="px-4 py-3 text-warm-gray-600 hidden lg:table-cell">A${product.wholesalePrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-warm-gray-400 text-xs hidden lg:table-cell">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="tap-target p-2 text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)}
                          className="tap-target p-2 text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                          aria-label={`Delete ${product.name}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
}
