'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does wholesale ordering work?',
    a: 'Browse our catalogue, build an order, and submit it as an expression of interest. We confirm availability, send an invoice, and ship once payment is received by bank transfer. There are no minimum order quantities, but we encourage orders of at least 6 pieces for shipping efficiency.',
  },
  {
    q: 'How long does delivery take?',
    a: 'We ship from our Melbourne warehouse within 3–5 business days of receiving payment. Delivery within Australia is typically 2–5 business days depending on your location. We use tracked shipping on all orders.',
  },
  {
    q: 'What is your returns policy?',
    a: 'Because each piece is handmade, no two are identical. We accept returns for damage in transit within 7 days of delivery — contact us with photos and we will arrange a replacement or refund. We cannot accept returns for change of mind on handmade goods.',
  },
  {
    q: 'Can I return unsold goods?',
    a: 'No — orders are purchased outright at wholesale price. We do not offer sale-or-return. We recommend starting with a small order to gauge customer interest before committing to larger quantities.',
  },
  {
    q: 'Do you provide retail sales? Can I buy directly from makers or SIAC?',
    a: 'No — Solomon Islands Arts and Crafts is wholesale-only. We do not sell individual pieces to the public. If you are a retail customer, please visit one of our stocking retailers (check the "Where to buy" section on any product\'s provenance page) to purchase a piece in person.',
  },
  {
    q: 'Can I order custom or bulk items?',
    a: 'Yes — we can arrange customised pieces (e.g. a gallery name woven into a bag border) and bulk orders for exhibitions or events. Lead times are longer as makers produce to order. Log in to your stockist account and submit a request under "Requests", or contact us to discuss.',
  },
  {
    q: 'How do I get a replacement tag if mine fell off?',
    a: 'Log in to your stockist account and go to "Requests" → "Replacement Tags". Enter the product code and quantity needed. We\'ll post new tags to you at no charge.',
  },
  {
    q: 'Why do you sell only through museum and gallery shops?',
    a: 'We are a small volunteer team. Selling wholesale means we can move more pieces with fewer transactions, keep admin low, and focus our time on relationships with makers. Museum and gallery shops also provide an environment where provenance and storytelling are valued — which respects the work and the makers behind it.',
  },
  {
    q: 'Are the items really made in Solomon Islands?',
    a: 'Yes — every piece is handmade by a named maker in their community. Each product tag carries a code that links to a provenance page showing who made it, where, and how. We buy directly from makers; there is no third-party factory or intermediary supply chain.',
  },
  {
    q: 'How much of the price goes back to the maker?',
    a: '[NEEDS REVIEW — placeholder: exact figures to be confirmed] Makers set their own prices and are paid upfront when we collect the work — before it reaches Australia. SIAC\'s margin covers international freight, documentation, and distribution. No one at SIAC draws a salary from craft sales. See our Our Promise page for more detail.',
  },
  {
    q: 'How do I become a stockist?',
    a: 'Submit an application through our Wholesale page with your business details and ABN. We review applications within a few business days and will be in touch once approved.',
  },
  {
    q: 'What about GST?',
    a: 'Our wholesale prices are quoted exclusive of GST. If your order exceeds A$1,000 you may have GST obligations — we display a reminder at checkout. Please consult your accountant for advice specific to your business.',
  },
];

export default function FaqsAndShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">FAQs & Shipping</h1>
      <p className="text-lg text-warm-gray-600 mb-12 leading-relaxed">
        Common questions about ordering, delivery, and working with us.
      </p>

      <div className="space-y-2">
        {FAQS.map((faq, i) => (
          <FaqItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>

      <div className="mt-12 bg-sand-light rounded-lg p-6">
        <p className="text-warm-gray-600">
          Have a question we haven&apos;t answered?{' '}
          <Link href="/contact" className="text-ocean hover:underline font-medium">Get in touch</Link> and we&apos;ll help.
        </p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-sand rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="tap-target w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-ocean rounded-lg"
        aria-expanded={open}
      >
        <span className="font-heading text-sm sm:text-base font-semibold text-deep-blue">
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-warm-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-warm-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
