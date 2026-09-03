'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Move } from 'lucide-react';
import Image from 'next/image';
import type { TeamMember } from '@/types';
import { ImageUpload } from './image-upload';
import { singleAltError } from '@/lib/image-alt';
import { scrollToFirstError } from '@/lib/scroll-to-error';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { useToast } from '@/components/ui/toast';
import { resolveImageUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';

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
  photoPosition: string;
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
    photoPosition: member?.photoPosition ?? '50% 50%',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-deep-blue/50" onClick={handleDismiss}>
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-sand">
          <h2 id="team-form-title" className="font-heading text-lg font-semibold text-deep-blue">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={handleDismiss}
            className="tap-target p-2xs text-warm-gray-400 hover:text-warm-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
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

          {/* Name */}
          <FormField label="Name *" htmlFor="team-name" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={inputClasses}
              data-error={errors.name ? 'true' : undefined}
              placeholder="Full name"
            />
          </FormField>

          {/* Location */}
          <FormField label="Location" htmlFor="team-location">
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={inputClasses}
              placeholder="e.g. Sydney, Australia"
            />
          </FormField>

          {/* Bio */}
          <FormField label="Bio / Details" htmlFor="team-bio">
            <textarea
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              className={`${inputClasses} resize-y`}
              placeholder="A short description about this person and their role..."
            />
          </FormField>

          {/* Sort Order */}
          <div>
            <FormField label="Sort Order" htmlFor="team-sort-order">
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
            <p className="text-base text-error mt-3xs" role="alert" aria-live="assertive">{errors.photoAlt}</p>
          )}

          {/* Photo Position Adjuster — shown when an image is uploaded */}
          {form.photoUrl && (
            <PhotoPositionControl
              imageUrl={form.photoUrl}
              position={form.photoPosition}
              onChange={(pos) => handleChange('photoPosition', pos)}
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-xs pt-sm border-t border-sand">
            <Button variant="secondary" onClick={handleDismiss} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {member ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Photo Position Control ---

interface PhotoPositionControlProps {
  imageUrl: string;
  position: string; // "x% y%"
  onChange: (position: string) => void;
}

function PhotoPositionControl({ imageUrl, position, onChange }: PhotoPositionControlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Parse position
  const [posX, posY] = (position || '50% 50%')
    .split(' ')
    .map((v) => parseInt(v, 10) || 50);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      onChange(`${Math.round(x)}% ${Math.round(y)}%`);
    },
    [onChange]
  );

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    updatePosition(e.clientX, e.clientY);

    function onMouseMove(ev: MouseEvent) {
      if (dragging.current) updatePosition(ev.clientX, ev.clientY);
    }
    function onMouseUp() {
      dragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function handleTouchStart(e: React.TouchEvent) {
    dragging.current = true;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }

  function handleTouchEnd() {
    dragging.current = false;
  }

  return (
    <div>
      <label className="block text-base font-medium text-warm-gray-800 mb-3xs">
        <Move className="w-4 h-4 inline mr-3xs" />
        Adjust Photo Position
      </label>
      <p className="text-xs text-warm-gray-400 mb-2xs">
        Click or drag on the circle to position the focal point of the image.
      </p>

      <div className="flex items-center gap-sm">
        {/* Draggable circle preview */}
        <div
          ref={containerRef}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-ocean cursor-crosshair select-none flex-shrink-0"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={resolveImageUrl(imageUrl)}
            alt="Position preview"
            fill
            className="object-cover pointer-events-none"
            style={{ objectPosition: `${posX}% ${posY}%` }}
            sizes="96px"
          />
          {/* Crosshair indicator */}
          <div
            className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
            style={{
              left: `${posX}%`,
              top: `${posY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Position display */}
        <div className="text-xs text-warm-gray-600">
          <p>X: {posX}%</p>
          <p>Y: {posY}%</p>
          <button
            type="button"
            onClick={() => onChange('50% 50%')}
            className="text-ocean hover:text-ocean-dark text-xs mt-3xs transition-colors"
          >
            Reset to center
          </button>
        </div>
      </div>
    </div>
  );
}
