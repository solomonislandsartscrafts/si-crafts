import Link from 'next/link';
import { IconJoinUs, IconWovenBasket, IconBankTransfer, IconParcelLeaf } from '@/components/icons/craft-icons';
import { PageHeader, PageCta } from '@/components/layout';
import { ButtonLink } from '@/components/ui/button';
import { generatePageMetadata } from '@/lib/metadata';
import { getSiteContentSafe } from '@/services/site-content';

export const metadata = generatePageMetadata({
  title: 'Wholesale',
  description:
    'Stock Solomon Islands handicrafts in your gallery or museum shop. Learn how wholesale ordering works.',
  path: '/wholesale',
});

const steps = [
  {
    icon: IconJoinUs,
    title: 'Apply',
    description:
      'Submit a short application with your business details and ABN. We review within a few business days.',
  },
  {
    icon: IconWovenBasket,
    title: 'Browse & order',
    description:
      'Once approved, log in to see wholesale pricing and build an order by material, type, or maker.',
  },
  {
    icon: IconBankTransfer,
    title: 'Pay by transfer',
    description:
      'We confirm availability and send an invoice. You pay by bank transfer — no card payments at this stage.',
  },
  {
    icon: IconParcelLeaf,
    title: 'Receive',
    description:
      'We ship from Sydney. Each piece arrives with a QR-coded tag linking to its maker\u2019s story. We will pay the shipping costs for your first order.',
  },
];

export default async function WholesalePage() {
  const siteContent = await getSiteContentSafe();

  return (
    <div>
      <PageHeader
        title="Wholesale"
        intro={siteContent.wholesaleIntro || "We supply museum shops and galleries in Australia with authentic Solomon Islands handicrafts. No minimum order. Bank transfer only. Here's how it works."}
      />

      {/* Prose column is constrained to max-w-3xl but stays left-aligned so it
          lines up with the PageHeader above it. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="max-w-3xl">
      {/* How it works — simple numbered steps */}
      <section className="mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-8">
          How it works
        </h2>

        <ol className="space-y-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-ocean" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-deep-blue mb-1">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="text-base text-warm-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Important note */}
      <div className="bg-sand-light rounded-lg p-6 mb-12">
        <p className="text-base text-warm-gray-800 leading-relaxed">
          <strong>Please note:</strong> Orders are expressions of interest, not confirmed
          purchases. Stock is limited and handmade — we&apos;ll confirm what&apos;s available
          after you submit. We send an invoice once confirmed and ship after payment (within
          30 days). We absorb freight costs at this stage.
        </p>
      </div>

      {/* Common questions */}
      <section>
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-6">
          Common questions
        </h2>

        <dl className="space-y-6">
          <div>
            <dt className="font-heading text-lg font-semibold text-deep-blue mb-1">
              Can I return unsold goods?
            </dt>
            <dd className="text-base text-warm-gray-600 leading-relaxed">
              No — orders are purchased outright at wholesale prices.
            </dd>
          </div>
          <div>
            <dt className="font-heading text-lg font-semibold text-deep-blue mb-1">
              Can I order custom or bulk items?
            </dt>
            <dd className="text-base text-warm-gray-600 leading-relaxed">
              Yes — log in to your stockist account and submit a request under
              &ldquo;Requests&rdquo;. Not a retail business?{' '}
              <Link href="/contact" className="text-ocean hover:text-ocean-dark">
                Contact us
              </Link>{' '}
              about individual bulk orders.
            </dd>
          </div>
          <div>
            <dt className="font-heading text-lg font-semibold text-deep-blue mb-1">
              Is there a minimum order?
            </dt>
            <dd className="text-base text-warm-gray-600 leading-relaxed">
              No minimum, but we encourage orders of at least 6 pieces for shipping efficiency.
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <Link
            href="/faqs-and-shipping"
            className="text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
          >
            More FAQs (returns, GST, shipping) →
          </Link>
        </div>
      </section>
        </div>
      </div>

      <PageCta
        heading="Ready to stock SI Crafts?"
        description="Apply for a wholesale account, or log in if you already have one."
      >
        <ButtonLink href="/stockist/apply" variant="primary">
          Apply to become a stockist
        </ButtonLink>
        <ButtonLink href="/login" variant="secondary">
          Log in as stockist
        </ButtonLink>
      </PageCta>
    </div>
  );
}
