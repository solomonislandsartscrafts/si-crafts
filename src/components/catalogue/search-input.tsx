'use client';

import { Search, X } from 'lucide-react';
import { inputClasses } from '@/components/ui/form-field';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fill the container width instead of the default fixed 256px (sm+). Used in
   *  the catalogue sidebar, where the rail is narrower than 256px. */
  fullWidth?: boolean;
}

export function SearchInput({ value, onChange, fullWidth = false }: SearchInputProps) {
  return (
    <div className={`relative w-full ${fullWidth ? '' : 'sm:w-64'}`}>
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400 pointer-events-none z-10"
        aria-hidden="true"
      />
      <input
        id="product-search"
        type="search"
        placeholder="Search products..."
        maxLength={200}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        /* h-11 + py-0 overrides the shared inputClasses py-xs so the search
           box matches the 44px height of the chips and selects in the filter
           bar; the rest of the input treatment (border, focus ring) stays. */
        className={`${inputClasses} h-11 py-0 pl-lg pr-xl`}
      />
      {value && (
        /* tap-target: this was a p-3xs hit area, well under 44px. */
        <button
          onClick={() => onChange('')}
          className="tap-target absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md text-warm-gray-400 hover:text-warm-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
