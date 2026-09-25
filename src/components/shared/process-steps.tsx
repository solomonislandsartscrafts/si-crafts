import { CmsText } from '@/components/ui/cms-text';

/**
 * ProcessSteps — the one "how it works" stepper on the site.
 *
 * A responsive numbered sequence: a vertical list on a phone, laid across the
 * full width as a row from `lg` up (using space a single column leaves empty).
 * A quiet `sand` connector runs THROUGH the badge centres — vertical on mobile,
 * horizontal on desktop — so the steps read as one journey rather than separate
 * cards. One accent per step: a short gold rule under the heading. No icons; the
 * numbered `deep-blue` badge is the marker.
 *
 * Used by the wholesale page (four detailed steps) and the homepage (a
 * condensed three-step version), so the two share one look and one accessibility
 * treatment. The badge, rule and connector are `aria-hidden` — the <ol> conveys
 * order and each heading names the step.
 */

export interface ProcessStep {
  /** Visible step number (1-based). Kept explicit so a filtered list does not
   *  renumber the steps it keeps. */
  n: number;
  heading: string;
  /** Body copy — may carry CMS inline markup (**bold**, [links](/path)). */
  body: string;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
  /** Accessible label for the ordered list. */
  ariaLabel?: string;
}

export function ProcessSteps({ steps, ariaLabel = 'How it works' }: ProcessStepsProps) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-col lg:flex-row" aria-label={ariaLabel}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={step.n} className="flex gap-sm lg:flex-1 lg:flex-col lg:gap-0">
            {/* Badge + connector. On mobile this column sits to the LEFT of the
                text with a vertical connector under the badge; on desktop it
                becomes a full-width row above the text with a horizontal
                connector to the badge's right. */}
            <div className="flex flex-col items-center lg:w-full lg:flex-row">
              {/* Exposed to assistive tech (not aria-hidden): `step.n` is an
                  EXPLICIT number that can differ from the DOM position when a
                  step is omitted (e.g. 1, 2, 4), so relying on the <ol>'s
                  implicit position would announce the wrong number. A visually
                  hidden "Step " prefix makes a screen reader read "Step 4"
                  rather than a bare "4"; the visible badge is unchanged. */}
              <span className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-deep-blue font-heading text-lg font-semibold text-white tabular-nums">
                <span className="sr-only">Step </span>
                {step.n}
              </span>
              {/* Connector fills the space toward the next badge. Hidden on the
                  last step and re-oriented per breakpoint. */}
              {!isLast && (
                <span
                  className="w-px flex-1 bg-sand lg:h-px lg:w-auto lg:flex-1"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="flex-1 pb-lg lg:pb-0 lg:pr-md lg:pt-sm">
              {step.heading && (
                <h3 className="font-heading text-lg font-semibold text-deep-blue mb-2xs">
                  {step.heading}
                </h3>
              )}
              {/* Short gold accent rule — the one accent per step, echoing the
                  flag-mark under section headings. */}
              <span
                className="mb-xs block h-[3px] w-8 rounded-full bg-accent-gold"
                aria-hidden="true"
              />
              <CmsText
                value={step.body}
                className="space-y-xs"
                paragraphClassName="text-base text-warm-gray-600 leading-relaxed"
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
