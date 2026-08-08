'use client';

import { useState, useEffect } from 'react';
import type { MaterialCategoryOption } from '@/services/categories';

interface MaterialFilterProps {
  selected: string | null;
  onChange: (value: string | null) => void;
}

export function MaterialFilter({ selected, onChange }: MaterialFilterProps) {
  const [options, setOptions] = useState<MaterialCategoryOption[]>([]);

  useEffect(() => {
    async function load() {
      const { getMaterialCategories } = await import('@/services/categories');
      setOptions(await getMaterialCategories());
    }
    load();
  }, []);

  return (
    <div>
      <label htmlFor="material-filter" className="sr-only">
        Filter by craft type
      </label>
      <select
        id="material-filter"
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="tap-target w-full sm:w-auto px-4 py-2 rounded-md border border-sand-dark bg-white text-sm text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
      >
        <option value="">All craft types</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
