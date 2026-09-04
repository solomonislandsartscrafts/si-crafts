'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  /** Current quantity value. */
  value: number;
  /** Called with the next value when either button is pressed. */
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** What the quantity is for — used to build each button's accessible name
   *  (e.g. "Decrease quantity of Pandanus Clutch Bag"). Omit for a generic
   *  "Decrease quantity" / "Increase quantity" label. */
  itemLabel?: string;
  /** Additional class names on the wrapping border/rounded container. */
  className?: string;
  /** Class names for the two buttons (size/shape only — colour stays fixed). */
  buttonClassName?: string;
  /** Class names for the numeric readout. */
  valueClassName?: string;
}

/**
 * Shared quantity stepper — decrease/increase buttons around a numeric
 * readout, used everywhere a stockist sets an order quantity (product cards,
 * the piece page, and the order/cart list).
 *
 * The readout is an `aria-live="polite"` region: clicking + / - updates the
 * number visually, but nothing else nearby changes, so a screen-reader user
 * pressing the buttons was previously given no confirmation the count had
 * changed. `role="status"` on the same node lets it announce every update
 * without needing focus to move.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  itemLabel,
  className = '',
  buttonClassName = 'tap-target flex items-center justify-center text-warm-gray-800 hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean',
  valueClassName = 'px-2xs text-base font-medium text-warm-gray-800 min-w-[2.5rem] text-center',
}: QuantityStepperProps) {
  const decreaseLabel = itemLabel ? `Decrease quantity of ${itemLabel}` : 'Decrease quantity';
  const increaseLabel = itemLabel ? `Increase quantity of ${itemLabel}` : 'Increase quantity';

  return (
    <div className={`flex items-center border border-sand-dark rounded-md ${className}`.trim()}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${buttonClassName} rounded-l-md disabled:opacity-30`}
        aria-label={decreaseLabel}
      >
        <Minus className="w-4 h-4" aria-hidden="true" />
      </button>
      <span className={valueClassName} role="status" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${buttonClassName} rounded-r-md disabled:opacity-30`}
        aria-label={increaseLabel}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
