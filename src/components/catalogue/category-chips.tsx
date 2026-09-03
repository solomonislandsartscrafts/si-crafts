'use client';

import type { MaterialCategoryOption } from '@/services/categories';

interface CategoryChipsProps {
  /** Selected material value, or null for "All". */
  selected: string | null;
  onChange: (value: string | null) => void;
  options: MaterialCategoryOption[];
  /**
   * `row` (default) — a horizontal, swipeable chip row above the grid, used on
   * mobile and the old top-bar layout. `stack` — a vertical list of full-width
   * chips for the desktop sidebar, where each craft type reads as a filter
   * option in a list rather than a pill.
   */
  direction?: 'row' | 'stack';
}

/**
 * Fast single-select material filter — All / Pandanus / Wood / Shell / …
 *
 * Two presentations of the same control:
 * - `row` (mobile): a horizontal, swipeable row of pills above the grid. The
 *   selected pill takes the brand-green fill; the rest are outlined.
 * - `stack` (desktop sidebar): a plain vertical list of text options. A
 *   single-select filter in a rail is just a list, so it drops the pill chrome
 *   entirely — the only decoration is the active state (brand-green, medium
 *   weight). Simpler to scan and far less visual noise than stacked pills.
 */
export function CategoryChips({
  selected,
  onChange,
  options,
  direction = 'row',
}: CategoryChipsProps) {
  const chips: { value: string | null; label: string }[] = [
    { value: null, label: 'All' },
    ...options.map((o) => ({ value: o.value, label: o.label })),
  ];

  const isStack = direction === 'stack';

  return (
    <div className="space-y-2xs">
      {/* Small label anchors the chips and names the filter, so they are not a
          set of unlabelled floating pills. */}
      <span className="block text-xs font-semibold uppercase tracking-wide text-warm-gray-400">
        Material
      </span>
      <div
        role="group"
        aria-label="Filter by material"
        className={
          isStack
            ? 'flex flex-col'
            : '-mx-gutter flex snap-x gap-2xs overflow-x-auto px-gutter pb-3xs sm:mx-0 sm:flex-wrap sm:px-0'
        }
      >
        {chips.map((chip) => {
          const active = selected === chip.value;

          // Sidebar (stack): a plain vertical list of options — no pill chrome.
          // A single-select filter in a rail is just a list, so the only
          // decoration is the active state (brand-green text + medium weight).
          if (isStack) {
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => onChange(chip.value)}
                aria-pressed={active}
                className={`tap-target flex w-full items-center rounded-md px-2xs text-sm capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                  active
                    ? 'font-semibold text-brand-green'
                    : 'font-medium text-warm-gray-600 hover:text-deep-blue'
                }`}
              >
                {chip.label}
              </button>
            );
          }

          // Mobile (row): pills are the right pattern for a swipeable row.
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange(chip.value)}
              aria-pressed={active}
              className={`flex h-11 flex-shrink-0 snap-start items-center justify-center rounded-full border px-md text-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-1 ${
                active
                  ? 'border-brand-green bg-brand-green text-white shadow-sm'
                  : 'border-sand-dark bg-white text-warm-gray-600 hover:border-brand-green/60 hover:bg-brand-green/5 hover:text-deep-blue'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
