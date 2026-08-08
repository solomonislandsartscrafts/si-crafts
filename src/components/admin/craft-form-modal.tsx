'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Craft, MaterialCategory, CulturalReviewStatus } from '@/types';
import { ImageUpload } from './image-upload';
import { getMaterialCategories, type MaterialCategoryOption } from '@/services/categories';
import { singleAltError } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useToast } from '@/components/ui/toast';
import { useModalA11y } from '@/lib/use-modal-a11y';interface CraftFormModalProps {
  craft: Craft | null; // null = create mode
  onClose: () => void;
  onSave: (data: CraftFormData) => Promise<void>;
}

export interface CraftFormData {
  name: string;
  slug: string;
  description: string;
  materialCategory: MaterialCategory;
  culturalContext: string;
  culturalContextReviewFlag: CulturalReviewStatus;
  processImageUrls: string[];
  processImageAlt: string;
}

export function CraftFormModal({ craft, onClose, onSave }: CraftFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();
  const modalRef = useModalA11y(true, onClose);
  const [materialOptions, setMaterialOptions] = useState<MaterialCategoryOption[]>([]);

  useEffect(() => {
    getMaterialCategories().then(setMaterialOptions);
  }, []);

  const [form, setForm] = useState<CraftFormData>({
    name: craft?.name ?? '',
    slug: craft?.slug ?? '',
    description: craft?.description ?? '',
    materialCategory: craft?.materialCategory ?? 'pandanus',
    culturalContext: craft?.culturalContext ?? '',
    culturalContextReviewFlag: craft?.culturalContextReviewFlag ?? 'unreviewed',
    processImageUrls: craft?.processImageUrls ?? [],
    processImageAlt: craft?.processImageAlt ?? '',
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!craft) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }));
    }
  }, [form.name, craft]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.description.trim()) errs.description = 'Description is required';

    // The process photo cannot be saved without alt text.
    const processAltError = singleAltError(
      form.processImageUrls[0] ?? '',
      form.processImageAlt,
      'process photo'
    );
    if (processAltError) errs.processImageAlt = processAltError;

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

  function handleChange(field: keyof CraftFormData, value: string | string[]) {
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
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="craft-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2 id="craft-form-title" className="font-heading text-xl font-medium text-deep-blue">
            {craft ? 'Edit Craft' : 'Add Craft'}
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
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Save error banner */}
          {saveError && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-md p-3" role="alert" aria-live="assertive">
              {saveError}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="craft-name" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Name *
            </label>
            <input
              id="craft-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.name ? 'craft-name-error' : undefined}
            />
            {errors.name && <p id="craft-name-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.name}</p>}
          </div>

          {/* Material Category */}
          <div>
            <label htmlFor="craft-material" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Material Category *
            </label>
            <select
              id="craft-material"
              value={form.materialCategory}
              onChange={(e) => handleChange('materialCategory', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            >
              {materialOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="craft-description" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Description *
            </label>
            <textarea
              id="craft-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
              aria-describedby={errors.description ? 'craft-desc-error' : undefined}
            />
            {errors.description && <p id="craft-desc-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.description}</p>}
          </div>

          {/* Cultural Context */}
          <div>
            <label htmlFor="craft-cultural" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Cultural Context
            </label>
            <textarea
              id="craft-cultural"
              value={form.culturalContext}
              onChange={(e) => handleChange('culturalContext', e.target.value)}
              rows={3}
              placeholder="Describe the cultural significance of this craft..."
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
            />
          </div>

          {/* Cultural Review Flag */}
          <div className="flex items-center gap-3">
            <input
              id="craft-cultural-review"
              type="checkbox"
              checked={form.culturalContextReviewFlag === 'reviewed'}
              onChange={(e) =>
                handleChange('culturalContextReviewFlag', e.target.checked ? 'reviewed' : 'unreviewed')
              }
              className="w-4 h-4 rounded border-sand-dark text-ocean focus:ring-ocean"
            />
            <label htmlFor="craft-cultural-review" className="text-sm text-warm-gray-800">
              Cultural context reviewed by cultural partner
            </label>
          </div>

          {/* Process Image */}
          <div>
            <ImageUpload
              value={form.processImageUrls[0] ?? ''}
              onChange={(url) => {
                const rest = form.processImageUrls.slice(1);
                handleChange('processImageUrls', url ? [url, ...rest] : rest);
              }}
              altText={form.processImageAlt}
              onAltTextChange={(alt) => handleChange('processImageAlt', alt)}
              label="Process Photo"
              aspectHint="4:3 landscape"
              maxWidth={1200}
              quality={0.8}
            />
            {errors.processImageAlt && (
              <p className="text-sm text-error mt-1" aria-live="assertive">{errors.processImageAlt}</p>
            )}
          </div>

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
              className="tap-target px-6 py-3 btn-primary"
            >
              {saving ? 'Saving...' : craft ? 'Update Craft' : 'Create Craft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
