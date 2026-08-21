import Link from 'next/link';

/**
 * Acknowledgement of Country / mana whenua.
 *
 * NEEDS CULTURAL REVIEW before launch: check the wording with a
 * Gadigal / Eora Nation contact or an Aboriginal Land Council if possible,
 * and with Kāi Tahu iwi for the Aotearoa acknowledgement.
 * Do not add cultural detail we cannot verify.
 */

const ACKNOWLEDGEMENT_TEXT =
  'This website was developed on the lands of the Gadigal people of the Eora nation in the land we now call Australia, and the lands of the Kāi Tahu iwi of Ōtepoti Dunedin in Aotearoa (New Zealand).';

const SOLOMON_TEXT =
  'The crafts shown here belong to the peoples and communities of Solomon Islands. We acknowledge the makers, their families, and the knowledge carried in every piece.';

/** Full version — for content pages such as About. */
export function AcknowledgementOfCountry() {
  return (
    <section
      className="section-y bg-ocean/5 border-t border-ocean/10"
      id="acknowledgement"
      aria-labelledby="acknowledgement-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2
            id="acknowledgement-heading"
            className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4"
          >
            Acknowledgement of Country
          </h2>
          <div className="space-y-4 text-warm-gray-600 leading-relaxed">
            <p>{ACKNOWLEDGEMENT_TEXT}</p>
            <p>{SOLOMON_TEXT}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Condensed version — sits in the site footer on every page. */
export function AcknowledgementFooterNote() {
  return (
    <div className="border-b border-white/10">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        aria-label="Acknowledgement of Country"
        role="region"
      >
        <p className="text-base text-white/70 leading-relaxed max-w-3xl">
          {ACKNOWLEDGEMENT_TEXT}{' '}
          <Link
            href="/about#acknowledgement"
            className="text-white/70 hover:text-white transition-colors underline underline-offset-2"
          >
            Read our full acknowledgement
          </Link>
        </p>
      </div>
    </div>
  );
}
