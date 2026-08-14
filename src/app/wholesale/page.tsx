import Link from 'next/link';
import { IconJoinUs, IconWovenBasket, IconBankTransfer, IconParcelLeaf } from '@/components/icons/craft-icons';
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
      'We ship from Melbourne. Each piece arrives with a QR-coded tag linking to its maker\u2019s story.',
  },
];

export default async function WholesalePage() {
  const siteContent = await getSiteContentSafe();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 page-y pb-12 lg:pb-16">
      {/* Intro */}
      <h1 className="font-heading text-3xl md:text-4xl font-medium text-deep-blue mb-4">
        Wholesale
      </h1>
      <p className="text-warm-gray-600 leading-relaxed max-w-2xl mb-12">
        {siteContent.wholesaleIntro || "We supply museum shops and galleries in Australia with authentic Solomon Islands handicrafts. No minimum order. Bank transfer only. Here's how it works."}
      </p>

      {/* How it works — simple numbered steps */}
      <section className="mb-12">
        <h2 className="font-heading text-xl md:text-2xl font-medium text-deep-blue mb-8">
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
                  <h3 className="font-heading text-base font-semibold text-deep-blue mb-1">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-warm-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Important note */}
      <div className="bg-sand-light rounded-lg p-5 mb-12">
        <p className="text-sm text-warm-gray-800 leading-relaxed">
          <strong>Please note:</strong> Orders are expressions of interest, not confirmed
          purchases. Stock is limited and handmade — we&apos;ll confirm what&apos;s available
          after you submit. We send an invoice once confirmed and ship after payment (within
          30 days). We absorb freight costs at this stage.
        </p>
      </div>

      {/* Common questions */}
      <section className="mb-12">
        <h2 className="font-heading text-xl md:text-2xl font-medium text-deep-blue mb-6">
          Common questions
        </h2>

        <dl className="space-y-6">
          <div>
            <dt className="font-heading font-semibold text-deep-blue mb-1">
              Can I return unsold goods?
            </dt>
            <dd className="text-sm text-warm-gray-600 leading-relaxed">
              No — orders are purchased outright at wholesale price. We accept returns only
              for damage in transit (within 7 days of delivery with photos).
            </dd>
          </div>
          <div>
            <dt className="font-heading font-semibold text-deep-blue mb-1">
              Can I order custom or bulk items?
            </dt>
            <dd className="text-sm text-warm-gray-600 leading-relaxed">
              Yes — log in to your stockist account and submit a request under
              &ldquo;Requests&rdquo;. Not a retail business?{' '}
              <Link href="/contact" className="text-ocean hover:text-ocean-dark">
                Contact us
              </Link>{' '}
              about individual bulk orders.
            </dd>
          </div>
          <div>
            <dt className="font-heading font-semibold text-deep-blue mb-1">
              Is there a minimum order?
            </dt>
            <dd className="text-sm text-warm-gray-600 leading-relaxed">
              No minimum, but we encourage orders of at least 6 pieces for shipping efficiency.
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <Link
            href="/faqs-and-shipping"
            className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
          >
            More FAQs (returns, GST, shipping) →
          </Link>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="tap-target inline-flex items-center justify-center px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
        >
          Log in as stockist
        </Link>
        <Link
          href="/stockist/apply"
          className="tap-target inline-flex items-center justify-center px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          Apply to become a stockist
        </Link>
      </div>
    </div>
  );
}
