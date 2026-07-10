'use client';

import { useState, useEffect } from 'react';
import type { Maker } from '@/types';
import { SolomonIslandsProvinceMap } from '@/components/map/province-map';

interface MakerWithCraft extends Maker {
  craftName?: string;
}

const PROVINCES = [
  'Choiseul Province',
  'Western Province',
  'Isabel Province',
  'Central Province',
  'Guadalcanal Province',
  'Malaita Province',
  'Makira-Ulawa Province',
  'Rennell and Bellona Province',
  'Temotu Province',
];

export default function FindAMakerPage() {
  const [makers, setMakers] = useState<MakerWithCraft[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { getPublicMakers } = await import('@/services/makers');
      const { getAllCrafts } = await import('@/services/crafts');
      const [m, c] = await Promise.all([getPublicMakers(), getAllCrafts()]);
      const enriched = m.map((maker) => ({
        ...maker,
        craftName: c.find((craft) => craft.id === maker.craftId)?.name,
      }));
      setMakers(enriched);
      setLoading(false);
    }
    load();
  }, []);

  const filteredMakers = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : makers;

  const displayProvince = selectedProvince
    ? selectedProvince.replace(' Province', '').toUpperCase()
    : 'ALL PROVINCES';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-12 uppercase tracking-wide">
        Find a Maker
      </h1>

      {loading ? (
        <p className="text-warm-gray-400">Loading...</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left column: Map */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <SolomonIslandsProvinceMap
              selectedProvince={selectedProvince}
              onProvinceSelect={setSelectedProvince}
            />
            {selectedProvince && (
              <button
                onClick={() => setSelectedProvince(null)}
                className="mt-4 text-sm text-ocean hover:text-ocean-dark font-medium transition-colors"
              >
                ← Show all provinces
              </button>
            )}
          </div>

          {/* Right column: Maker list */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-deep-blue uppercase tracking-wide mb-8 border-b-2 border-deep-blue pb-3">
              {displayProvince}
            </h2>

            {filteredMakers.length === 0 ? (
              <p className="text-warm-gray-600">
                No makers listed yet for this province — check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                {filteredMakers.map((maker) => (
                  <MakerEntry key={maker.id} maker={maker} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MakerEntry({ maker }: { maker: MakerWithCraft }) {
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    // Client-side reveal of contact (obfuscation for no-JS)
    setShowEmail(true);
  }, []);

  return (
    <div className="space-y-1">
      <a
        href={`/maker/${maker.slug}`}
        className="block font-bold text-deep-blue uppercase tracking-wide hover:text-ocean transition-colors"
      >
        {maker.name}
      </a>
      <p className="text-sm text-warm-gray-600">
        {maker.village}
      </p>
      {maker.craftName && (
        <p className="text-xs text-warm-gray-400">{maker.craftName}</p>
      )}
      {showEmail ? (
        <a
          href={`mailto:${maker.slug}@siac.org.au`}
          className="text-sm text-ocean italic hover:underline"
        >
          Contact maker
        </a>
      ) : (
        <span className="text-sm text-warm-gray-400 italic">
          Contact concealed — enable JavaScript to view
        </span>
      )}
    </div>
  );
}
