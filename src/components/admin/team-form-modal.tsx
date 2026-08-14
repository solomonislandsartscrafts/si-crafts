'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import type { TeamMember } from '@/types';
import { ImageUpload } from './image-upload';
import { singleAltError } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { useToast } from '@/components/ui/toast';

interface TeamFormModalProps {
  member: TeamMember | null; // null = create mode
  onClose: () => void;
  onSave: (data: TeamFormData) => Promise<void>;
}

export interface TeamFormData {
  name: string;
  location: string;
  bio: string;
  photoUrl: string;
  photoAlt: string;
  sortOrder: number;
}

export function TeamFormModal({ member, onClose, onSave }: TeamFormModalProps) {
  const [saving, setSaving] = useState(false);
  const modalRef = useModalA11y(true, onClose);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const { error: toastError } = useToast();

  const [form, setForm] = useState<TeamFormData>({
    name: member?.name ?? '',
    location: member?.location ?? '',
    bio: member?.bio ?? '',
    photoUrl: member?.photoUrl ?? '',
    photoAlt: member?.photoAlt ?? '',
    sortOrder: member?.sortOrder ?? 0,
  });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';

    const photoAltError = singleAltError(form.photoUrl, form.photoAlt, 'profile photo');
    if (photoAltError) errs.photoAlt = photoAltError;

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

  function handleChange(field: keyof TeamFormData, value: string | number) {
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
        className="bg-white rounded-lg shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2 id="team-form-title" className="font-heading text-lg font-semibold text-deep-blue">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={handleDismiss}
            className="tap-target p-2 text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {saveError && (
            <p className="text-sm text-error bg-error/10 px-3 py-2 rounded" aria-live="assertive">
              {saveError}
            </p>
          )}

          {/* Name */}
          <div>
            <label htmlFor="team-name" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Name <span className="text-error">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={`w-full px-4 py-3 rounded-md border bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent ${
                errors.name ? 'border-error' : 'border-sand-dark'
              }`}
              placeholder="Full name"
            />
            {errors.name && <p className="text-sm text-error mt-1" aria-live="assertive">{errors.name}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="team-location" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Location
            </label>
            <input
              id="team-location"
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              placeholder="e.g. Sydney, Australia"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="team-bio" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Bio / Details
            </label>
            <textarea
              id="team-bio"
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
              placeholder="A short description about this person and their role..."
            />
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="team-sort-order" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Sort Order
            </label>
            <input
              id="team-sort-order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => handleChange('sortOrder', e.target.valueAsNumber || 0)}
              className="w-24 px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
            <p className="text-xs text-warm-gray-400 mt-1">Lower numbers appear first.</p>
          </div>

          {/* Photo */}
          <ImageUpload
            value={form.photoUrl}
            onChange={(url) => handleChange('photoUrl', url)}
            altText={form.photoAlt}
            onAltTextChange={(alt) => handleChange('photoAlt', alt)}
            label="Profile Photo"
            aspectHint="1:1 square"
          />
          {errors.photoAlt && (
            <p className="text-sm text-error mt-1" aria-live="assertive">{errors.photoAlt}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand">
            <button
              type="button"
              onClick={handleDismiss}
              disabled={saving}
              className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="tap-target inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light disabled:opacity-50"
            >
              {saving ? 'Saving...' : member ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
