'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { Supporter } from '@/types';
import { ImageUpload } from './image-upload';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

interface SupporterFormModalProps {
  supporter: Supporter | null; // null = create mode
  onClose: () => void;
  onSave: (data: SupporterFormData) => Promise<void>;
}

export interface SupporterFormData {
  name: string;
  logoUrl: string;
  logoAlt: string;
  href: string;
  sortOrder: number;
  active: boolean;
}

export function SupporterFormModal({ supporter, onClose, onSave }: SupporterFormModalProps) {
  const [saving, setSaving] = useState(false);
  const modalRef = useModalA11y(true, onClose);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();

  const [form, setForm] = useState<SupporterFormData>({
    name: supporter?.name ?? '',
    logoUrl: supporter?.logoUrl ?? '',
    logoAlt: supporter?.logoAlt ?? '',
    href: supporter?.href ?? '',
    sortOrder: supporter?.sortOrder ?? 0,
    // New supporters are shown by default; existing ones keep their state.
    active: supporter?.active ?? true,
  });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.logoUrl.trim()) errs.logoUrl = 'A logo is required — the banner skips entries without one';
    // Logo alt text is intentionally OPTIONAL here: a supporter logo is a
    // wordmark, and the banner falls back to the supporter name as the
    // accessible name (see SponsorLogo). Leaving it blank is the documented,
    // correct choice for a wordmark, so it must not block the save.
    if (form.href.trim() && !/^https?:\/\//i.test(form.href.trim())) {
      errs.href = 'Link must start with https://';
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

  function handleChange(field: keyof SupporterFormData, value: string | number | boolean) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-deep-blue/50"
      onClick={handleDismiss}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="supporter-form-title"
      >
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2
            id="supporter-form-title"
            className="font-heading text-lg font-semibold text-deep-blue"
          >
            {supporter ? 'Edit Supporter' : 'Add Supporter'}
          </h2>
          <button
            onClick={handleDismiss}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-md py-sm space-y-sm">
          {saveError && (
            <p
              className="text-base text-error bg-error/10 px-xs py-2xs rounded"
              role="alert"
              aria-live="assertive"
            >
              {saveError}
            </p>
          )}

          <FormField label="Supporter name *" htmlFor="sup-name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={inputClasses}
              data-error={errors.name ? 'true' : undefined}
              placeholder="e.g. Australian Volunteers Program"
            />
          </FormField>

          <FormField label="Website (optional)" htmlFor="sup-href" error={errors.href}>
            <input
              type="url"
              value={form.href}
              onChange={(e) => handleChange('href', e.target.value)}
              aria-invalid={Boolean(errors.href)}
              className={inputClasses}
              data-error={errors.href ? 'true' : undefined}
              placeholder="https://example.org"
            />
          </FormField>

          <div>
            <FormField label="Sort Order" htmlFor="sup-sort-order">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', e.target.valueAsNumber || 0)}
                className={`${inputClasses} max-w-24`}
              />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-3xs">Lower numbers appear first.</p>
          </div>

          <ImageUpload
            value={form.logoUrl}
            onChange={(url) => handleChange('logoUrl', url)}
            altText={form.logoAlt}
            onAltTextChange={(alt) => handleChange('logoAlt', alt)}
            label="Logo *"
            aspectHint="Wide or square, transparent PNG or SVG"
          />
          {errors.logoUrl && (
            <p className="text-base text-error mt-3xs" role="alert" aria-live="assertive">
              {errors.logoUrl}
            </p>
          )}
          <p className="text-xs text-warm-gray-400">
            Leave the alt text blank to use the supporter name, which is right for a wordmark.
          </p>

          {/* Shown on homepage toggle — suspend hides the logo without deleting */}
          <div className="flex items-center gap-xs py-xs px-sm bg-sand-light rounded-md">
            <label htmlFor="sup-active" className="flex items-center gap-xs cursor-pointer flex-1">
              <input
                id="sup-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="w-5 h-5 rounded border-sand-dark text-ocean focus:ring-2 focus:ring-ocean accent-ocean"
              />
              <div>
                <span className="text-base font-medium text-warm-gray-800">Shown on homepage</span>
                <p className="text-xs text-warm-gray-400 mt-3xs">
                  Uncheck to suspend this supporter — the logo is hidden from the homepage but kept
                  here so you can restore it later.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {supporter ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
