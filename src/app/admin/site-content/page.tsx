'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import type { SiteContent } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ImageUpload } from '@/components/admin/image-upload';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormField, inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';
import { SITE_TEXT_GROUPS, type SiteTextField } from '@/lib/site-text-manifest';
import type { SiteTextMap } from '@/services/site-text';

/**
 * This screen edits two stores that an admin has no reason to distinguish
 * between, so it presents them as one.
 *
 * - SiteContent: the original wide singleton (images, and the page copy that
 *   already had columns). Hand-written editors, below.
 * - SiteText: the key/value store described by src/lib/site-text-manifest.ts.
 *   Its editors are generated from the manifest, so adding an editable string
 *   needs no change to this file.
 *
 * Tabs come from the manifest groups, and a SiteContent editor is slotted into
 * the tab it belongs to. One Save button writes both.
 */
const IMAGES_TAB = 'images';

const SITE_CONTENT_EDITORS: Record<string, React.ComponentType<TabProps>> = {
  homepage: HomepageTab,
  about: AboutTab,
  wholesale: WholesaleTab,
  'care-guide': CareGuideTab,
  contact: ContactTab,
};

const TABS: { id: string; label: string }[] = [
  ...SITE_TEXT_GROUPS.map((group) => ({ id: group.id, label: group.label })),
  { id: IMAGES_TAB, label: 'Images' },
];

const EMPTY: SiteContent = {
  aboutSolomonIslandsImage: '',
  aboutSolomonIslandsImageAlt: '',
  aboutTeamImage: '',
  aboutTeamImageAlt: '',
  whyWeDoThisImage: '',
  whyWeDoThisImageAlt: '',
  homepageHeading: '',
  homepageIntro: '',
  homepageCtaText: '',
  homepageMakersHeading: '',
  homepageMakersIntro: '',
  aboutPageIntro: '',
  aboutSolomonIslandsHeading: '',
  aboutSolomonIslandsText: '',
  aboutSolomonIslandsLinkText: '',
  aboutSolomonIslandsLinkUrl: '',
  aboutTeamHeading: '',
  aboutTeamText: '',
  aboutTeamLinkText: '',
  aboutTeamLinkUrl: '',
  aboutWhyHeading: '',
  aboutWhyText: '',
  aboutWhyLinkText: '',
  aboutWhyLinkUrl: '',
  wholesaleIntro: '',
  wholesaleHowItWorks: '',
  wholesaleMinimumOrder: '',
  careGuideIntro: '',
  careGuidePandanus: '',
  careGuideWood: '',
  careGuideShell: '',
  contactIntro: '',
  contactEmail: '',
  contactResponseTime: '',
};

