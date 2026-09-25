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
 * The trigger label is `text-xs` uppercase — a LABEL, not prose, so it sits
 * outside the 16px readable-text floor exactly as the product page does. Body
 * content is the caller's, and stays `text-base`.
 */

/** Heading level for the wrapping element, so a page's outline stays correct. */
type HeadingLevel = 'h2' | 'h3';

interface AccordionItemProps {
  /** Visible label. Rendered uppercase via CSS, so pass it in sentence case. */
  title: string;
  children: ReactNode;
  /** Wrapping heading tag. Defaults to h3. */
  as?: HeadingLevel;
  /**
   * Controlled mode: parent owns open state (used by the single-open product
   * group, where opening one panel closes another). Omit both for the default
   * uncontrolled behaviour, where each item toggles itself.
   */
  isOpen?: boolean;
  onToggle?: () => void;
  /** Uncontrolled initial state. Ignored when `isOpen` is provided. */
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  as: Heading = 'h3',
  isOpen: controlledOpen,
  onToggle,
  defaultOpen = false,
}: AccordionItemProps) {
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
      className={`mb-xs overflow-hidden rounded-lg border-l-4 bg-card-bg shadow-card transition-colors ${
        open ? 'border-brand-green' : 'border-transparent'
      }`}
    >
      <Heading>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={panelId}
          id={headerId}
          // Hover/focus fill is a solid, accessible `sand-light`, so it is
          // obvious which header you are on. Open headers read `deep-blue` +
          // (already) semibold; closed headers are `warm-gray-600`.
          className={`tap-target flex w-full cursor-pointer items-center justify-between gap-sm px-sm py-sm text-left text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean ${
            open ? 'text-deep-blue' : 'text-warm-gray-600 hover:text-deep-blue'
          }`}
        >
          {title}
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
              open ? 'rotate-180 text-brand-green' : 'text-warm-gray-400'
            }`}
            aria-hidden="true"
          />
        </button>
      </Heading>
      {open && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="px-sm pb-sm">
          {children}
        </div>
      )}
    </div>
  );
}
