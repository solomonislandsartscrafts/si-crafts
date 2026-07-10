'use client';

import type { Maker } from '@/types';

interface MakerFilterProps {
  makers: Maker[];
  selected: string | null;
  onChange: (makerId: string | null) => void;
}

export function MakerFilter({ makers, selected, onChange }: MakerFilterProps) {
  return (
    <div>
      <label htmlFor="maker-filter" className="sr-only">
        Filter by maker
      </label>
      <select
        id="maker-filter"
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="tap-target w-full sm:w-auto px-4 py-2 rounded-md border border-sand-dark bg-white text-sm text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
      >
        <option value="">All makers</option>
        {makers.map((maker) => (
          <option key={maker.id} value={maker.id}>
            {maker.name}
          </option>
        ))}
      </select>
    </div>
  );
}
