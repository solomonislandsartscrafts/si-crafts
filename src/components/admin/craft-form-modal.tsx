'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Craft, MaterialCategory, CulturalReviewStatus } from '@/types';
import { ImageUpload } from './image-upload';
import { getMaterialCategories, type MaterialCategoryOption } from '@/services/categories';
import { singleAltError } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useToast } from '@/components/ui/toast';
import { Select } from '@/components/ui/select';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

interface CraftFormModalProps {
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
            <div className="bg-error/10 border border-error/20 text-error text-base rounded-md p-3" role="alert" aria-live="assertive">
              {saveError}
            </div>
          )}

          {/* Name */}
          <FormField label="Name *" htmlFor="craft-name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClasses}
              data-error={errors.name ? 'true' : undefined}
            />
          </FormField>

          {/* Material Category */}
          <div>
            <label htmlFor="craft-material" className="block text-base font-medium text-warm-gray-800 mb-1">
              Material Category *
            </label>
            <Select
              id="craft-material"
              value={form.materialCategory || null}
              onChange={(val) => handleChange('materialCategory', val || '')}
              options={materialOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
              placeholder="Select material..."
              label="Material category"
              className="w-full"
            />
          </div>

          {/* Description */}
          <FormField label="Description *" htmlFor="craft-description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`${inputClasses} resize-y`}
              data-error={errors.description ? 'true' : undefined}
            />
          </FormField>

          {/* Cultural Context */}
          <FormField label="Cultural Context" htmlFor="craft-cultural">
            <textarea
              value={form.culturalContext}
              onChange={(e) => handleChange('culturalContext', e.target.value)}
              rows={3}
              placeholder="Describe the cultural significance of this craft..."
              className={`${inputClasses} resize-y`}
            />
          </FormField>

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
            <label htmlFor="craft-cultural-review" className="text-base text-warm-gray-800">
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
              <p className="text-base text-error mt-1" role="alert" aria-live="assertive">{errors.processImageAlt}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {craft ? 'Update Craft' : 'Create Craft'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
