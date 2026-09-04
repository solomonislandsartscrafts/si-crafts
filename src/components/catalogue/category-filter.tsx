'use client';

import type { MaterialCategoryOption } from '@/services/categories';

interface CategoryFilterProps {
  /** Selected material value, or null for "All". */
  selected: string | null;
  onChange: (value: string | null) => void;
  options: MaterialCategoryOption[];
}

/**
 * Material filter — All / Pandanus / Wood / Shells / …
 *
 * A vertical list of plain text options for the catalogue filter rail. A
 * single-select filter in a rail IS a list, so there is no pill chrome: the
 * only decoration is the active state (brand-green, semibold). That reads far
 * faster than a stack of outlined pills.
 *
 * This used to take a `direction` prop offering a second `row` presentation —
 * a horizontal swipeable row of pills for a top filter bar. Nothing ever
 * rendered it: the catalogue's one call site passed `direction="stack"` for both
 * its mobile and desktop layouts, so the entire pill branch was unreachable.
 * It has been removed rather than maintained. If a horizontal row is wanted
 * again, it is in git history.
 */
export function CategoryFilter({ selected, onChange, options }: CategoryFilterProps) {
  const items: { value: string | null; label: string }[] = [
    { value: null, label: 'All' },
    ...options.map((o) => ({ value: o.value, label: o.label })),
  ];

  return (
    <div role="group" aria-label="Filter by material" className="flex flex-col">
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={active}
            /* text-base, not text-sm: these are options the visitor reads and
               chooses between, so they sit on the design system's 16px floor.
               text-sm is reserved for captions and true metadata. */
            className={`tap-target flex w-full items-center rounded-md px-2xs text-base capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
              active
                ? 'font-semibold text-brand-green'
                : 'font-medium text-warm-gray-600 hover:text-deep-blue'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
