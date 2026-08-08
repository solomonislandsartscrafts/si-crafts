import Link from 'next/link';

export function WhereToBuy() {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-xl font-medium text-deep-blue mb-3">Where to Buy</h2>
      <p className="text-warm-gray-600 mb-4">
        Interested in stocking this piece? We supply museum and gallery shops in Australia.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/wholesale"
          className="tap-target inline-flex items-center gap-2 px-5 py-3 btn-primary"
        >
          Wholesale enquiries
        </Link>
        <Link
          href="/stockists"
          className="tap-target inline-flex items-center gap-2 px-5 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          Find a retailer
        </Link>
      </div>

      {/* Subtle impact note — factual, not splashy */}
      <p className="mt-6 text-sm text-warm-gray-600 border-l-2 border-sand pl-4">
        When you buy this piece through a stockist, the maker receives the price they set — paid upfront, before the piece reaches Australia. No middlemen, no commission.
        <Link href="/our-promise" className="text-ocean hover:text-ocean-dark ml-1">
          Learn about our values →
        </Link>
      </p>
    </section>
  );
}
