'use client';

import { Search, X } from 'lucide-react';

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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" aria-hidden="true" />
      <input
        id="product-search"
        type="search"
        placeholder="Search products..."
        maxLength={200}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tap-target w-full pl-10 pr-10 py-2 rounded-md border border-sand-dark bg-white text-sm text-warm-gray-800 placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warm-gray-400 hover:text-warm-gray-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
