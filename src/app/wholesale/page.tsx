import Link from 'next/link';
import {
  IconJoinUs,
  IconWovenBasket,
  IconBankTransfer,
  IconParcelLeaf,
} from '@/components/icons/craft-icons';
import { PageHeader, PageCta } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { CmsText } from '@/components/ui/cms-text';
import { generatePageMetadata } from '@/lib/metadata';
import { getSiteContentSafe } from '@/services/site-content';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Wholesale',
  description:
    'Stock Solomon Islands handicrafts in your gallery or museum shop. Learn how wholesale ordering works.',
  path: '/wholesale',
});

/** One icon per step, in order. Kept in code — see the note on Our Promise. */
const STEP_ICONS = [IconJoinUs, IconWovenBasket, IconBankTransfer, IconParcelLeaf];

export default async function WholesalePage() {
  const [siteContent, text] = await Promise.all([getSiteContentSafe(), getSiteTextSafe()]);

  // `n` is the step's position in the manifest. Kept through the filter so it
  // can serve as both the React key and the visible number — the index after
  // filtering would renumber the remaining steps.
  const steps = STEP_ICONS.map((Icon, i) => ({
    Icon,
    n: i + 1,
    heading: text[`wholesale.step${i + 1}Heading`],
    body: text[`wholesale.step${i + 1}Body`],
  })).filter((step) => step.heading || step.body);

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

      {/* How it works breaks the full container width — a 2-up step grid on
          desktop reads as a row rather than one tall column and uses the space
          a single max-w-3xl column left empty. */}
      {steps.length > 0 && (
        <div className="site-container mb-block">
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
              {text['wholesale.stepsHeading']}
            </h2>

            <ol className="grid grid-cols-1 lg:grid-cols-2 gap-grid">
              {steps.map((step) => {
                const Icon = step.Icon;
                return (
                  <li key={step.n} className="flex gap-sm items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-ocean" />
                    </div>
                    <div>
                      {step.heading && (
                        <h3 className="font-heading text-lg font-semibold text-deep-blue mb-3xs">
                          {step.n}. {step.heading}
                        </h3>
                      )}
                      <CmsText
                        value={step.body}
                        className="space-y-xs"
                        paragraphClassName="text-base text-warm-gray-600 leading-relaxed"
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      )}

      {/* Prose column is constrained to max-w-3xl but stays left-aligned so it
          lines up with the PageHeader above it. */}
      <div className="site-container pb-section">
        <div className="max-w-3xl">
          {/* Important note */}
          {text['wholesale.note'] && (
            <div className="bg-sand-light rounded-lg p-md mb-block">
              <CmsText
                value={text['wholesale.note']}
                className="space-y-xs"
                paragraphClassName="text-base text-warm-gray-800 leading-relaxed"
              />
            </div>
          )}

          {/* Common questions */}
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
              {text['wholesale.faqHeading']}
            </h2>

            <dl className="space-y-md">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-heading text-lg font-semibold text-deep-blue mb-3xs">
                    {faq.question}
                  </dt>
                  <dd className="text-base text-warm-gray-600 leading-relaxed">
                    <CmsText value={faq.answer} className="space-y-xs" />
                  </dd>
                </div>
              ))}
            </dl>

            {/* Minimum-order note — lives on Site Content → Wholesale. */}
            {siteContent.wholesaleMinimumOrder && (
              <p className="mt-md text-base text-warm-gray-600 leading-relaxed">
                {siteContent.wholesaleMinimumOrder}
              </p>
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
