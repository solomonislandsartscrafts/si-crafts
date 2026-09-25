import Link from 'next/link';
import { PageHeader, PageCta } from '@/components/layout';
import { AccordionItem } from '@/components/ui/accordion';
import { ButtonLink } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { CmsText } from '@/components/ui/cms-text';
import { ProcessSteps } from '@/components/shared/process-steps';
import { generatePageMetadata } from '@/lib/metadata';
import { getSiteContentSafe } from '@/services/site-content';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Wholesale',
  description:
    'Stock Solomon Islands handicrafts in your gallery or museum shop. Learn how wholesale ordering works.',
  path: '/wholesale',
});

export default async function WholesalePage() {
  const [siteContent, text] = await Promise.all([getSiteContentSafe(), getSiteTextSafe()]);

  // Four steps from the CMS. `n` is the step's position in the manifest, kept
  // through the filter so it can serve as both the React key and the visible
  // number — the index after filtering would renumber the remaining steps.
  // Filter on the heading alone: the heading is the step's title and its
  // accessible name, so clearing the title in the CMS hides the whole step
  // (a body with no heading would render as an orphaned, untitled step).
  const steps = [1, 2, 3, 4]
    .map((n) => ({
      n,
      heading: text[`wholesale.step${n}Heading`],
      body: text[`wholesale.step${n}Body`],
    }))
    .filter((step) => step.heading);

  const faqs = [1, 2, 3]
    .map((n) => ({
      question: text[`wholesale.faq${n}Question`],
      answer: text[`wholesale.faq${n}Answer`],
    }))
    .filter((faq) => faq.question);

  return (
    <div>
      <PageHeader
        banner="gold"
        eyebrow="For stockists"
        title={text['wholesale.title']}
        intro={siteContent.wholesaleIntro}
      />

      {/* How it works — the shared responsive stepper (vertical on a phone, a
          full-width row from `lg`). Same component the homepage uses for its
          condensed three-step version, so the two stay in sync. */}
      {steps.length > 0 && (
        <div className="site-container mb-block">
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
              {text['wholesale.stepsHeading']}
            </h2>
            <ProcessSteps steps={steps} ariaLabel={text['wholesale.stepsHeading']} />
          </section>
        </div>
      )}

      {/* Prose column is constrained to max-w-3xl but stays left-aligned so it
          lines up with the PageHeader above it. */}
      <div className="site-container pb-section">
        <div className="max-w-3xl">
          {/* Important note — the shared `note` Callout (quiet sand surface +
              icon), so it reads as a deliberate aside consistent with the other
              notices on the site rather than a heavy grey slab. */}
          {text['wholesale.note'] && (
            <Callout variant="note" className="mb-block">
              <CmsText
                value={text['wholesale.note']}
                className="space-y-xs"
                paragraphClassName="text-base leading-relaxed"
              />
            </Callout>
          )}

          {/* Common questions */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
              {text['wholesale.faqHeading']}
            </h2>

            <div>
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} variant="heading" title={faq.question}>
                  <CmsText
                    value={faq.answer}
                    className="space-y-xs"
                    paragraphClassName="text-base text-warm-gray-600 leading-relaxed"
                  />
                </AccordionItem>
              ))}
            </div>

            {/* Minimum-order note — lives on Site Content → Wholesale. Flags
                the GST threshold, so it is a `warning` Callout (gold) rather
                than a plain paragraph a reader can skim past. It is static page
                copy, not a live response, so role="status" (not "alert"). */}
            {siteContent.wholesaleMinimumOrder && (
              <Callout variant="warning" role="status" className="mt-md max-w-2xl">
                {siteContent.wholesaleMinimumOrder}
              </Callout>
            )}

            <div className="mt-md">
              <Link
                href="/faqs-and-shipping"
                className="text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
              >
                {text['wholesale.moreFaqsLabel']}
              </Link>
            </div>
          </section>
        </div>
      </div>

      <PageCta
        heading={text['wholesale.ctaHeading']}
        description={text['wholesale.ctaDescription']}
      >
        <ButtonLink href="/stockist/apply" variant="primary">
          {text['wholesale.ctaPrimaryButton']}
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary">
          {text['wholesale.ctaSecondaryButton']}
        </ButtonLink>
      </PageCta>
    </div>
  );
}
