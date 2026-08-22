import { generatePageMetadata } from '@/lib/metadata';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { CmsText } from '@/components/ui/cms-text';
import { getSiteContentSafe } from '@/services/site-content';
import { getSiteTextSafe } from '@/services/site-text';
import { ContactForm } from './contact-form';

export const metadata = generatePageMetadata({
  title: 'Contact',
  description: 'Get in touch with the Solomon Islands Arts & Crafts team.',
  path: '/contact',
});

export default async function ContactPage() {
  const [siteContent, text] = await Promise.all([getSiteContentSafe(), getSiteTextSafe()]);

  // The block number is kept as the key: a body-only block has no heading, so
  // keying on the heading would give every one of them the same `undefined`.
  const blocks = [1, 2, 3]
    .map((n) => ({
      n,
      heading: text[`contact.block${n}Heading`],
      body: text[`contact.block${n}Body`],
    }))
    .filter((block) => block.heading || block.body);

  const email = siteContent.contactEmail;

  return (
    <div>
      <PageHeader title={text['contact.title']} intro={siteContent.contactIntro} />

      <div className="site-container pb-10 lg:pb-20 grid grid-cols-1 md:grid-cols-2 gap-10">
        <ContactForm
          successHeading={text['contact.successHeading']}
          successBody={text['contact.successBody']}
        />

        {/* Contact info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-3">
              {text['contact.emailHeading']}
            </h2>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-ocean hover:text-ocean-dark transition-colors"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                {email}
              </a>
            )}
            {text['contact.abn'] && (
              <p className="text-sm text-warm-gray-400 mt-2">{text['contact.abn']}</p>
            )}
          </div>

          {blocks.map((block) => (
            <div key={block.n}>
              {block.heading && (
                <h3 className="font-heading text-lg font-semibold text-deep-blue mb-2">
                  {block.heading}
                </h3>
              )}
              <CmsText
                value={block.body}
                className="space-y-3"
                paragraphClassName="text-base text-warm-gray-600"
              />
            </div>
          ))}

          {siteContent.contactResponseTime && (
            <div className="bg-sand-light rounded-lg p-6">
              <p className="text-base text-warm-gray-600">{siteContent.contactResponseTime}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
