/**
 * Closing CTA band — the standard way to end a page.
 *
 * Previously only /stockists and /wholesale ended with a call to action; the
 * other pages stopped on prose, an italic note, or a back link, so a first-time
 * visitor reached the bottom with nowhere to go. Use this to give every page a
 * consistent next step.
 *
 * Pass one or two actions — typically a <ButtonLink variant="primary"> plus an
 * optional secondary.
 */
interface PageCtaProps {
  heading: string;
  /** One or two sentences on why the visitor should act. */
  description?: string;
  /** Buttons or links. Use <ButtonLink> so styling matches everywhere. */
  children: React.ReactNode;
}

export function PageCta({ heading, description, children }: PageCtaProps) {
  return (
    // Solid deep-blue band — the ONE bold accent surface in the page's vertical
    // rhythm. It leads into the still-darker footer below it (footer-bg is a
    // deeper shade of the same flag-blue), so the bottom of every page steps
    // down deep-blue → darker, and gives the closing CTA real presence. Text is
    // white:
    // the heading forces white over the dark band, the description takes a
    // softened white. A flag hairline caps the top edge so the band reads as a
    // deliberate brand block rather than a plain colour fill.
    <section className="relative section-y bg-deep-blue">
      <div className="flag-hairline absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="site-container text-center">
        {/* Heading sits tight to its description (8px) so the two read as one
            block, then a full 24px step down to the actions. */}
        <h2 className="font-heading text-2xl md:text-3xl font-medium !text-white mb-2xs">
          {heading}
        </h2>
        {description && (
          <p className="text-white/80 leading-relaxed mb-md max-w-xl mx-auto">
            {description}
          </p>
        )}
        {/* Any secondary (ocean-outline) button passed as a second action is
            flipped to a white outline here, so it reads on the deep-blue band
            without every call site needing to know the band is dark. The
            `[&_...]` arbitrary variants scope this to buttons inside the CTA
            only. The primary green button is left as-is — green reads well on
            deep-blue. */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-xs [&_.btn-secondary]:!border-white/70 [&_.btn-secondary]:!text-white [&_.btn-secondary:hover]:!bg-white/10 [&_.btn-secondary:hover]:!border-white">
          {children}
        </div>
      </div>
    </section>
  );
}
