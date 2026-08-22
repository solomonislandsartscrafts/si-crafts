'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { RetailStockist } from '@/types';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

interface RetailStockistFormModalProps {
  stockist: RetailStockist | null; // null = create mode
  onClose: () => void;
  onSave: (data: RetailStockistFormData) => Promise<void>;
}

export interface RetailStockistFormData {
  name: string;
  city: string;
  url: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  closed: string;
  sortOrder: number;
}

export function RetailStockistFormModal({
  stockist,
  onClose,
  onSave,
}: RetailStockistFormModalProps) {
  const [saving, setSaving] = useState(false);
  const modalRef = useModalA11y(true, onClose);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();

  const [form, setForm] = useState<RetailStockistFormData>({
    name: stockist?.name ?? '',
    city: stockist?.city ?? '',
    url: stockist?.url ?? '',
    address: stockist?.address ?? '',
    phone: stockist?.phone ?? '',
    email: stockist?.email ?? '',
    hours: stockist?.hours ?? '',
    closed: stockist?.closed ?? '',
    sortOrder: stockist?.sortOrder ?? 0,
  });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Shop name is required';
    if (form.url.trim() && !/^https?:\/\//i.test(form.url.trim())) {
      errs.url = 'Website must start with https:// or http://';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address';
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

  function handleChange(field: keyof RetailStockistFormData, value: string | number) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-blue/50"
      onClick={handleDismiss}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="retail-stockist-form-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2
            id="retail-stockist-form-title"
            className="font-heading text-lg font-semibold text-deep-blue"
          >
            {stockist ? 'Edit Stockist' : 'Add Stockist'}
          </h2>
          <button
            onClick={handleDismiss}
            className="tap-target p-2 text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {saveError && (
            <p
              className="text-base text-error bg-error/10 px-3 py-2 rounded"
              role="alert"
              aria-live="assertive"
            >
              {saveError}
            </p>
          )}

          <FormField label="Shop name *" htmlFor="rs-name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={inputClasses}
              data-error={errors.name ? 'true' : undefined}
              placeholder="e.g. Australian Museum"
            />
          </FormField>

          <FormField label="City" htmlFor="rs-city">
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={inputClasses}
              placeholder="e.g. Sydney"
            />
          </FormField>

          <FormField label="Website" htmlFor="rs-url" error={errors.url}>
            <input
              type="url"
              value={form.url}
              onChange={(e) => handleChange('url', e.target.value)}
              aria-invalid={Boolean(errors.url)}
              className={inputClasses}
              data-error={errors.url ? 'true' : undefined}
              placeholder="https://example.com/shop"
            />
          </FormField>

          <FormField label="Address" htmlFor="rs-address">
            <textarea
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              className={`${inputClasses} resize-y`}
              placeholder="1 William Street Sydney NSW 2010, Australia"
            />
          </FormField>

          <FormField label="Phone" htmlFor="rs-phone">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={inputClasses}
              placeholder="+61 (0)2 9320 6150"
            />
          </FormField>

          <FormField label="Email" htmlFor="rs-email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
              className={inputClasses}
              data-error={errors.email ? 'true' : undefined}
              placeholder="shop@example.com"
            />
          </FormField>

          <FormField label="Opening hours" htmlFor="rs-hours">
            <input
              type="text"
              value={form.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              className={inputClasses}
              placeholder="Open Daily 10am–5pm"
            />
          </FormField>

          <FormField label="Closed on" htmlFor="rs-closed">
            <input
              type="text"
              value={form.closed}
              onChange={(e) => handleChange('closed', e.target.value)}
              className={inputClasses}
              placeholder="Closed Christmas Day"
            />
          </FormField>

          <div>
            <FormField label="Sort Order" htmlFor="rs-sort-order">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', e.target.valueAsNumber || 0)}
                className={`${inputClasses} max-w-24`}
              />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-1">Lower numbers appear first.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {stockist ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
