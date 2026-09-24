'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { Info } from 'lucide-react';

interface InfoTipProps {
  /** Accessible label for the trigger, e.g. "About ABN". */
  label: string;
  /** The help content shown in the popover. */
  children: React.ReactNode;
  /** Extra classes for the trigger wrapper (positioning). */
  className?: string;
  /**
   * Which edge the panel aligns to. Default 'left' opens the panel rightward
   * from the icon — correct when the icon sits at the LEFT of a row (e.g. next
   * to a field label). Use 'right' when the icon sits at the far right so the
   * panel opens back into the content instead of off-screen.
   */
  align?: 'left' | 'right';
  /**
   * Whether the panel opens above or below the icon. Default 'top' opens it
   * ABOVE — for an icon next to a field label, this keeps the panel clear of
   * the input below so it never blocks the field the user is filling in.
   */
  side?: 'top' | 'bottom';
}

/**
 * A small info icon that reveals a short help popover on hover, focus, or
 * click/tap. Use it for a format cue or example that would clutter the label
 * row if shown inline (e.g. the ABN format).
 *
 * Accessibility:
 * - The trigger is a real <button> with an aria-label, so it's keyboard- and
 *   screen-reader-reachable (hover-only help is invisible to both).
 * - Hover/focus opens it for pointer and keyboard users; click toggles it so
 *   touch users (no hover) can open it too.
 * - Escape closes it and returns focus to the trigger; an outside click closes
 *   it. The panel is aria-hidden when closed so it isn't announced.
 * - The panel is linked to the trigger via aria-describedby, so its text is
 *   announced when the trigger gains focus.
 */
export function InfoTip({ label, children, className = '', align = 'left', side = 'top' }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex ${className}`.trim()}
      // Hover opens for pointer users. Keyboard users get the same via focus
      // on the button below; touch users get it via click (no hover event).
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ocean transition-colors hover:text-ocean-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>

      <span
        id={panelId}
        role="tooltip"
        hidden={!open}
        className={`absolute z-20 w-64 rounded-md border border-sand bg-white p-sm text-left text-sm leading-relaxed text-warm-gray-600 shadow-md ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${side === 'bottom' ? 'top-full mt-2xs' : 'bottom-full mb-2xs'}`}
      >
        {children}
      </span>
    </span>
  );
}
