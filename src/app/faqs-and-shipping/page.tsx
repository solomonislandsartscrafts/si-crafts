import { HelpCircle } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageCta, PageHeader } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { CmsText } from '@/components/ui/cms-text';
import { EmptyState } from '@/components/ui/empty-state';
import { getFaqsSafe } from '@/services/faqs';
import { getSiteTextSafe } from '@/services/site-text';
import { FaqsAccordion } from './faqs-accordion';

export const metadata = generatePageMetadata({
  title: 'FAQs & Shipping',
  description: 'Ordering, delivery, returns, and the questions stockists ask us most often.',
  path: '/faqs-and-shipping',
});

export default async function FaqsAndShippingPage() {
  const [faqs, text] = await Promise.all([getFaqsSafe(), getSiteTextSafe()]);

  return (
    <div>
      <PageHeader
        banner="gold"
        eyebrow="Questions & shipping"
        title={text['faqs.title']}
        intro={text['faqs.intro']}
      />

      <div className="site-container pb-section">
        <h2 className="sr-only">Frequently asked questions</h2>
        {faqs.length === 0 ? (
          <EmptyState icon={HelpCircle} title={text['faqs.emptyTitle']} />
        ) : (
          <FaqsAccordion faqs={faqs} />
        )}

        {text['faqs.footerNote'] && (
          <div className="mt-xl bg-sand-light rounded-lg p-md">
            <CmsText
              value={text['faqs.footerNote']}
              className="space-y-xs"
              paragraphClassName="text-warm-gray-600 leading-relaxed"
            />
          </div>
        )}
      </div>

      <PageCta heading={text['faqs.ctaHeading']} description={text['faqs.ctaDescription']}>
        <ButtonLink href="/wholesale">{text['faqs.ctaPrimaryButton']}</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          {text['faqs.ctaSecondaryButton']}
        </ButtonLink>
      </PageCta>
    </div>
  );
}
