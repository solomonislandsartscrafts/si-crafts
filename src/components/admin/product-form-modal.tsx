'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product, MaterialCategory, ProductType, Maker, Craft } from '@/types';
import { getAllMakers } from '@/services/makers';
import { getAllCrafts } from '@/services/crafts';
import { getAllProducts, validateProductCode } from '@/services/products';
import { ImageUpload } from './image-upload';
import { RichTextEditor } from './rich-text-editor';

interface ProductFormModalProps {
  product: Product | null; // null = create mode
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}

export interface ProductFormData {
  productCode: string;
  name: string;
  slug: string;
  description: string;
  materialCategory: MaterialCategory;
  productType: ProductType;
  makerId: string;
  craftId: string;
  imageUrls: string[];
  dimensions: string;
  careNotes: string;
  wholesalePrice: number;
}

const MATERIAL_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: 'pandanus', label: 'Pandanus' },
  { value: 'wood', label: 'Wood' },
  { value: 'shells', label: 'Shells' },
  { value: 'bush-twine', label: 'Bush-twine' },
];

const MATERIAL_INITIALS: Record<MaterialCategory, string> = {
  pandanus: 'P',
  wood: 'W',
  shells: 'S',
  'bush-twine': 'B',
};

const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: 'bags', label: 'Bags' },
  { value: 'purses', label: 'Purses' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'trays', label: 'Trays' },
  { value: 'fans', label: 'Fans' },
  { value: 'bowls', label: 'Bowls' },
  { value: 'ornaments', label: 'Ornaments' },
  { value: 'carvings', label: 'Carvings' },
  { value: 'baskets', label: 'Baskets' },
  { value: 'brooches', label: 'Brooches' },
  { value: 'kits', label: 'Kits' },
];

/**
 * Generate the next product code for a given material + maker combo.
 * Pattern: {P|W|S}-{MAKER_INITIAL}-{next_number}
 */
