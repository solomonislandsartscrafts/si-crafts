'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * The one accordion look on the site. A hairline `border-t border-sand` seam,
 * an uppercase tiny-caps label, and a `ChevronDown` that rotates 180° when
 * open — the treatment first built for the product page's "Product details" /
 * "How it's made" panels, now shared so every accordion (FAQ, wholesale,
 * product) reads as one device.
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
    <div className="border-t border-sand">
      <Heading>
        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={panelId}
          id={headerId}
          className="tap-target flex w-full cursor-pointer items-center justify-between gap-sm py-xs text-left text-xs font-semibold uppercase tracking-wider text-warm-gray-600 transition-colors hover:text-deep-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
        >
          {title}
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 text-warm-gray-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </Heading>
      {open && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="pb-xs">
          {children}
        </div>
      )}
    </div>
  );
}
