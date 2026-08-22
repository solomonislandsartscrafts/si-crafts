'use client';

import { useState } from 'react';
import { MapPin, Users } from 'lucide-react';
import type { Maker } from '@/types';
import { SolomonIslandsProvinceMap } from '@/components/map';
import { PageHeader } from '@/components/layout/page-header';
import { MakerCard } from '@/components/cards/maker-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/select';

interface MakerWithCraft extends Maker {
  craftName: string;
}

interface Props {
  makers: MakerWithCraft[];
  /** Admin-editable copy, passed down so this stays a pure client component. */
  title: string;
  intro: string;
  filterHeading: string;
  filterHint: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function MakersPageContent({
  makers,
  title,
  intro,
  filterHeading,
  filterHint,
  emptyTitle,
  emptyDescription,
}: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const provinces = [...new Set(makers.map((m) => m.province))].sort();

  const filteredMakers = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : makers;

  return (
    <div>
      <PageHeader title={title} intro={intro}>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-warm-gray-600">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" aria-hidden="true" />
            {makers.length} makers
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {provinces.length} provinces
          </span>
        </div>
      </PageHeader>

      <div className="site-container pb-10 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
          {/* Left: maker grid */}
          <div>
            {/* Filter bar. The province select stays mounted whether or not a
                province is selected — previously selecting one replaced the
                dropdown with a clear button, so you could not switch province
                without clearing first. */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div className="lg:hidden">
                <Select
                  id="province-filter"
                  value={selectedProvince}
                  onChange={setSelectedProvince}
                  options={provinces.map((p) => ({ value: p, label: p }))}
                  placeholder="All provinces"
                  label="Filter by province"
                />
              </div>

              <p
                className="text-base font-medium text-warm-gray-800 ml-auto"
                aria-live="polite"
              >
                {selectedProvince ? (
                  <>
                    <span className="text-ocean font-semibold">
                      {filteredMakers.length}
                    </span>{' '}
                    maker{filteredMakers.length !== 1 ? 's' : ''} in{' '}
                    {selectedProvince}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{filteredMakers.length}</span>{' '}
                    makers
                  </>
                )}
              </p>
            </div>

            {filteredMakers.length === 0 ? (
              <EmptyState
                icon={Users}
                title={emptyTitle}
                description={emptyDescription}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedProvince(null)}
                  >
                    Show all makers
                  </Button>
                }
              />
            ) : (
              /* Shared MakerCard, so a maker looks the same here as on the
                 homepage and craft pages. */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMakers.map((maker) => (
                  <MakerCard
                    key={maker.id}
                    maker={maker}
                    craftName={maker.craftName || undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: province map — desktop filter */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <div className="pb-3">
              <h2 className="font-heading text-lg font-semibold text-deep-blue">
                {filterHeading}
              </h2>
              <p className="text-sm text-warm-gray-600 mt-0.5">{filterHint}</p>
            </div>
            <SolomonIslandsProvinceMap
              selectedProvince={selectedProvince}
              onProvinceSelect={setSelectedProvince}
            />
            {selectedProvince && (
              <div className="pt-4 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedProvince(null)}
                >
                  Show all provinces
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
