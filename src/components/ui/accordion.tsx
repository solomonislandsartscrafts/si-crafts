'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * The one accordion look on the site. Each item is a SOLID WHITE CARD
 * (`bg-card-bg` + `shadow-card` + `rounded-lg`) rather than rows joined by
 * hairline seams, so:
 *   - the text always sits on an opaque white surface — no page background or
 *     decorative artwork bleeds through behind it, and
 *   - there are no divider "underlines" between items; the cards are separated
 *     by a small gap instead, which reads simpler and cleaner.
 *
 * State is made obvious, which the old seam-only treatment did not do:
 *   - HOVER / FOCUS — the trigger fills solid `sand-light` (an accessible light
 *     surface: the `warm-gray-600`/`deep-blue` label stays AA over it) so it is
 *     clear the header is interactive and which one you are pointing at.
 *   - OPEN — a `brand-green` left accent bar runs down the card and the label
 *     goes `deep-blue`, so an open panel is unmistakably the active one. The
 *     `ChevronDown` still rotates 180°.
 *
 * The header is a <button> inside a heading (so each panel is a stop in
 * heading-based navigation), with `aria-expanded` / `aria-controls` wired to a
 * `role="region"` body. The body is UNMOUNTED when closed, not just hidden, so
 * collapsed content stays out of the tab order and the accessibility tree.
 *
 * Two trigger looks, chosen with `variant`:
 *   - `label` (default) — `text-xs` uppercase, a LABEL not prose, so it sits
 *     outside the 16px readable-text floor. The compact panel look used by the
 *     wholesale FAQ block.
 *   - `heading` — a sentence-case `text-base`/`text-lg` semibold heading in
 *     `deep-blue`, matching the FAQs & Shipping page. Its open state tints the
 *     card border `ocean` (rather than the green left bar) and the body is
 *     separated with a top hairline, so a group of these reads as readable
 *     questions rather than terse metadata panels. Used by the piece page.
 *
 * Body content is the caller's, and stays `text-base`.
 */

/** Heading level for the wrapping element, so a page's outline stays correct. */
type HeadingLevel = 'h2' | 'h3';

/** Trigger typography + open-state treatment. See the file header. */
type AccordionVariant = 'label' | 'heading';

interface AccordionItemProps {
  /**
   * Visible label. In the `label` variant it is rendered uppercase via CSS, so
   * pass it in sentence case; the `heading` variant shows it as written.
   */
  title: string;
  children: ReactNode;
  /** Wrapping heading tag. Defaults to h3. */
  as?: HeadingLevel;
  /** Trigger look. Defaults to `label` (the compact tiny-caps panel). */
  variant?: AccordionVariant;
  /**
   * Controlled mode: parent owns open state (used by the single-open product
   * group, where opening one panel closes another). Omit both for the default
   * uncontrolled behaviour, where each item toggles itself.
   */
  isOpen?: boolean;
  onToggle?: () => void;
  /** Uncontrolled initial state. Ignored when `isOpen` is provided. */
  defaultOpen?: boolean;
  /**
   * When true, the open body is taken out of normal flow (absolutely
   * positioned, floating over whatever follows) instead of pushing later
   * content down. Used by the piece page's info column, where opening a panel
   * should overlay the content below rather than move it. The floating body
   * gets an opaque surface + shadow so it reads as a layer above the page.
   * Off by default — every other accordion pushes content as normal.
   */
  overlayBody?: boolean;
}

