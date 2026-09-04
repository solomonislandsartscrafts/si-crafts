'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Product, MaterialCategory, ProductType, Maker, Craft } from '@/types';
import { getAllMakers } from '@/services/makers';
import { getAllCrafts } from '@/services/crafts';
import { getAllProducts, validateProductCode } from '@/services/products';
import { getMaterialCategories, getProductTypes, type MaterialCategoryOption, type ProductTypeOption } from '@/services/categories';
import { MultiImageUpload } from './multi-image-upload';
import { Select } from '@/components/ui/select';
import { RichTextEditor } from './rich-text-editor';
import { altTextError, htmlHasImageMissingAlt } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useToast } from '@/components/ui/toast';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

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
  imageAlts: string[];
  dimensions: string;
  careNotes: string;
  wholesalePrice: number;
  featured: boolean;
}

/**
 * Generate the next product code for a given material + maker combo.
 * Pattern: {INITIAL}-{MAKER_INITIAL}-{next_number}
 */
function generateNextCode(
  materialCategory: MaterialCategory,
  makerId: string,
  makers: Maker[],
  existingProducts: Product[],
  materialCategories: MaterialCategoryOption[]
): string {
  const cat = materialCategories.find((c) => c.value === materialCategory);
  const materialInit = cat?.codeInitial ?? materialCategory[0]?.toUpperCase() ?? 'X';
  const maker = makers.find((m) => m.id === makerId);
  if (!maker) return '';

  const nameParts = maker.name.split(' ');
  const makerInit = nameParts[nameParts.length - 1][0].toUpperCase();

  const prefix = `${materialInit}-${makerInit}-`;

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
  const [materialCategories, setMaterialCategories] = useState<MaterialCategoryOption[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<ProductTypeOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();
  const modalRef = useModalA11y(true, onClose);

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
    imageAlts: product?.imageAlts ?? [],
    dimensions: product?.dimensions ?? '',
    careNotes: product?.careNotes ?? '',
    wholesalePrice: product?.wholesalePrice ?? 0,
    featured: product?.featured ?? false,
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([getAllMakers(), getAllCrafts(), getAllProducts(), getMaterialCategories(), getProductTypes()])
      .then(([makersData, craftsData, productsData, matCats, prodTypes]) => {
        if (mounted) {
          setMakers(makersData);
          setCrafts(craftsData);
          setExistingProducts(productsData);
          setMaterialCategories(matCats);
          setProductTypeOptions(prodTypes);
        }
      })
      .catch((err) => {
        if (mounted) setSaveError(`Failed to load form data: ${err instanceof Error ? err.message : 'unknown error'}`);
      });
    return () => { mounted = false; };
  }, []);

  // Auto-generate product code when material or maker changes (create mode only)
  useEffect(() => {
    if (!product && form.makerId && form.materialCategory && makers.length > 0 && materialCategories.length > 0) {
      const nextCode = generateNextCode(form.materialCategory, form.makerId, makers, existingProducts, materialCategories);
      if (nextCode) {
        setForm((prev) => ({ ...prev, productCode: nextCode }));
      }
    }
  }, [form.materialCategory, form.makerId, makers, existingProducts, product, materialCategories]);

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

    // Every photo must have alt text before anything is saved.
    const altError = altTextError(form.imageUrls, form.imageAlts);
    if (altError) errs.imageAlts = altError;
    if (htmlHasImageMissingAlt(form.careNotes)) {
      errs.careNotes = 'An image in Care Notes has no alt text. Remove it or re-insert it with a description.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toastError('Please fix the highlighted fields before saving.');
      scrollToFirstError(formRef.current);
      return;
    }
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

  function handleChange(field: keyof ProductFormData, value: string | number | boolean | string[]) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-deep-blue/50" onClick={handleDismiss}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="product-form-title" className="font-heading text-xl font-medium text-deep-blue">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={handleDismiss}
            disabled={saving}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-md py-sm space-y-sm">
          {/* Save error banner */}
          {saveError && (
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-xs" role="alert" aria-live="assertive">
              {saveError}
            </div>
          )}

          {/* Material + Maker first (so code auto-generates) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <div>
              <label htmlFor="product-material" className="block text-base font-medium text-warm-gray-800 mb-3xs">
                Material Category *
              </label>
              <Select
                id="product-material"
                value={form.materialCategory || null}
                onChange={(val) => handleChange('materialCategory', val || '')}
                options={materialCategories.map((opt) => ({ value: opt.value, label: opt.label }))}
                placeholder="Select material..."
                label="Material category"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="product-maker" className="block text-base font-medium text-warm-gray-800 mb-3xs">
                Maker *
              </label>
              <Select
                id="product-maker"
                value={form.makerId || null}
                onChange={(val) => handleChange('makerId', val || '')}
                options={makers.map((maker) => ({ value: maker.id, label: maker.name }))}
                placeholder="Select a maker..."
                label="Maker"
                className="w-full"
              />
              {errors.makerId && <p id="product-maker-error" className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.makerId}</p>}
            </div>
          </div>

          {/* Product Code — auto-generated but editable */}
          <FormField
            label="Product Code *"
            htmlFor="product-code"
            error={errors.productCode}
            helperText={
              !product
                ? 'Auto-generated from material + maker. You can edit it.'
                : 'Format: P-J-1, B-J-1 (material initial - maker initial - number)'
            }
          >
            <input
              type="text"
              value={form.productCode}
              onChange={(e) => handleChange('productCode', e.target.value.toUpperCase())}
              placeholder="P-J-1"
              className={`${inputClasses} font-mono`}
              data-error={errors.productCode ? 'true' : undefined}
            />
          </FormField>

          {/* Name */}
          <FormField label="Name *" htmlFor="product-name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClasses}
              data-error={errors.name ? 'true' : undefined}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description *" htmlFor="product-description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`${inputClasses} resize-y`}
              data-error={errors.description ? 'true' : undefined}
            />
          </FormField>

          {/* Type + Craft (row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <div>
              <label htmlFor="product-type" className="block text-base font-medium text-warm-gray-800 mb-3xs">
                Product Type *
              </label>
              <Select
                id="product-type"
                value={form.productType || null}
                onChange={(val) => handleChange('productType', val || '')}
                options={productTypeOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
                placeholder="Select type..."
                label="Product type"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="product-craft" className="block text-base font-medium text-warm-gray-800 mb-3xs">
                Craft *
              </label>
              <Select
                id="product-craft"
                value={form.craftId || null}
                onChange={(val) => handleChange('craftId', val || '')}
                options={crafts.map((craft) => ({ value: craft.id, label: craft.name }))}
                placeholder="Select a craft..."
                label="Craft"
                className="w-full"
              />
              {errors.craftId && <p id="product-craft-error" className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.craftId}</p>}
            </div>
          </div>

          {/* Price */}
          <FormField label="Wholesale Price (AUD) *" htmlFor="product-price" error={errors.wholesalePrice}>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.wholesalePrice || ''}
              onChange={(e) => handleChange('wholesalePrice', parseFloat(e.target.value) || 0)}
              className={inputClasses}
              data-error={errors.wholesalePrice ? 'true' : undefined}
            />
          </FormField>

          {/* Dimensions */}
          <FormField label="Dimensions" htmlFor="product-dimensions">
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) => handleChange('dimensions', e.target.value)}
              placeholder="30cm × 20cm × 10cm"
              className={inputClasses}
            />
          </FormField>

          {/* Care Notes — rich text */}
          <div>
            <RichTextEditor
              value={form.careNotes}
              onChange={(html) => handleChange('careNotes', html)}
              label="Care Notes"
              placeholder="How should the owner care for this piece?"
              minRows={5}
            />
            {errors.careNotes && (
              <p className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.careNotes}</p>
            )}
          </div>

          {/* Product Images — multi-image gallery */}
          <div>
            <MultiImageUpload
              value={form.imageUrls}
              onChange={(urls) => handleChange('imageUrls', urls)}
              altTexts={form.imageAlts}
              onAltTextsChange={(alts) => handleChange('imageAlts', alts)}
              label="Product Photos"
              aspectHint="3:2 landscape (1200×800px) for best slideshow display"
              maxWidth={1200}
              quality={0.8}
            />
            {errors.imageAlts && (
              <p className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.imageAlts}</p>
            )}
          </div>

          {/* Featured on Homepage toggle */}
          <div className="flex items-center gap-xs py-xs px-sm bg-sand-light rounded-md">
            <label htmlFor="product-featured" className="flex items-center gap-xs cursor-pointer flex-1">
              <input
                id="product-featured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="w-5 h-5 rounded border-sand-dark text-ocean focus-visible:ring-2 focus-visible:ring-ocean accent-ocean"
              />
              <div>
                <span className="text-base font-medium text-warm-gray-800">Featured on Homepage</span>
                <p className="text-xs text-warm-gray-400 mt-3xs">
                  Show this product in the hero gallery slideshow (max 3 recommended).
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
