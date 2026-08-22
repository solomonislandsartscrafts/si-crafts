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
    <section className="section-y bg-ocean/5 border-t border-ocean/10">
      <div className="site-container text-center">
        {/* Heading sits tight to its description (8px) so the two read as one
            block, then a full 24px step down to the actions. */}
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2">
          {heading}
        </h2>
        {description && (
          <p className="text-warm-gray-600 leading-relaxed mb-6 max-w-xl mx-auto">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          {children}
        </div>
      </div>
    </section>
  );
}
