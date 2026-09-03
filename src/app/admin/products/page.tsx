'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Package, Eye, EyeOff } from 'lucide-react';
import type { Product } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ProductFormModal, type ProductFormData } from '@/components/admin/product-form-modal';
import type { MaterialCategoryOption, ProductTypeOption } from '@/services/categories';
import { SafeImage } from '@/components/ui/safe-image';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';
import { Select } from '@/components/ui/select';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { inputClasses } from '@/components/ui/form-field';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/price';

/** Row-shaped placeholder while the products table loads. */
function TableSkeleton() {
  return (
    <SkeletonRegion
      label="Loading products"
      className="bg-white rounded-lg shadow-card p-sm space-y-sm"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-sm">
          <Skeleton className="w-10 h-10 flex-shrink-0" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-4 w-20 hidden lg:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);
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

    // An unreachable backend also returns an empty list, which would otherwise
    // read as "no products yet". Check before showing that message.
    if (data.length === 0) {
      const { isBackendReachable } = await import('@/lib/api-client');
      setBackendDown(!(await isBackendReachable()));
    } else {
      setBackendDown(false);
    }

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

  // Publish / suspend without opening the form. An unpublished (suspended)
  // product stays in the admin but disappears from the public catalogue and
  // provenance pages. Flips only publishedFlag, then reloads.
  async function handleTogglePublished(product: Product) {
    const next = !product.publishedFlag;
    try {
      const { updateProduct } = await import('@/services/products');
      const result = await updateProduct(product.id, { publishedFlag: next });
      if (result === null) throw new Error('update failed');
      toastSuccess(`"${product.name}" ${next ? 'published' : 'suspended'}.`);
      loadProducts();
    } catch {
      toastError(`Failed to update "${product.name}". Please try again.`);
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
      let action: 'updated' | 'created';
      if (editingProduct) {
        const { updateProduct } = await import('@/services/products');
        await updateProduct(editingProduct.id, {
          ...data,
          dimensions: data.dimensions || null,
          careNotes: data.careNotes || null,
        });
        action = 'updated';
      } else {
        const { createProduct } = await import('@/services/products');
        await createProduct({
          ...data,
          dimensions: data.dimensions || null,
          careNotes: data.careNotes || null,
        });
        action = 'created';
      }
      setShowForm(false);
      setEditingProduct(null);
      // Await the reload so a failed refresh surfaces through this try/catch,
      // and only confirm success once the refreshed list has actually loaded.
      await loadProducts();
      toastSuccess(`"${data.name}" ${action}.`);
    } catch (err) {
      throw err;
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-md">
        <h1 className={pageTitleClasses}>Products</h1>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-xs mb-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or code..."
            aria-label="Search products by name or code"
            className={`${inputClasses} pl-lg`}
          />
        </div>

        {/* Material category filter */}
        <Select
          id="admin-material-filter"
          value={selectedMaterial || null}
          onChange={(val) => setSelectedMaterial(val || '')}
          options={materialOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
          placeholder="All materials"
          label="Filter by material category"
        />

        {/* Product type filter */}
        <Select
          id="admin-type-filter"
          value={selectedType || null}
          onChange={(val) => setSelectedType(val || '')}
          options={typeOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
          placeholder="All types"
          label="Filter by product type"
        />

        {/* Results count */}
        <span className="text-xs text-warm-gray-400">
          {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {loading ? <TableSkeleton /> : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            products.length > 0
              ? 'No products match your filters.'
              : backendDown
                ? `Could not load products from the backend at ${process.env.NEXT_PUBLIC_API_URL || '(no NEXT_PUBLIC_API_URL set)'}.`
                : 'No products yet.'
          }
          description={
            products.length > 0
              ? undefined
              : backendDown
                ? "Open the browser console: a CORS error means this origin is not in the backend's CORS_ALLOWED_ORIGINS. A connection error means the backend is down or asleep."
                : 'Click "Add Product" to create one.'
          }
          action={
            products.length > 0 ? undefined : (
              <Button size="sm" onClick={handleAdd}>
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand-light border-b border-sand">
              <tr>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 w-14">Image</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Code</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Name</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Material</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden md:table-cell">Type</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden lg:table-cell">Price</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600">Status</th>
                <th className="text-left px-sm py-xs font-medium text-warm-gray-600 hidden lg:table-cell">Created</th>
                <th className="text-right px-sm py-xs font-medium text-warm-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-sand-light/50 ${product.publishedFlag ? '' : 'opacity-60'}`}
                  >
                    <td className="px-sm py-2xs">
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
                    <td className="px-sm py-xs font-mono text-xs text-warm-gray-600">{product.productCode}</td>
                    <td className="px-sm py-xs font-medium text-warm-gray-800">{product.name}</td>
                    <td className="px-sm py-xs text-warm-gray-600 capitalize hidden md:table-cell">{product.materialCategory}</td>
                    <td className="px-sm py-xs text-warm-gray-600 capitalize hidden md:table-cell">{product.productType}</td>
                    <td className="px-sm py-xs text-warm-gray-600 hidden lg:table-cell">{formatPrice(product.wholesalePrice)}</td>
                    <td className="px-sm py-xs">
                      {product.publishedFlag ? (
                        <StatusBadge status="success" size="compact">Published</StatusBadge>
                      ) : (
                        <StatusBadge status="neutral" size="compact">Suspended</StatusBadge>
                      )}
                    </td>
                    <td className="px-sm py-xs text-warm-gray-400 text-xs hidden lg:table-cell">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-sm py-xs text-right">
                      <div className="flex items-center justify-end gap-2xs">
                        <button
                          onClick={() => handleTogglePublished(product)}
                          className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                          aria-label={
                            product.publishedFlag
                              ? `Suspend ${product.name} from the catalogue`
                              : `Publish ${product.name} to the catalogue`
                          }
                          title={product.publishedFlag ? 'Suspend from catalogue' : 'Publish to catalogue'}
                        >
                          {product.publishedFlag ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="tap-target p-2xs text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)}
                          className="tap-target p-2xs text-warm-gray-400 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
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
