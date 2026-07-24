import Link from 'next/link';
import { IconJoinUs, IconWovenBasket, IconBankTransfer, IconParcelLeaf } from '@/components/icons/craft-icons';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Wholesale',
  description:
    'Stock Solomon Islands handicrafts in your gallery or museum shop. Learn how wholesale ordering works.',
  path: '/wholesale',
});

export default function WholesalePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">
        Wholesale
      </h1>
      <p className="text-lg text-warm-gray-600 max-w-2xl leading-relaxed mb-12">
        We supply museum shops and galleries in Australia with authentic Solomon Islands 
        handicrafts. Here&apos;s how ordering works.
      </p>

      {/* How it works */}
      <h2 className="font-heading text-2xl font-bold text-deep-blue mb-8">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center mb-4">
            <IconJoinUs className="w-6 h-6 text-ocean" />
          </div>
          <h3 className="font-heading font-semibold text-deep-blue mb-2">1. Apply</h3>
          <p className="text-sm text-warm-gray-600">
            Submit a short application with your business details. We review all applications 
            within a few business days. If you are not a retail business but an individual wanting 
            to place a bulk order, see our{' '}
            <Link href="/contact" className="text-ocean hover:underline">contact page</Link>.
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center mb-4">
            <IconWovenBasket className="w-6 h-6 text-ocean" />
          </div>
          <h3 className="font-heading font-semibold text-deep-blue mb-2">2. Browse & Order</h3>
          <p className="text-sm text-warm-gray-600">
            Once approved, log in to see wholesale pricing and build an order. 
            Browse by material, product type, or maker.
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center mb-4">
            <IconBankTransfer className="w-6 h-6 text-ocean" />
          </div>
          <h3 className="font-heading font-semibold text-deep-blue mb-2">3. Pay by Transfer</h3>
          <p className="text-sm text-warm-gray-600">
            Orders are expressions of interest paid by bank transfer. We&apos;ll confirm 
            availability and send an invoice with payment details.
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center mb-4">
            <IconParcelLeaf className="w-6 h-6 text-ocean" />
          </div>
          <h3 className="font-heading font-semibold text-deep-blue mb-2">4. Receive</h3>
          <p className="text-sm text-warm-gray-600">
            We ship from our Melbourne warehouse. We are a small, volunteer-run social enterprise. 
            At this stage, we can guarantee that if you order with us by mid-September, we will 
            deliver your order by early November in time for Christmas shopping. We will absorb 
            the freight costs at this stage. We are exploring reliable freight options to fulfil 
            orders throughout 2027. Each piece arrives with a product tag with a QR code linking 
            to its maker&apos;s story.
          </p>
        </div>
      </div>

      {/* Important note */}
      <div className="bg-sand-light rounded-lg p-6 mb-12">
        <p className="text-sm text-warm-gray-800">
          <strong>Please note:</strong> Orders are expressions of interest, not confirmed purchases. 
          Stock is limited and handmade — we&apos;ll confirm what&apos;s available after you submit your request. 
          Payment is by bank transfer only; we send an invoice once availability is confirmed and ship after payment is received (no card payments at this stage). 
          Please pay all invoices within 30 days.
        </p>
      </div>

      {/* Common Questions */}
      <h2 className="font-heading text-2xl font-bold text-deep-blue mb-6">Common questions</h2>
      <div className="space-y-6 mb-12">
        <div>
          <h3 className="font-heading font-semibold text-deep-blue mb-2">Can I return unsold goods?</h3>
          <p className="text-sm text-warm-gray-600 leading-relaxed">
            We do not offer sale-or-return. Orders are purchased outright at wholesale price. 
            We accept returns only for damage in transit (within 7 days of delivery with photos).
          </p>
        </div>
        <div>
          <h3 className="font-heading font-semibold text-deep-blue mb-2">Can I order custom or bulk items?</h3>
          <p className="text-sm text-warm-gray-600 leading-relaxed">
            Yes — we can arrange customised pieces and bulk orders for exhibitions or events. 
            Log in to your stockist account and submit a request under &ldquo;Requests&rdquo;. 
            If you are not a retail business but an individual wanting to place a bulk order, 
            see our{' '}
            <Link href="/contact" className="text-ocean hover:underline">contact page</Link>.
          </p>
        </div>
      </div>

      {/* Link to full FAQs */}
      <div className="border-t border-sand pt-8 mb-12">
        <Link
          href="/faqs-and-shipping"
          className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
        >
          Have questions about returns, custom orders, or GST? See our FAQs →
        </Link>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="tap-target inline-flex items-center justify-center px-6 py-3 bg-ocean hover:bg-ocean-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
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
