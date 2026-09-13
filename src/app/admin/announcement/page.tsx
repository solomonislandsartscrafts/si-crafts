'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Megaphone } from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';
import { CmsInline } from '@/components/ui/cms-text';
import type { AnnouncementBanner, AnnouncementVariant } from '@/types';

const DEFAULT_ANNOUNCEMENT: AnnouncementBanner = {
  enabled: false,
  message: '',
  variant: 'blue',
};

const VARIANT_META: Record<
  AnnouncementVariant,
  { label: string; swatch: string; preview: string; previewLink: string }
> = {
  blue: {
    label: 'Blue',
    swatch: 'bg-deep-blue',
    preview: 'bg-deep-blue text-white',
    previewLink: 'underline underline-offset-2 font-medium',
  },
  green: {
    label: 'Green',
    swatch: 'bg-brand-green',
    preview: 'bg-brand-green text-white',
    previewLink: 'underline underline-offset-2 font-medium',
  },
  gold: {
    label: 'Gold',
    swatch: 'bg-accent-gold',
    preview: 'bg-accent-gold text-deep-blue',
    previewLink: 'underline underline-offset-2 font-medium text-ocean-dark',
  },
};

export default function AdminAnnouncementPage() {
  const [announcement, setAnnouncement] = useState<AnnouncementBanner>(DEFAULT_ANNOUNCEMENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const { getAnnouncement } = await import('@/services/announcement');
        setAnnouncement(await getAnnouncement());
      } catch {
        toastError('Failed to load the announcement banner.');
      } finally {
        setLoading(false);
      }
    }
    load();
    // toastError is stable from the toast provider; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof AnnouncementBanner>(key: K, value: AnnouncementBanner[K]) {
    setAnnouncement((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (announcement.enabled && !announcement.message.trim()) {
      toastError('Add a message before turning the banner on, or turn it off.');
      return;
    }
    setSaving(true);
    try {
      const { updateAnnouncement } = await import('@/services/announcement');
      const saved = await updateAnnouncement(announcement);
      setAnnouncement(saved);
      toastSuccess('Announcement banner saved.');
    } catch {
      toastError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-3xl py-lg">
          <SkeletonText lines={8} />
        </div>
      </AdminLayout>
    );
  }

  const showPreview = announcement.message.trim().length > 0;

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-md">
          <div>
            <h1 className={pageTitleClasses}>Announcement Banner</h1>
            <p className="text-base text-warm-gray-600 mt-3xs">
              A notice shown at the very top of every public page. Use it for temporary notices —
              shipping updates, holiday hours, or a new collection. Changes can take a few minutes
              to appear on the live site.
            </p>
          </div>
          <Button onClick={handleSave} loading={saving} loadingText="Saving...">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>

        {/* On/off toggle */}
        <section className="border border-sand rounded-lg p-md mb-md">
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-3xs">Visibility</h2>
          <p className="text-base text-warm-gray-400 mb-sm">
            Turn the banner on to show it to all visitors. When off, nothing appears.
          </p>
          <button
            type="button"
            onClick={() => update('enabled', !announcement.enabled)}
            aria-pressed={announcement.enabled}
            className={`focus-ring tap-target flex items-center gap-xs p-sm rounded-lg border-2 transition-colors w-full sm:w-auto ${
              announcement.enabled
                ? 'border-ocean bg-ocean/5'
                : 'border-sand-dark bg-warm-gray-100'
            }`}
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                announcement.enabled ? 'bg-brand-green' : 'bg-warm-gray-400'
              }`}
            >
              {announcement.enabled ? (
                <Eye className="w-4 h-4 text-white" />
              ) : (
                <EyeOff className="w-4 h-4 text-white" />
              )}
            </span>
            <span className="text-base font-medium text-deep-blue">
              {announcement.enabled ? 'Banner is ON — visible to everyone' : 'Banner is OFF — hidden'}
            </span>
          </button>
        </section>

        {/* Message + colour */}
        <section className="border border-sand rounded-lg p-md mb-md">
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-sm">Message</h2>
          <div className="space-y-sm">
            <div>
              <FormField label="Notice text" htmlFor="announcement-message">
                <textarea
                  id="announcement-message"
                  value={announcement.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={2}
                  placeholder="Free shipping on wholesale orders this month. [See the catalogue](/catalogue)"
                  className={`${inputClasses} resize-y`}
                />
              </FormField>
              <p className="text-xs text-warm-gray-400 mt-3xs">
                Keep it short — this is a one-line bar. You can use{' '}
                <span className="font-mono">**bold**</span> and a link like{' '}
                <span className="font-mono">[label](/catalogue)</span>.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray-400 mb-3xs">
                Colour
              </p>
              <div className="flex flex-wrap gap-xs">
                {(Object.keys(VARIANT_META) as AnnouncementVariant[]).map((variant) => {
                  const meta = VARIANT_META[variant];
                  const active = announcement.variant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => update('variant', variant)}
                      aria-pressed={active}
                      className={`focus-ring tap-target flex items-center gap-2xs px-sm py-xs rounded-lg border-2 transition-colors ${
                        active ? 'border-ocean bg-ocean/5' : 'border-sand-dark bg-white'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${meta.swatch}`} aria-hidden="true" />
                      <span className="text-base font-medium text-deep-blue">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Live preview */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray-400 mb-3xs">
            Preview
          </p>
          {showPreview ? (
            <div
              className={`rounded-lg overflow-hidden ${
                announcement.enabled ? '' : 'opacity-50'
              }`}
            >
              <div className={`${VARIANT_META[announcement.variant].preview} text-sm`}>
                <p className="px-md py-2xs text-center leading-body">
                  <CmsInline
                    value={announcement.message}
                    linkClassName={VARIANT_META[announcement.variant].previewLink}
                  />
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-xs rounded-lg border border-dashed border-sand-dark p-md text-warm-gray-400">
              <Megaphone className="w-5 h-5" />
              <span className="text-base">Add a message above to see how the banner will look.</span>
            </div>
          )}
          {!announcement.enabled && showPreview && (
            <p className="text-sm text-warm-gray-400 mt-3xs">
              The banner is currently off, so visitors won&apos;t see this yet.
            </p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
