'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import type { SiteContent } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ImageUpload } from '@/components/admin/image-upload';
import { useToast } from '@/components/ui/toast';

export default function AdminSiteContentPage() {
  const [content, setContent] = useState<SiteContent>({
    aboutSolomonIslandsImage: '',
    aboutSolomonIslandsImageAlt: '',
    aboutTeamImage: '',
    aboutTeamImageAlt: '',
    whyWeDoThisImage: '',
    whyWeDoThisImageAlt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const { getSiteContent } = await import('@/services/site-content');
    const data = await getSiteContent();
    setContent(data);
    setLoading(false);
  }

  async function handleSave() {
    // Nothing is saved unless every uploaded image has alt text.
    const missingAlt: string[] = [];
    if (content.aboutSolomonIslandsImage && !content.aboutSolomonIslandsImageAlt.trim()) {
      missingAlt.push('About Solomon Islands');
    }
    if (content.aboutTeamImage && !content.aboutTeamImageAlt.trim()) {
      missingAlt.push('About the SIAC Team');
    }
    if (content.whyWeDoThisImage && !content.whyWeDoThisImageAlt.trim()) {
      missingAlt.push('Why We\'re Doing This');
    }
    if (missingAlt.length > 0) {
      toastError(`Alt text is required before saving. Add it for: ${missingAlt.join(', ')}.`);
      return;
    }

    setSaving(true);
    try {
      const { updateSiteContent } = await import('@/services/site-content');
      await updateSiteContent(content);
      toastSuccess('Site content saved.');
    } catch {
      toastError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-ocean animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-medium text-deep-blue">
              Site Content
            </h1>
            <p className="text-sm text-warm-gray-600 mt-1">
              Manage images for the About page sections.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="tap-target inline-flex items-center gap-2 px-6 py-3 btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Image fields */}
        <div className="space-y-8">
          {/* About Solomon Islands */}
          <div className="border border-sand rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">
              About Solomon Islands
            </h2>
            <p className="text-sm text-warm-gray-600 mb-4">
              The image shown in the first section of the About page.
            </p>
            <ImageUpload
              value={content.aboutSolomonIslandsImage}
              onChange={(url) => setContent((prev) => ({ ...prev, aboutSolomonIslandsImage: url }))}
              altText={content.aboutSolomonIslandsImageAlt}
              onAltTextChange={(alt) => setContent((prev) => ({ ...prev, aboutSolomonIslandsImageAlt: alt }))}
              label="Section Image"
              aspectHint="1:1 square"
            />
          </div>

          {/* About the SIAC Team */}
          <div className="border border-sand rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">
              About the SIAC Team
            </h2>
            <p className="text-sm text-warm-gray-600 mb-4">
              The image shown in the team section of the About page.
            </p>
            <ImageUpload
              value={content.aboutTeamImage}
              onChange={(url) => setContent((prev) => ({ ...prev, aboutTeamImage: url }))}
              altText={content.aboutTeamImageAlt}
              onAltTextChange={(alt) => setContent((prev) => ({ ...prev, aboutTeamImageAlt: alt }))}
              label="Section Image"
              aspectHint="1:1 square"
            />
          </div>

          {/* Why We're Doing This */}
          <div className="border border-sand rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">
              Why We&apos;re Doing This
            </h2>
            <p className="text-sm text-warm-gray-600 mb-4">
              The image shown in the mission section of the About page.
            </p>
            <ImageUpload
              value={content.whyWeDoThisImage}
              onChange={(url) => setContent((prev) => ({ ...prev, whyWeDoThisImage: url }))}
              altText={content.whyWeDoThisImageAlt}
              onAltTextChange={(alt) => setContent((prev) => ({ ...prev, whyWeDoThisImageAlt: alt }))}
              label="Section Image"
              aspectHint="1:1 square"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