function generateNextCode(
  materialCategory: MaterialCategory,
  makerId: string,
  makers: Maker[],
  existingProducts: Product[]
): string {
  const materialInit = MATERIAL_INITIALS[materialCategory];
  const maker = makers.find((m) => m.id === makerId);
  if (!maker) return '';

  // Get maker initial(s) — first letter of surname (last word in name)
  const nameParts = maker.name.split(' ');
  const makerInit = nameParts[nameParts.length - 1][0].toUpperCase();

  const prefix = `${materialInit}-${makerInit}-`;

  // Find highest existing number for this prefix
  const existingNumbers = existingProducts
    .filter((p) => p.productCode.startsWith(prefix))
    .map((p) => {
      const num = parseInt(p.productCode.slice(prefix.length), 10);
      return isNaN(num) ? 0 : num;
    });

  const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${prefix}${nextNum}`;
}

export function ProductFormModal({ product, onClose, onSave }: ProductFormModalProps) {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ProductFormData>({
    productCode: product?.productCode ?? '',
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    materialCategory: product?.materialCategory ?? 'pandanus',
    productType: product?.productType ?? 'bags',
    makerId: product?.makerId ?? '',
    craftId: product?.craftId ?? '',
    imageUrls: product?.imageUrls ?? [],
    dimensions: product?.dimensions ?? '',
    careNotes: product?.careNotes ?? '',
    wholesalePrice: product?.wholesalePrice ?? 0,
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([getAllMakers(), getAllCrafts(), getAllProducts()])
      .then(([makersData, craftsData, productsData]) => {
        if (mounted) {
          setMakers(makersData);
          setCrafts(craftsData);
          setExistingProducts(productsData);
        }
      })
      .catch((err) => {
        if (mounted) setSaveError(`Failed to load form data: ${err instanceof Error ? err.message : 'unknown error'}`);
      });
    return () => { mounted = false; };
  }, []);

  // Auto-generate product code when material or maker changes (create mode only)
  useEffect(() => {
    if (!product && form.makerId && form.materialCategory && makers.length > 0) {
      const nextCode = generateNextCode(form.materialCategory, form.makerId, makers, existingProducts);
      if (nextCode) {
        setForm((prev) => ({ ...prev, productCode: nextCode }));
      }
    }
  }, [form.materialCategory, form.makerId, makers, existingProducts, product]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!product) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }));
    }
  }, [form.name, product]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const code = form.productCode.trim();

    if (!code) {
      errs.productCode = 'Product code is required';
    } else if (!validateProductCode(code)) {
      errs.productCode = 'Expected format: {P|W|S|B}-{INITIALS}-{number} (e.g. P-J-1, W-PK-3, B-J-1)';
    } else {
      // Check uniqueness — exclude current product when editing
      const duplicate = existingProducts.find(
        (p) => p.productCode === code && p.id !== product?.id
      );
      if (duplicate) {
        errs.productCode = `Code "${code}" already exists. Choose a different code.`;
      }
    }

    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.makerId) errs.makerId = 'Maker is required';
    if (!form.craftId) errs.craftId = 'Craft is required';
    if (form.wholesalePrice <= 0) errs.wholesalePrice = 'Price must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(form);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof ProductFormData, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleDismiss() {
    if (!saving) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-blue/50" onClick={handleDismiss}>
      <div
        className="bg-white rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2 id="product-form-title" className="font-heading text-xl font-bold text-deep-blue">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={handleDismiss}
            disabled={saving}
            className="tap-target p-2 text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Save error banner */}
          {saveError && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
              {saveError}
            </div>
          )}

          {/* Material + Maker first (so code auto-generates) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-material" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Material Category *
              </label>
              <select
                id="product-material"
                value={form.materialCategory}
                onChange={(e) => handleChange('materialCategory', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              >
                {MATERIAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-maker" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Maker *
              </label>
              <select
                id="product-maker"
                value={form.makerId}
                onChange={(e) => handleChange('makerId', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.makerId ? 'product-maker-error' : undefined}
              >
                <option value="">Select a maker...</option>
                {makers.map((maker) => (
                  <option key={maker.id} value={maker.id}>{maker.name}</option>
                ))}
              </select>
              {errors.makerId && <p id="product-maker-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.makerId}</p>}
            </div>
          </div>

          {/* Product Code — auto-generated but editable */}
          <div>
            <label htmlFor="product-code" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Product Code *
            </label>
            <input
              id="product-code"
              type="text"
              value={form.productCode}
              onChange={(e) => handleChange('productCode', e.target.value.toUpperCase())}
              placeholder="P-J-1"
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.productCode ? 'product-code-error' : 'product-code-hint'}
            />
            {errors.productCode ? (
              <p id="product-code-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.productCode}</p>
            ) : (
              <p id="product-code-hint" className="text-xs text-warm-gray-400 mt-1">
                {!product ? 'Auto-generated from material + maker. You can edit it.' : 'Format: P-J-1, B-J-1 (material initial - maker initial - number)'}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Name *
            </label>
            <input
              id="product-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.name ? 'product-name-error' : undefined}
            />
            {errors.name && <p id="product-name-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Description *
            </label>
            <textarea
              id="product-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
              aria-describedby={errors.description ? 'product-desc-error' : undefined}
            />
            {errors.description && <p id="product-desc-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.description}</p>}
          </div>

          {/* Type + Craft (row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-type" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Product Type *
              </label>
              <select
                id="product-type"
                value={form.productType}
                onChange={(e) => handleChange('productType', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              >
                {PRODUCT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="product-craft" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Craft *
              </label>
              <select
                id="product-craft"
                value={form.craftId}
                onChange={(e) => handleChange('craftId', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.craftId ? 'product-craft-error' : undefined}
              >
                <option value="">Select a craft...</option>
                {crafts.map((craft) => (
                  <option key={craft.id} value={craft.id}>{craft.name}</option>
                ))}
              </select>
              {errors.craftId && <p id="product-craft-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.craftId}</p>}
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Wholesale Price (SBD, whole number) *
            </label>
            <input
              id="product-price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.wholesalePrice || ''}
              onChange={(e) => handleChange('wholesalePrice', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.wholesalePrice ? 'product-price-error' : undefined}
            />
            {errors.wholesalePrice && <p id="product-price-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.wholesalePrice}</p>}
          </div>

          {/* Dimensions */}
          <div>
            <label htmlFor="product-dimensions" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Dimensions
            </label>
            <input
              id="product-dimensions"
              type="text"
              value={form.dimensions}
              onChange={(e) => handleChange('dimensions', e.target.value)}
              placeholder="30cm × 20cm × 10cm"
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
          </div>

          {/* Care Notes — rich text */}
          <RichTextEditor
            value={form.careNotes}
            onChange={(html) => handleChange('careNotes', html)}
            label="Care Notes"
            placeholder="How should the owner care for this piece?"
            minRows={5}
          />

          {/* Product Image */}
          <ImageUpload
            value={form.imageUrls[0] ?? ''}
            onChange={(url) => {
              const rest = form.imageUrls.slice(1);
              handleChange('imageUrls', url ? [url, ...rest] : rest);
            }}
            label="Product Photo"
            aspectHint="1:1 square"
            maxWidth={1200}
            quality={0.8}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
            <button
              type="button"
              onClick={handleDismiss}
              disabled={saving}
              className="tap-target px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="tap-target px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
