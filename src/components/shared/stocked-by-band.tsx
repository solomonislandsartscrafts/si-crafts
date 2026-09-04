import { getSiteTextSafe } from '@/services/site-text';

/**
 * "Stocked by" — a quiet wholesale trust band naming the museum and gallery
 * shops that stock SIAC.
 *
 * This is the wholesale-appropriate answer to the retail "customer reviews"
 * band the reference sites use: a wholesale buyer is reassured by who ELSE
 * stocks the range, not by star ratings. Distinct from `<SponsorBanner>`, which
 * credits who FUNDS the enterprise — this credits who BUYS from it.
 *
 * Content is admin-editable via two site-text keys and is BLANK by default, so
 * the band renders `null` until a volunteer fills in real names. That is
 * deliberate and matches `<SponsorBanner>`: we never claim a stockist that has
 * not confirmed they are happy to be named. No names are invented here.
 *
 * Names are stored as one multiline string, one name per line — the site-text
 * store holds strings, and a shop-name list needs no structure beyond that. A
 * blank line is dropped so a stray newline cannot render an empty slot.
 *
 * Surface is the warm band: it sits between the white Products section and the
 * deep-blue CTA on the homepage, so the warm surface keeps the section
 * alternation (white hero → warm Makers → white Products → warm StockedBy →
 * deep-blue CTA → white News) the design system requires.
 */
export async function StockedByBand() {
  const text = await getSiteTextSafe();

  const names = (text['homepage.stockedByNames'] || '')
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  // No confirmed stockists to name yet: show nothing rather than an empty label.
  if (names.length === 0) return null;

  const label = text['homepage.stockedByLabel'];

  return (
    <section className="section-y section-band" aria-label="Our stockists">
      <div className="site-container">
        {label && (
          <p className="text-xs font-bold uppercase tracking-widest text-warm-gray-400 mb-stack text-center">
            {label}
          </p>
        )}
        {/* Names as a centred wrapping row, each a distinct slot separated by a
            quiet vertical rule — the same "reads as a set" treatment the
            supporters wall uses, in text rather than logos. */}
        <ul className="flex flex-wrap items-center justify-center gap-x-md gap-y-sm">
          {names.map((name, index) => (
            <li key={name} className="flex items-center gap-x-md">
              {index > 0 && (
                <span className="h-5 w-px bg-sand-dark" aria-hidden="true" />
              )}
              <span className="font-heading text-lg font-medium text-deep-blue leading-heading">
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
