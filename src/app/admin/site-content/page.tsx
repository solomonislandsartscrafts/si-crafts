'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import type { SiteContent } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ImageUpload } from '@/components/admin/image-upload';
import { useToast } from '@/components/ui/toast';

type Tab = 'homepage' | 'about' | 'catalogue' | 'news' | 'stockists' | 'wholesale' | 'care-guide' | 'contact' | 'images';

const TABS: { id: Tab; label: string }[] = [
  { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About' },
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'news', label: 'News' },
  { id: 'stockists', label: 'Stockists' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'care-guide', label: 'Care Guide' },
  { id: 'contact', label: 'Contact' },
  { id: 'images', label: 'Images' },
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
  catalogueIntro: '',
  newsIntro: '',
  stockistsIntro: '',
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
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('homepage');
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const { getSiteContent } = await import('@/services/site-content');
        const data = await getSiteContent();
        setContent(data);
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

  function update(field: keyof SiteContent, value: string) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

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
    try {
      const { updateSiteContent } = await import('@/services/site-content');
      await updateSiteContent(content);
      toastSuccess('Site content published successfully.');
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
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-medium text-deep-blue">Site Content</h1>
            <p className="text-sm text-warm-gray-600 mt-1">
              Edit text and images across all pages. Changes appear on the live site after saving.
            </p>
          </div>
          <button
            onClick={handleSaveClick}
            disabled={saving || loadFailed}
            className="tap-target inline-flex items-center gap-2 px-6 py-3 btn-primary"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-sand mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tap-target whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-ocean text-ocean'
                  : 'border-transparent text-warm-gray-600 hover:text-deep-blue hover:border-sand-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === 'homepage' && <HomepageTab content={content} update={update} />}
          {activeTab === 'about' && <AboutTab content={content} update={update} />}
          {activeTab === 'catalogue' && <CatalogueTab content={content} update={update} />}
          {activeTab === 'news' && <NewsTab content={content} update={update} />}
          {activeTab === 'stockists' && <StockistsTab content={content} update={update} />}
          {activeTab === 'wholesale' && <WholesaleTab content={content} update={update} />}
          {activeTab === 'care-guide' && <CareGuideTab content={content} update={update} />}
          {activeTab === 'contact' && <ContactTab content={content} update={update} />}
          {activeTab === 'images' && <ImagesTab content={content} update={update} />}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-blue/50" onClick={() => setShowConfirm(false)}>
          <div
            className="bg-white rounded-lg shadow-md w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h2 id="confirm-title" className="font-heading text-lg font-semibold text-deep-blue">
                Publish changes?
              </h2>
            </div>
            <p id="confirm-desc" className="text-sm text-warm-gray-600 mb-6">
              This will update the live website immediately. All visitors will see the new content. Are you sure you want to publish these changes?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="tap-target px-5 py-2.5 border-2 border-sand-dark text-warm-gray-600 hover:text-deep-blue rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="tap-target px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
              >
                Yes, publish
              </button>
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
        <Field label="Heading" value={content.homepageHeading} onChange={(v) => update('homepageHeading', v)} placeholder="Meet the Makers Behind Every Piece" />
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

function CatalogueTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Catalogue Page" description="The intro text shown at the top of the catalogue.">
        <TextArea label="Page intro" value={content.catalogueIntro} onChange={(v) => update('catalogueIntro', v)} placeholder="Browse our full collection of Solomon Islands handicrafts. All items are made from renewable, natural resources..." rows={3} />
      </Section>
    </>
  );
}

function NewsTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="News Page" description="The intro text shown at the top of the news listing.">
        <TextArea label="Page intro" value={content.newsIntro} onChange={(v) => update('newsIntro', v)} placeholder="Stories and updates from Solomon Islands Arts & Crafts — makers, crafts, and the people we work with." rows={3} />
      </Section>
    </>
  );
}

function StockistsTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Stockists Page" description="The intro text shown on the stockists page.">
        <TextArea label="Page intro" value={content.stockistsIntro} onChange={(v) => update('stockistsIntro', v)} placeholder="Find Solomon Islands Arts & Crafts in these museum and gallery shops." rows={3} />
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

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="border border-sand rounded-lg p-6">
      <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">{title}</h2>
      <p className="text-sm text-warm-gray-400 mb-4">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, fieldId }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; fieldId?: string }) {
  const id = fieldId || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-warm-gray-800 mb-1">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4, fieldId }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; fieldId?: string }) {
  const id = fieldId || `textarea-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-warm-gray-800 mb-1">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-y"
      />
    </div>
  );
}
