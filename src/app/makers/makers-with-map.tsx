'use client';

import { useState } from 'react';
import type { Maker } from '@/types';
import { MakerCard } from '@/components/cards/maker-card';
import { SolomonIslandsProvinceMap } from '@/components/map';

interface MakerWithCraft extends Maker {
  craftName: string;
}

interface Props {
  makers: MakerWithCraft[];
}

export function MakersWithMap({ makers }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const filtered = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : makers;

  return (
    <>
      {/* Map as optional province filter */}
      <div className="mb-12">
        <SolomonIslandsProvinceMap
          selectedProvince={selectedProvince}
          onProvinceSelect={setSelectedProvince}
        />
        {selectedProvince && (
          <button
            onClick={() => setSelectedProvince(null)}
            className="mt-3 text-sm text-ocean hover:text-ocean-dark font-medium transition-colors"
          >
            ← Show all makers
          </button>
        )}
      </div>

      {/* Maker cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((maker) => (
          <MakerCard
            key={maker.id}
            maker={maker}
            craftName={maker.craftName}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-warm-gray-600 text-center py-12">
          No makers in this province yet. Check back soon.
        </p>
      )}
    </>
  );
}
