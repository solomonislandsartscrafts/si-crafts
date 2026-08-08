'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Package, Users } from 'lucide-react';
import type { Maker } from '@/types';
import { SolomonIslandsProvinceMap } from '@/components/map';
import { SafeImage } from '@/components/ui/safe-image';

interface MakerWithCraft extends Maker {
  craftName: string;
}

interface Props {
  makers: MakerWithCraft[];
}

export function MakersPageContent({ makers }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const provinces = [...new Set(makers.map((m) => m.province))].sort();

  const filteredMakers = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : makers;

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-ocean mb-2">
          Solomon Islands Arts &amp; Crafts
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-medium text-deep-blue leading-tight mb-2">
          Meet the Makers
        </h1>
        <p className="text-base text-warm-gray-600 max-w-xl leading-relaxed">
          Every piece carries a story. These are the weavers, carvers, and jewellers behind the work — their villages, their craft, and their hands.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-warm-gray-400">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {makers.length} makers
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {provinces.length} provinces
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* Left: Maker list */}
          <div>
            {/* Filter bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-warm-gray-800" aria-live="polite">
                {selectedProvince
                  ? <><span className="text-ocean">{filteredMakers.length}</span> maker{filteredMakers.length !== 1 ? 's' : ''} in {selectedProvince}</>
                  : <><span className="text-warm-gray-800 font-semibold">{filteredMakers.length}</span> makers</>
                }
              </p>
              {selectedProvince ? (
                <button
                  onClick={() => setSelectedProvince(null)}
                  className="text-xs text-ocean hover:text-ocean-dark font-medium transition-colors"
                >
                  Clear filter ×
                </button>
              ) : (
                /* Mobile province select — only below lg */
                <div className="lg:hidden">
                  <select
                    aria-label="Filter by province"
                    value={selectedProvince || ''}
                    onChange={(e) => setSelectedProvince(e.target.value || null)}
                    className="text-xs px-3 py-1.5 rounded border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean"
                  >
                    <option value="">All provinces</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {filteredMakers.map((maker) => (
                <Link
                  key={maker.id}
                  href={`/maker/${maker.slug}`}
                  className="group flex items-center gap-4 rounded-lg border border-gray-100 bg-white px-3 py-3 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-ocean"
                >
                  {/* Square image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative rounded-md overflow-hidden">
                    <SafeImage
                      src={maker.portraitUrl}
                      alt={maker.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-deep-blue group-hover:text-ocean transition-colors leading-snug">
                      {maker.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {maker.village}, {maker.island}
                      </span>
                      {maker.craftName && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-ocean font-medium">{maker.craftName}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {maker.age && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          Age {maker.age}
                        </span>
                      )}
                      {maker.yearsActive && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {maker.yearsActive} yrs crafting
                        </span>
                      )}
                      {maker.pieceCount && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <Package className="w-3 h-3" />
                          {maker.pieceCount} {maker.pieceCount === 1 ? 'product' : 'products'}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-ocean transition-colors flex-shrink-0" />
                </Link>
              ))}

              {filteredMakers.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm text-gray-500 mb-2">No makers in this province yet.</p>
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

          {/* Right: Map */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden">
              <div className="pb-2">
                <p className="text-sm font-semibold text-deep-blue">Filter by province</p>
                <p className="text-xs text-gray-500 mt-0.5">Click a province on the map to filter the list.</p>
              </div>
              <SolomonIslandsProvinceMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
              />
              {selectedProvince && (
                <div className="pt-3">
                  <button
                    onClick={() => setSelectedProvince(null)}
                    className="w-full text-xs text-center text-ocean hover:text-ocean-dark font-medium transition-colors py-1"
                  >
                    Show all provinces
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
