import Link from 'next/link';

/**
 * Acknowledgement of Country / mana whenua.
 *
 * The wording is admin-editable (site-text keys `acknowledgement.*`) rather
 * than hardcoded, because it is exactly the copy most likely to need changing
 * on advice from a Gadigal / Eora Nation contact, an Aboriginal Land Council,
 * or Kāi Tahu — and needing a code deploy to act on that advice was the wrong
 * shape for this content.
 *
 * Both components take their text as props so the page or footer that renders
 * them fetches once. Do not add cultural detail that cannot be verified.
 */

interface AcknowledgementProps {
  heading: string;
  text: string;
  solomonText: string;
}

/** Full version — for content pages such as About. */
export function AcknowledgementOfCountry({
  heading,
  text,
  solomonText,
}: AcknowledgementProps) {
  return (
    <section
      className="section-y bg-ocean/5 border-t border-ocean/10"
      id="acknowledgement"
      aria-labelledby="acknowledgement-heading"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <h2
            id="acknowledgement-heading"
            className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4"
          >
            {heading}
          </h2>
          <div className="space-y-4 text-warm-gray-600 leading-relaxed">
            {text && <p>{text}</p>}
            {solomonText && <p>{solomonText}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Condensed version — sits in the site footer on every page. */
export function AcknowledgementFooterNote({
  text,
  linkLabel,
}: {
  text: string;
  linkLabel: string;
}) {
  if (!text) return null;

  return (
    <div className="border-b border-white/10">
      <div
        className="site-container py-5"
        aria-label="Acknowledgement of Country"
        role="region"
      >
        <p className="text-base text-white/70 leading-relaxed max-w-3xl">
          {text}{' '}
          <Link
            href="/about#acknowledgement"
            className="text-white/70 hover:text-white transition-colors underline underline-offset-2"
          >
            {linkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
