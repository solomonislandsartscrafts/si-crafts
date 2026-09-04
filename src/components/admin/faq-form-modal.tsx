'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { Faq } from '@/types';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

interface FaqFormModalProps {
  faq: Faq | null; // null = create mode
  onClose: () => void;
  onSave: (data: FaqFormData) => Promise<void>;
}

export interface FaqFormData {
  question: string;
  answer: string;
  sortOrder: number;
}

export function FaqFormModal({ faq, onClose, onSave }: FaqFormModalProps) {
  const [saving, setSaving] = useState(false);
  const modalRef = useModalA11y(true, onClose);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();

  const [form, setForm] = useState<FaqFormData>({
    question: faq?.question ?? '',
    answer: faq?.answer ?? '',
    sortOrder: faq?.sortOrder ?? 0,
  });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.question.trim()) errs.question = 'Question is required';
    if (!form.answer.trim()) errs.answer = 'Answer is required';
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

  function handleChange(field: keyof FaqFormData, value: string | number) {
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
        className="bg-white rounded-lg shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="faq-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="faq-form-title" className="font-heading text-lg font-semibold text-deep-blue">
            {faq ? 'Edit FAQ' : 'Add FAQ'}
          </h2>
          <button
            onClick={handleDismiss}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-md py-sm space-y-sm">
          {saveError && (
            <p className="text-base text-error bg-error/10 px-xs py-2xs rounded" role="alert" aria-live="assertive">
              {saveError}
            </p>
          )}

          {/* Question */}
          <FormField label="Question *" htmlFor="faq-question" error={errors.question}>
            <textarea
              value={form.question}
              onChange={(e) => handleChange('question', e.target.value)}
              rows={2}
              maxLength={300}
              aria-invalid={Boolean(errors.question)}
              className={`${inputClasses} resize-y`}
              data-error={errors.question ? 'true' : undefined}
              placeholder="e.g. How long does delivery take?"
            />
          </FormField>

          {/* Answer */}
          <div>
            <FormField label="Answer *" htmlFor="faq-answer" error={errors.answer}>
              <textarea
                value={form.answer}
                onChange={(e) => handleChange('answer', e.target.value)}
                rows={8}
                aria-invalid={Boolean(errors.answer)}
                className={`${inputClasses} resize-y`}
                data-error={errors.answer ? 'true' : undefined}
                placeholder="Write the answer in plain language..."
              />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-3xs">
              Plain text. Start a new line to create a new paragraph.
            </p>
          </div>

          {/* Sort Order */}
          <div>
            <FormField label="Sort Order" htmlFor="faq-sort-order">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => handleChange('sortOrder', e.target.valueAsNumber || 0)}
                className={`${inputClasses} max-w-24`}
              />
            </FormField>
            <p className="text-xs text-warm-gray-400 mt-3xs">Lower numbers appear first on the page.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {faq ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
