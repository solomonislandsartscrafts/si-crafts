'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import type { SiteContent } from '@/types';
import { AdminLayout } from '@/components/admin';
import { ImageUpload } from '@/components/admin/image-upload';
import { useToast } from '@/components/ui/toast';

type Tab = 'images' | 'homepage' | 'about' | 'wholesale' | 'care-guide' | 'contact';

const TABS: { id: Tab; label: string }[] = [
  { id: 'images', label: 'Images' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'care-guide', label: 'Care Guide' },
  { id: 'contact', label: 'Contact' },
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
  aboutSolomonIslandsText: '',
  aboutTeamText: '',
  aboutWhyText: '',
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
  const [activeTab, setActiveTab] = useState<Tab>('images');
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

  function update(field: keyof SiteContent, value: string) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
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
            onClick={handleSave}
            disabled={saving || loadFailed}
            className="tap-target inline-flex items-center gap-2 px-6 py-3 btn-primary"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save All'}
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
          {activeTab === 'images' && <ImagesTab content={content} update={update} />}
          {activeTab === 'homepage' && <HomepageTab content={content} update={update} />}
          {activeTab === 'about' && <AboutTab content={content} update={update} />}
          {activeTab === 'wholesale' && <WholesaleTab content={content} update={update} />}
          {activeTab === 'care-guide' && <CareGuideTab content={content} update={update} />}
          {activeTab === 'contact' && <ContactTab content={content} update={update} />}
        </div>
      </div>
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
      <Section title="Makers Section" description="The 'Meet the Makers' section lower on the homepage.">
        <Field label="Section heading" value={content.homepageMakersHeading} onChange={(v) => update('homepageMakersHeading', v)} placeholder="Handmade in Solomon Islands" />
        <TextArea label="Section intro" value={content.homepageMakersIntro} onChange={(v) => update('homepageMakersIntro', v)} placeholder="Scan the QR code on any product tag..." rows={3} />
      </Section>
    </>
  );
}

function AboutTab({ content, update }: TabProps) {
  return (
    <>
      <Section title="Page Intro" description="The intro paragraph shown at the top of the About page.">
        <TextArea label="Intro text" value={content.aboutPageIntro} onChange={(v) => update('aboutPageIntro', v)} placeholder="Solomon Islands Arts and Crafts connects makers..." rows={3} />
      </Section>
      <Section title="About Solomon Islands" description="Text in the first section (beside the map/image).">
        <TextArea label="Content" value={content.aboutSolomonIslandsText} onChange={(v) => update('aboutSolomonIslandsText', v)} placeholder="Solomon Islands is a sovereign nation of over 990 islands..." rows={6} />
      </Section>
      <Section title="About the Team" description="Text in the SIAC team section.">
        <TextArea label="Content" value={content.aboutTeamText} onChange={(v) => update('aboutTeamText', v)} placeholder="Solomon Islands Arts and Crafts is run entirely by volunteers..." rows={6} />
      </Section>
      <Section title="Why We're Doing This" description="Text in the mission/purpose section.">
        <TextArea label="Content" value={content.aboutWhyText} onChange={(v) => update('aboutWhyText', v)} placeholder="Solomon Islands makers produce work of extraordinary skill..." rows={6} />
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

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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

function TextArea({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const id = `textarea-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
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
