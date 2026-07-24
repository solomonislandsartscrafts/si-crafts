'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ProductFormModal, type ProductFormData } from '@/components/admin/product-form-modal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const { getAllProducts } = await import('@/services/products');
    const data = await getAllProducts();
    setProducts(data);
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    const { deleteProduct } = await import('@/services/products');
    await deleteProduct(id);
    loadProducts();
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
      } else {
        const { createProduct } = await import('@/services/products');
        await createProduct({
          ...data,
          dimensions: data.dimensions || null,
          careNotes: data.careNotes || null,
        });
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
        <h1 className="font-heading text-2xl font-bold text-deep-blue">Products</h1>
        <button
          onClick={handleAdd}
          className="tap-target inline-flex items-center gap-2 px-4 py-2 bg-ocean hover:bg-ocean-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? <p className="text-warm-gray-400">Loading...</p> : (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
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
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-sand-light/50">
                  <td className="px-4 py-3 font-mono text-xs text-warm-gray-600">{product.productCode}</td>
                  <td className="px-4 py-3 font-medium text-warm-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-warm-gray-600 capitalize hidden md:table-cell">{product.materialCategory}</td>
                  <td className="px-4 py-3 text-warm-gray-600 capitalize hidden md:table-cell">{product.productType}</td>
                  <td className="px-4 py-3 text-warm-gray-600 hidden lg:table-cell">A${Math.round(product.wholesalePrice)}</td>
                  <td className="px-4 py-3 text-warm-gray-400 text-xs hidden lg:table-cell">
                    {new Date(product.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              ))}
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
