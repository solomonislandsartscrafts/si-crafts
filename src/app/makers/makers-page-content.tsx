'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import type { Maker } from '@/types';
import { SolomonIslandsProvinceMap } from '@/components/map';

interface MakerWithCraft extends Maker {
  craftName: string;
}

interface Props {
  makers: MakerWithCraft[];
}

export function MakersPageContent({ makers }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Get unique provinces for the mobile dropdown
  const provinces = [...new Set(makers.map((m) => m.province))].sort();

  const filteredMakers = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : makers;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Page header */}
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-3">
        Makers
      </h1>
      <p className="text-lg text-warm-gray-600 max-w-2xl leading-relaxed mb-8">
        The people behind every piece — their stories, villages, and craft.
        Click on any name to read their full story.
      </p>

      {/* Mobile: Province filter dropdown (shown only on mobile/tablet) */}
      <div className="lg:hidden mb-8">
        <label htmlFor="province-filter" className="block text-sm font-medium text-warm-gray-800 mb-2">
          Filter by province
        </label>
        <select
          id="province-filter"
          value={selectedProvince || ''}
          onChange={(e) => setSelectedProvince(e.target.value || null)}
          className="w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          <option value="">All provinces ({makers.length} makers)</option>
          {provinces.map((province) => {
            const count = makers.filter((m) => m.province === province).length;
            return (
              <option key={province} value={province}>
                {province} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Main content: Maker list + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Left: Maker directory */}
        <div className="lg:col-span-2">
          {/* Count + filter status */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-warm-gray-600" aria-live="polite">
              {filteredMakers.length} {filteredMakers.length === 1 ? 'maker' : 'makers'}
              {selectedProvince && ` in ${selectedProvince}`}
            </p>
            {selectedProvince && (
              <button
                onClick={() => setSelectedProvince(null)}
                className="text-sm text-ocean hover:text-ocean-dark font-medium transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Maker entries */}
          <div className="divide-y divide-sand">
            {filteredMakers.map((maker) => (
              <Link
                key={maker.id}
                href={`/maker/${maker.slug}`}
                className="group flex items-center justify-between py-4 transition-colors hover:bg-sand-light/50 -mx-3 px-3 rounded-md"
              >
                <div>
                  <p className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors text-sm uppercase tracking-wide">
                    {maker.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-warm-gray-400" />
                    <p className="text-sm text-warm-gray-600">
                      {maker.village}, {maker.province}
                    </p>
                  </div>
                  {maker.craftName && (
                    <p className="text-xs text-ocean/70 mt-0.5">{maker.craftName}</p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-warm-gray-400 group-hover:text-ocean transition-colors flex-shrink-0" />
              </Link>
            ))}
            {filteredMakers.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-warm-gray-600 mb-2">No makers in this province yet.</p>
                <button
                  onClick={() => setSelectedProvince(null)}
                  className="text-sm text-ocean hover:text-ocean-dark font-medium transition-colors"
                >
                  Show all makers
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Map — desktop only */}
        <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm text-warm-gray-600 mb-3">
            Click a province to filter makers by location.
          </p>
          <div className="rounded-lg overflow-hidden bg-page-bg">
            <SolomonIslandsProvinceMap
              selectedProvince={selectedProvince}
              onProvinceSelect={setSelectedProvince}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