export function AccordionItem({
  title,
  children,
  as: Heading = 'h3',
  variant = 'label',
  isOpen: controlledOpen,
  onToggle,
  defaultOpen = false,
  overlayBody = false,
}: AccordionItemProps) {
  const isHeading = variant === 'heading';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setUncontrolledOpen((v) => !v);
    }
  };

  // Stable, unique ids tie the header to its region for `aria-controls` /
  // `aria-labelledby` even with several accordions on one page.
  const uid = useId();
  const headerId = `accordion-header-${uid}`;
  const panelId = `accordion-panel-${uid}`;

  return (
    // The card. Solid white surface so nothing behind the accordion shows
    // through the text. When open, a `brand-green` left accent bar marks it as
    // the active panel; when closed the border-left is transparent so every
    // card keeps the same width and only the colour changes. `overflow-hidden`
    // keeps the rounded corners clean over the trigger's hover fill.
    <div
      // `mb-xs` gives a small, consistent gap between stacked items so they read
      // as separate cards without the old divider seams. It is intrinsic to the
      // item so every caller (product page, wholesale, FAQ) gets the same rhythm
      // with no wrapper changes; the trailing margin on the last item is
      // harmless (callers own the spacing to whatever follows).
      //
      // Open-state accent differs by variant: the `label` panel gets a
      // `brand-green` left bar; the `heading` question card matches the FAQs
      // page — a full `ocean/40` border, no left bar.
      className={[
        // In overlay mode the card is a positioning context for its floating
        // body and is lifted above later siblings while open, so the panel
        // layers over the content below instead of pushing it. `overflow-hidden`
        // is dropped in overlay mode — it would clip the absolutely-positioned
        // body — so the rounded corners are carried by the body itself.
        overlayBody ? 'relative' : 'overflow-hidden',
        overlayBody && open ? 'z-20' : '',
        isHeading
          ? `mb-xs rounded-lg border transition-colors ${
              open ? 'border-ocean/40 bg-card-bg shadow-card' : 'border-sand bg-card-bg'
            }`
          : `mb-xs rounded-lg border-l-4 bg-card-bg shadow-card transition-colors ${
              open ? 'border-brand-green' : 'border-transparent'
            }`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Heading>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={panelId}
          id={headerId}
          // `label`: hover/focus fill is a solid, accessible `sand-light`, so it
          // is obvious which header you are on; open headers read `deep-blue` +
          // uppercase, closed ones `warm-gray-600`.
          // `heading`: a sentence-case readable heading (FAQs page treatment);
          // subtle `sand-light/60` hover fill, always `deep-blue`.
          className={[
            // In overlay mode the card drops `overflow-hidden` (so the floating
            // body isn't clipped), so the header itself carries the rounding to
            // keep its hover fill inside the card corners: all four when closed,
            // just the top when open (the body rounds the bottom).
            overlayBody ? (open ? 'rounded-t-lg' : 'rounded-lg') : '',
            isHeading
              ? 'tap-target flex w-full cursor-pointer items-center justify-between gap-sm px-sm py-sm text-left font-heading text-base font-semibold leading-title-sm text-deep-blue transition-colors hover:bg-sand-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean sm:px-md sm:text-lg'
              : `tap-target flex w-full cursor-pointer items-center justify-between gap-sm px-sm py-sm text-left text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean ${
                  open ? 'text-deep-blue' : 'text-warm-gray-600 hover:text-deep-blue'
                }`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
          {isHeading ? (
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-ocean transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                open ? 'rotate-180 text-brand-green' : 'text-warm-gray-400'
              }`}
              aria-hidden="true"
            />
          )}
        </button>
      </Heading>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className={[
            // The `heading` variant separates the body with a top hairline (FAQs
            // page treatment); the `label` panel runs straight into its body.
            isHeading ? 'border-t border-sand px-sm pb-sm pt-xs sm:px-md' : 'px-sm pb-sm',
            // Overlay mode: pull the body out of flow so it floats over the
            // content below instead of pushing it down. It is pinned to the
            // full width of the card, sits just under the header, and carries an
            // opaque surface + shadow + rounded bottom corners so it reads as a
            // distinct floating layer. `overflow-y-auto` + a max height keep a
            // very tall panel from running off the bottom of the viewport.
            overlayBody
              ? 'absolute inset-x-0 top-full z-20 max-h-[70vh] overflow-y-auto rounded-b-lg bg-card-bg shadow-md ' +
                (isHeading ? 'border-x border-b border-ocean/40' : '')
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      )}
    </div>
  );
}
