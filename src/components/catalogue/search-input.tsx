'use client';

import { Search, X } from 'lucide-react';
import { inputClasses } from '@/components/ui/form-field';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
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
        className={`${inputClasses} pl-10 pr-12`}
      />
      {value && (
        /* tap-target: this was a p-1 hit area, well under 44px. */
        <button
          onClick={() => onChange('')}
          className="tap-target absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md text-warm-gray-400 hover:text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
