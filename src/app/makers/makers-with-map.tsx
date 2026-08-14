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
      {/* Maker cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
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

      {/* Map below cards */}
      <div className="mt-12 lg:mt-16 border-t border-sand pt-12">
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
    </>
  );
}

export function MakersMapOnly({ makers }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const filtered = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : [];

  return (
    <div>
      <SolomonIslandsProvinceMap
        selectedProvince={selectedProvince}
        onProvinceSelect={setSelectedProvince}
      />
      {selectedProvince && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-warm-gray-600">
              Makers in <strong className="text-deep-blue">{selectedProvince}</strong>
            </p>
            <button
              onClick={() => setSelectedProvince(null)}
              className="text-sm text-ocean hover:text-ocean-dark font-medium transition-colors"
            >
              Clear filter
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((maker) => (
              <a
                key={maker.id}
                href={`/maker/${maker.slug}`}
                className="block p-3 rounded-md bg-sand-light hover:bg-sand transition-colors"
              >
                <p className="font-heading font-semibold text-deep-blue text-sm">{maker.name}</p>
                <p className="text-xs text-warm-gray-600">{maker.village}</p>
                {maker.craftName && (
                  <p className="text-xs text-warm-gray-400 italic">{maker.craftName}</p>
                )}
              </a>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-warm-gray-400 text-sm">No makers in this province yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
