'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Maker, ConsentStatus, CulturalReviewStatus } from '@/types';
import { getAllCrafts } from '@/services/crafts';
import type { Craft } from '@/types';

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
  story: string;
  storyCulturalReviewFlag: CulturalReviewStatus;
  craftId: string;
  consentStatus: ConsentStatus;
}

export function MakerFormModal({ maker, onClose, onSave }: MakerFormModalProps) {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<MakerFormData>({
    name: maker?.name ?? '',
    slug: maker?.slug ?? '',
    village: maker?.village ?? '',
    province: maker?.province ?? '',
    island: maker?.island ?? '',
    portraitUrl: maker?.portraitUrl ?? '',
    story: maker?.story ?? '',
    storyCulturalReviewFlag: maker?.storyCulturalReviewFlag ?? 'unreviewed',
    craftId: maker?.craftId ?? '',
    consentStatus: maker?.consentStatus ?? 'Not Signed',
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

  function handleChange(field: keyof MakerFormData, value: string) {
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
        aria-labelledby="maker-form-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
          <h2 id="maker-form-title" className="font-heading text-xl font-bold text-deep-blue">
            {maker ? 'Edit Maker' : 'Add Maker'}
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

          {/* Name */}
          <div>
            <label htmlFor="maker-name" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Name *
            </label>
            <input
              id="maker-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.name ? 'maker-name-error' : undefined}
            />
            {errors.name && <p id="maker-name-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.name}</p>}
          </div>

          {/* Village + Province (row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="maker-village" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Village *
              </label>
              <input
                id="maker-village"
                type="text"
                value={form.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.village ? 'maker-village-error' : undefined}
              />
              {errors.village && <p id="maker-village-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.village}</p>}
            </div>
            <div>
              <label htmlFor="maker-province" className="block text-sm font-medium text-warm-gray-800 mb-1">
                Province *
              </label>
              <input
                id="maker-province"
                type="text"
                value={form.province}
                onChange={(e) => handleChange('province', e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
                aria-describedby={errors.province ? 'maker-province-error' : undefined}
              />
              {errors.province && <p id="maker-province-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.province}</p>}
            </div>
          </div>

          {/* Island */}
          <div>
            <label htmlFor="maker-island" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Island *
            </label>
            <input
              id="maker-island"
              type="text"
              value={form.island}
              onChange={(e) => handleChange('island', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.island ? 'maker-island-error' : undefined}
            />
            {errors.island && <p id="maker-island-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.island}</p>}
          </div>

          {/* Craft */}
          <div>
            <label htmlFor="maker-craft" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Craft *
            </label>
            <select
              id="maker-craft"
              value={form.craftId}
              onChange={(e) => handleChange('craftId', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
              aria-describedby={errors.craftId ? 'maker-craft-error' : undefined}
            >
              <option value="">Select a craft...</option>
              {crafts.map((craft) => (
                <option key={craft.id} value={craft.id}>{craft.name}</option>
              ))}
            </select>
            {errors.craftId && <p id="maker-craft-error" className="text-sm text-error mt-1" aria-live="assertive">{errors.craftId}</p>}
          </div>

          {/* Portrait URL */}
          <div>
            <label htmlFor="maker-portrait" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Portrait URL
            </label>
            <input
              id="maker-portrait"
              type="text"
              value={form.portraitUrl}
              onChange={(e) => handleChange('portraitUrl', e.target.value)}
              placeholder="/images/maker-portrait.jpg"
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            />
            <p className="text-xs text-warm-gray-400 mt-1">Enter image path or URL. File upload available after CMS integration.</p>
          </div>

          {/* Story */}
          <div>
            <label htmlFor="maker-story" className="block text-sm font-medium text-warm-gray-800 mb-1">
              Story (first-person voice)
            </label>
            <textarea
              id="maker-story"
              value={form.story}
              onChange={(e) => handleChange('story', e.target.value)}
              rows={4}
              placeholder="I learned to weave from my grandmother..."
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
            />
          </div>

          {/* Cultural Review Flag */}
          <div className="flex items-center gap-3">
            <input
              id="maker-cultural-review"
              type="checkbox"
              checked={form.storyCulturalReviewFlag === 'reviewed'}
              onChange={(e) =>
                handleChange('storyCulturalReviewFlag', e.target.checked ? 'reviewed' : 'unreviewed')
              }
              className="w-4 h-4 rounded border-sand-dark text-ocean focus:ring-ocean"
            />
            <label htmlFor="maker-cultural-review" className="text-sm text-warm-gray-800">
              Story reviewed by cultural partner
            </label>
          </div>

          {/* Consent Status */}
          <div className="bg-sand-light rounded-md p-4">
            <label htmlFor="maker-consent" className="block text-sm font-medium text-warm-gray-800 mb-2">
              Consent Status
            </label>
            <select
              id="maker-consent"
              value={form.consentStatus}
              onChange={(e) => handleChange('consentStatus', e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
            >
              <option value="Signed">Signed</option>
              <option value="Not Signed">Not Signed</option>
            </select>
            <p className="text-xs text-warm-gray-400 mt-2">
              Setting consent to &quot;Signed&quot; will publish this maker and their products to the public site.
            </p>
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
              className="tap-target px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light disabled:opacity-50"
            >
              {saving ? 'Saving...' : maker ? 'Update Maker' : 'Create Maker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
