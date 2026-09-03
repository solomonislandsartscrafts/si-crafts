'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Maker, ConsentStatus, CulturalReviewStatus } from '@/types';
import { getAllCrafts } from '@/services/crafts';
import type { Craft } from '@/types';
import { ImageUpload } from './image-upload';
import { singleAltError } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { useToast } from '@/components/ui/toast';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

interface MakerFormModalProps {
  maker: Maker | null; // null = create mode
  onClose: () => void;
  onSave: (data: MakerFormData) => Promise<void>;
}

export interface MakerFormData {
  name: string;
  slug: string;
  village: string;
  province: string;
  island: string;
  portraitUrl: string;
  portraitAlt: string;
  story: string;
  storyCulturalReviewFlag: CulturalReviewStatus;
  craftId: string;
  consentStatus: ConsentStatus;
  age: number | null;
  yearsActive: number | null;
}

export function MakerFormModal({ maker, onClose, onSave }: MakerFormModalProps) {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [saving, setSaving] = useState(false);
  const modalRef = useModalA11y(true, onClose);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();

  const [form, setForm] = useState<MakerFormData>({
    name: maker?.name ?? '',
    slug: maker?.slug ?? '',
    village: maker?.village ?? '',
    province: maker?.province ?? '',
    island: maker?.island ?? '',
    portraitUrl: maker?.portraitUrl ?? '',
    portraitAlt: maker?.portraitAlt ?? '',
    story: maker?.story ?? '',
    storyCulturalReviewFlag: maker?.storyCulturalReviewFlag ?? 'unreviewed',
    craftId: maker?.craftId ?? '',
    consentStatus: maker?.consentStatus ?? 'Not Signed',
    age: maker?.age ?? null,
    yearsActive: maker?.yearsActive ?? null,
  });

  useEffect(() => {
    let mounted = true;
    getAllCrafts()
      .then((data) => { if (mounted) setCrafts(data); })
      .catch((err) => { if (mounted) setSaveError(`Failed to load crafts: ${err instanceof Error ? err.message : 'unknown error'}`); });
    return () => { mounted = false; };
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!maker) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }));
    }
  }, [form.name, maker]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.village.trim()) errs.village = 'Village is required';
    if (!form.province.trim()) errs.province = 'Province is required';
    if (!form.island.trim()) errs.island = 'Island is required';
    if (!form.craftId) errs.craftId = 'Craft is required';

    // A portrait cannot be saved without alt text.
    const portraitAltError = singleAltError(form.portraitUrl, form.portraitAlt, 'portrait photo');
    if (portraitAltError) errs.portraitAlt = portraitAltError;

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

  function handleChange(field: keyof MakerFormData, value: string) {
    let parsedValue: string | number | null = value;
    
    // Parse number fields
    if (field === 'age' || field === 'yearsActive') {
      parsedValue = value.trim() === '' ? null : parseInt(value, 10);
    }
    
    setForm((prev) => ({ ...prev, [field]: parsedValue }));
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
        aria-labelledby="maker-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="maker-form-title" className="font-heading text-xl font-medium text-deep-blue">
            {maker ? 'Edit Maker' : 'Add Maker'}
          </h2>
          <button
            onClick={handleDismiss}
            disabled={saving}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean disabled:opacity-50"
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

          {/* Name */}
          <FormField label="Name *" htmlFor="maker-name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClasses}
              data-error={errors.name ? 'true' : undefined}
            />
          </FormField>

          {/* Village + Province (row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <FormField label="Village *" htmlFor="maker-village" error={errors.village}>
              <input
                type="text"
                value={form.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className={inputClasses}
                data-error={errors.village ? 'true' : undefined}
              />
            </FormField>
            <FormField label="Province *" htmlFor="maker-province" error={errors.province}>
              <input
                type="text"
                value={form.province}
                onChange={(e) => handleChange('province', e.target.value)}
                className={inputClasses}
                data-error={errors.province ? 'true' : undefined}
              />
            </FormField>
          </div>

          {/* Island */}
          <FormField label="Island *" htmlFor="maker-island" error={errors.island}>
            <input
              type="text"
              value={form.island}
              onChange={(e) => handleChange('island', e.target.value)}
              className={inputClasses}
              data-error={errors.island ? 'true' : undefined}
            />
          </FormField>

          {/* Craft */}
          <div>
            <label htmlFor="maker-craft" className="block text-base font-medium text-warm-gray-800 mb-3xs">
              Craft *
            </label>
            <Select
              id="maker-craft"
              value={form.craftId || null}
              onChange={(val) => handleChange('craftId', val || '')}
              options={crafts.map((craft) => ({ value: craft.id, label: craft.name }))}
              placeholder="Select a craft..."
              label="Craft"
              className="w-full"
            />
            {errors.craftId && <p id="maker-craft-error" className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.craftId}</p>}
          </div>

          {/* Age + Years Active (row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <FormField label="Age" htmlFor="maker-age">
              <input
                type="number"
                min="0"
                max="120"
                value={form.age ?? ''}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g. 42"
                className={inputClasses}
              />
            </FormField>
            <FormField label="Years Crafting" htmlFor="maker-years-active">
              <input
                type="number"
                min="0"
                max="100"
                value={form.yearsActive ?? ''}
                onChange={(e) => handleChange('yearsActive', e.target.value)}
                placeholder="e.g. 34"
                className={inputClasses}
              />
            </FormField>
          </div>

          {/* Portrait */}
          <div>
            <ImageUpload
              value={form.portraitUrl}
              onChange={(url) => handleChange('portraitUrl', url)}
              altText={form.portraitAlt}
              onAltTextChange={(alt) => handleChange('portraitAlt', alt)}
              label="Portrait Photo"
              aspectHint="3:4 portrait orientation"
              maxWidth={800}
              quality={0.82}
            />
            {errors.portraitAlt && (
              <p className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.portraitAlt}</p>
            )}
          </div>

          {/* Story */}
          <FormField label="Story (first-person voice)" htmlFor="maker-story">
            <textarea
              value={form.story}
              onChange={(e) => handleChange('story', e.target.value)}
              rows={4}
              placeholder="I learned to weave from my grandmother..."
              className={`${inputClasses} resize-y`}
            />
          </FormField>

          {/* Cultural Review Flag */}
          <div className="flex items-center gap-xs">
            <input
              id="maker-cultural-review"
              type="checkbox"
              checked={form.storyCulturalReviewFlag === 'reviewed'}
              onChange={(e) =>
                handleChange('storyCulturalReviewFlag', e.target.checked ? 'reviewed' : 'unreviewed')
              }
              className="w-4 h-4 rounded border-sand-dark text-ocean focus:ring-ocean"
            />
            <label htmlFor="maker-cultural-review" className="text-base text-warm-gray-800">
              Story reviewed by cultural partner
            </label>
          </div>

          {/* Consent Status */}
          <div className="bg-sand-light rounded-md p-sm">
            <label htmlFor="maker-consent" className="block text-base font-medium text-warm-gray-800 mb-2xs">
              Consent Status
            </label>
            <Select
              id="maker-consent"
              value={form.consentStatus || null}
              onChange={(val) => handleChange('consentStatus', val || 'Not Signed')}
              options={[
                { value: 'Signed', label: 'Signed' },
                { value: 'Not Signed', label: 'Not Signed' },
              ]}
              placeholder="Select status..."
              label="Consent status"
              className="w-full"
            />
            <p className="text-xs text-warm-gray-400 mt-2xs">
              Setting consent to &quot;Signed&quot; will publish this maker and their products to the public site.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {maker ? 'Update Maker' : 'Create Maker'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