export default function AdminSiteContentPage() {
  const [content, setContent] = useState<SiteContent>(EMPTY);
  const [text, setText] = useState<SiteTextMap>({});
  /**
   * The copy as loaded, so save can send only what changed. Sending everything
   * would freeze today's manifest defaults into the database for all 169 keys,
   * and would let two admins editing different pages overwrite each other.
   */
  const [initialText, setInitialText] = useState<SiteTextMap>({});
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [{ getSiteContent }, { getSiteTextForAdmin }] = await Promise.all([
          import('@/services/site-content'),
          import('@/services/site-text'),
        ]);
        const [contentData, textData] = await Promise.all([
          getSiteContent(),
          getSiteTextForAdmin(),
        ]);
        setContent(contentData);
        setText(textData);
        setInitialText(textData);
        setLoadFailed(false);
      } catch {
        setLoadFailed(true);
        toastError('Failed to load site content. Save is disabled until data loads successfully.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * True once updateSiteContent has landed for the copy currently on screen.
   *
   * The two stores are separate endpoints, so a failure between them publishes
   * one half and not the other. This lets a retry re-send only the half that
   * did not land. Cleared by any further edit, so an edited SiteContent is
   * always written again.
   */
  const contentSavedRef = useRef(false);

  function update(field: keyof SiteContent, value: string) {
    contentSavedRef.current = false;
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  function updateText(key: string, value: string) {
    setText((prev) => ({ ...prev, [key]: value }));
  }

  const changedTextKeys = Object.keys(text).filter((key) => text[key] !== initialText[key]);

  function handleSaveClick() {
    // Validate image alt text
    const missingAlt: string[] = [];
    if (content.aboutSolomonIslandsImage && !content.aboutSolomonIslandsImageAlt.trim()) {
      missingAlt.push('About Solomon Islands image');
    }
    if (content.aboutTeamImage && !content.aboutTeamImageAlt.trim()) {
      missingAlt.push('About Team image');
    }
    if (content.whyWeDoThisImage && !content.whyWeDoThisImageAlt.trim()) {
      missingAlt.push('Why We Do This image');
    }
    if (missingAlt.length > 0) {
      toastError(`Alt text required for: ${missingAlt.join(', ')}`);
      return;
    }

    setShowConfirm(true);
  }

  async function handleConfirmSave() {
    setShowConfirm(false);
    setSaving(true);

    const changes = Object.fromEntries(changedTextKeys.map((key) => [key, text[key]]));
    let contentPublished = contentSavedRef.current;

    try {
      if (!contentPublished) {
        const { updateSiteContent } = await import('@/services/site-content');
        await updateSiteContent(content);
        contentSavedRef.current = true;
        contentPublished = true;
      }

      if (changedTextKeys.length > 0) {
        const { updateSiteText } = await import('@/services/site-text');
        await updateSiteText(changes);
        // Only now is this the published copy — moving it earlier made a failed
        // text write look saved and the unsaved-changes count drop to zero.
        setInitialText((prev) => ({ ...prev, ...changes }));
      }

      contentSavedRef.current = false;
      toastSuccess('Site content published successfully.');
    } catch {
      // Say which half landed. "Failed to save" was wrong half the time: the
      // images and page copy had already published and only the text had not.
      toastError(
        contentPublished && changedTextKeys.length > 0
          ? 'Images and page copy were published, but the text changes were not. ' +
              'Press Save & Publish to retry just the text.'
          : 'Nothing was published. Please try again.'
      );
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

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-md">
          <div>
            <h1 className={pageTitleClasses}>Site Content</h1>
            <p className="text-base text-warm-gray-600 mt-3xs">
              Edit text and images across all pages. Changes can take a few minutes to appear on
              the live site.
            </p>
            {changedTextKeys.length > 0 && (
              <p className="text-sm text-warning-text mt-3xs" role="status">
                {changedTextKeys.length} unsaved{' '}
                {changedTextKeys.length === 1 ? 'change' : 'changes'}
              </p>
            )}
          </div>
          <Button
            onClick={handleSaveClick}
            disabled={loadFailed}
            loading={saving}
            loadingText="Publishing..."
          >
            <Save className="w-4 h-4" />
            Save &amp; Publish
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-3xs border-b border-sand mb-md overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tap-target whitespace-nowrap px-sm py-xs text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-ocean text-ocean'
                  : 'border-transparent text-warm-gray-600 hover:text-deep-blue hover:border-sand-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content — the hand-written SiteContent editor for this page (if
            any), then the sections generated from the manifest. */}
        <div className="space-y-md">
          {(() => {
            const SiteContentEditor = SITE_CONTENT_EDITORS[activeTab];
            return SiteContentEditor ? (
              <SiteContentEditor content={content} update={update} />
            ) : null;
          })()}

          {activeTab === IMAGES_TAB && <ImagesTab content={content} update={update} />}

          {SITE_TEXT_GROUPS.find((group) => group.id === activeTab)?.sections.map((section) => (
            <Section key={section.title} title={section.title} description={section.description}>
              {section.fields.map((field) => (
                <SiteTextInput
                  key={field.key}
                  field={field}
                  value={text[field.key] ?? ''}
                  onChange={(value) => updateText(field.key, value)}
                />
              ))}
            </Section>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-sm bg-deep-blue/50" onClick={() => setShowConfirm(false)}>
          <div
            className="bg-white rounded-lg shadow-md w-full max-w-md p-md"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <div className="flex items-center gap-xs mb-sm">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h2 id="confirm-title" className="font-heading text-lg font-semibold text-deep-blue">
                Publish changes?
              </h2>
            </div>
            {/* Same timing as the note under the page title. Promising
                "immediately" here and "a few minutes" there sent admins
                refreshing the live site looking for a change that had not
                rebuilt yet. */}
            <p id="confirm-desc" className="text-base text-warm-gray-600 mb-md">
              This will publish to the live website. Changes can take a few minutes to appear for
              visitors. Are you sure you want to publish these changes?
            </p>
            <div className="flex items-center justify-end gap-xs">
              <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmSave}>
                Yes, publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// --- Tab Components ---

interface TabProps {
  content: SiteContent;
  update: (field: keyof SiteContent, value: string) => void;
}

function ImagesTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="About Solomon Islands" description="First section of the About page.">
        <ImageUpload
          value={content.aboutSolomonIslandsImage}
          onChange={(url) => update('aboutSolomonIslandsImage', url)}
          altText={content.aboutSolomonIslandsImageAlt}
          onAltTextChange={(alt) => update('aboutSolomonIslandsImageAlt', alt)}
          label="Section Image"
          aspectHint="1:1 square"
        />
      </Section>
      <Section title="About the SIAC Team" description="Team section of the About page.">
        <ImageUpload
          value={content.aboutTeamImage}
          onChange={(url) => update('aboutTeamImage', url)}
          altText={content.aboutTeamImageAlt}
          onAltTextChange={(alt) => update('aboutTeamImageAlt', alt)}
          label="Section Image"
          aspectHint="1:1 square"
        />
      </Section>
      <Section title="Why We're Doing This" description="Mission section of the About page.">
        <ImageUpload
          value={content.whyWeDoThisImage}
          onChange={(url) => update('whyWeDoThisImage', url)}
          altText={content.whyWeDoThisImageAlt}
          onAltTextChange={(alt) => update('whyWeDoThisImageAlt', alt)}
          label="Section Image"
          aspectHint="1:1 square"
        />
      </Section>
    </>
  );
}

function HomepageTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Hero Section" description="The main heading and intro text visitors see first.">
        <Field label="Eyebrow text (small blue line above the heading)" value={content.homepageHeading} onChange={(v) => update('homepageHeading', v)} placeholder="Meet the Makers Behind Every Piece" />
        <Field label="Heading" value={content.homepageMakersHeading} onChange={(v) => update('homepageMakersHeading', v)} placeholder="Handmade in Solomon Islands" />
        <TextArea label="Intro paragraph" value={content.homepageIntro} onChange={(v) => update('homepageIntro', v)} placeholder="Every product is handmade. When you buy from us..." rows={3} />
        <Field label="Primary CTA button text" value={content.homepageCtaText} onChange={(v) => update('homepageCtaText', v)} placeholder="Browse Catalogue" />
      </Section>
    </>
  );
}

function AboutTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Page Intro" description="The intro paragraph shown at the top of the About page.">
        <TextArea label="Intro text" fieldId="about-page-intro" value={content.aboutPageIntro} onChange={(v) => update('aboutPageIntro', v)} placeholder="Solomon Islands Arts & Crafts connects makers..." rows={3} />
      </Section>
      <Section title="About Solomon Islands" description="First section of the About page (beside the map/image).">
        <Field label="Section heading" fieldId="about-si-heading" value={content.aboutSolomonIslandsHeading} onChange={(v) => update('aboutSolomonIslandsHeading', v)} placeholder="About Solomon Islands" />
        <TextArea label="Content" fieldId="about-si-content" value={content.aboutSolomonIslandsText} onChange={(v) => update('aboutSolomonIslandsText', v)} placeholder="Solomon Islands is a sovereign nation of over 990 islands..." rows={6} />
        <Field label="Link text" fieldId="about-si-link-text" value={content.aboutSolomonIslandsLinkText} onChange={(v) => update('aboutSolomonIslandsLinkText', v)} placeholder="Find out more about Solomon Islands" />
        <Field label="Link URL" fieldId="about-si-link-url" value={content.aboutSolomonIslandsLinkUrl} onChange={(v) => update('aboutSolomonIslandsLinkUrl', v)} placeholder="https://en.wikipedia.org/wiki/Solomon_Islands" />
      </Section>
      <Section title="About the Team" description="The SIAC team section.">
        <Field label="Section heading" fieldId="about-team-heading" value={content.aboutTeamHeading} onChange={(v) => update('aboutTeamHeading', v)} placeholder="Our Team" />
        <TextArea label="Content" fieldId="about-team-content" value={content.aboutTeamText} onChange={(v) => update('aboutTeamText', v)} placeholder="Solomon Islands Arts & Crafts is run entirely by volunteers..." rows={6} />
        <Field label="Link text" fieldId="about-team-link-text" value={content.aboutTeamLinkText} onChange={(v) => update('aboutTeamLinkText', v)} placeholder="Find out more about our team →" />
        <Field label="Link URL" fieldId="about-team-link-url" value={content.aboutTeamLinkUrl} onChange={(v) => update('aboutTeamLinkUrl', v)} placeholder="/about/team" />
      </Section>
      <Section title="Why We're Doing This" description="The mission/purpose section.">
        <Field label="Section heading" fieldId="about-why-heading" value={content.aboutWhyHeading} onChange={(v) => update('aboutWhyHeading', v)} placeholder="Why We're Doing This" />
        <TextArea label="Content" fieldId="about-why-content" value={content.aboutWhyText} onChange={(v) => update('aboutWhyText', v)} placeholder="Solomon Islands makers produce work of extraordinary skill..." rows={6} />
        <Field label="Link text" fieldId="about-why-link-text" value={content.aboutWhyLinkText} onChange={(v) => update('aboutWhyLinkText', v)} placeholder="Are you a maker in Solomon Islands? Learn how to work with us →" />
        <Field label="Link URL" fieldId="about-why-link-url" value={content.aboutWhyLinkUrl} onChange={(v) => update('aboutWhyLinkUrl', v)} placeholder="/for-makers" />
      </Section>
    </>
  );
}

function WholesaleTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Page Content" description="Text shown on the Wholesale information page.">
        <TextArea label="Intro paragraph" value={content.wholesaleIntro} onChange={(v) => update('wholesaleIntro', v)} placeholder="We supply authentic Solomon Islands handicrafts to museum and gallery shops..." rows={4} />
        <TextArea label="How it works" value={content.wholesaleHowItWorks} onChange={(v) => update('wholesaleHowItWorks', v)} placeholder="1. Apply for an account\n2. Browse the catalogue..." rows={5} />
        <Field label="Minimum order note" value={content.wholesaleMinimumOrder} onChange={(v) => update('wholesaleMinimumOrder', v)} placeholder="No minimum order. Orders over A$1,000 may attract GST." />
      </Section>
    </>
  );
}

function CareGuideTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Care Guide" description="Instructions for looking after each material type.">
        <TextArea label="Introduction" value={content.careGuideIntro} onChange={(v) => update('careGuideIntro', v)} placeholder="Each piece is made from natural materials..." rows={3} />
        <TextArea label="Pandanus care" value={content.careGuidePandanus} onChange={(v) => update('careGuidePandanus', v)} placeholder="Keep dry. Store flat or stuffed with tissue..." rows={4} />
        <TextArea label="Wood care" value={content.careGuideWood} onChange={(v) => update('careGuideWood', v)} placeholder="Oil occasionally with food-safe wood oil..." rows={4} />
        <TextArea label="Shell care" value={content.careGuideShell} onChange={(v) => update('careGuideShell', v)} placeholder="Wipe gently with a soft cloth..." rows={4} />
      </Section>
    </>
  );
}

function ContactTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Contact Page" description="Details shown on the contact page.">
        <TextArea label="Intro text" value={content.contactIntro} onChange={(v) => update('contactIntro', v)} placeholder="We'd love to hear from you..." rows={3} />
        <Field label="Contact email" value={content.contactEmail} onChange={(v) => update('contactEmail', v)} placeholder="hello@solomonislandsartsandcrafts.com.au" />
        <Field label="Response time note" value={content.contactResponseTime} onChange={(v) => update('contactResponseTime', v)} placeholder="We usually respond within 2 business days." />
      </Section>
    </>
  );
}

// --- Reusable form primitives ---

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-sand rounded-lg p-md">
      <h2 className="font-heading text-lg font-semibold text-deep-blue mb-3xs">{title}</h2>
      {description && <p className="text-base text-warm-gray-400 mb-sm">{description}</p>}
      <div className="space-y-sm">{children}</div>
    </div>
  );
}

/**
 * One editor generated from a manifest field.
 *
 * `list` fields get a textarea because that is what they are — one item per
 * line. A repeater UI would be nicer, but it would also be the only bespoke
 * widget on a screen of 169 fields, and the hint carries the format perfectly
 * well.
 */
function SiteTextInput({
  field,
  value,
  onChange,
}: {
  field: SiteTextField;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `site-text-${field.key.replace(/[^a-zA-Z0-9]+/g, '-')}`;
  const multiline = field.type === 'multiline' || field.type === 'list';

  return (
    <div>
      <FormField label={field.label} htmlFor={id}>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={field.type === 'list' ? 5 : 3}
            className={`${inputClasses} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClasses}
          />
        )}
      </FormField>
      {field.help && <p className="text-xs text-warm-gray-400 mt-3xs">{field.help}</p>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, fieldId }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; fieldId?: string }) {
  const id = fieldId || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <FormField label={label} htmlFor={id}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
      />
    </FormField>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4, fieldId }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; fieldId?: string }) {
  const id = fieldId || `textarea-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <FormField label={label} htmlFor={id}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClasses} resize-y`}
      />
    </FormField>
  );
}
