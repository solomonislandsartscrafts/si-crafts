'use client';

import { useState, type ReactNode } from 'react';
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

/**
 * Renders an admin-editable template, substituting {token} placeholders with
 * emphasised (bold) values. Anything between the tokens is plain text, so an
 * editor can reword the sentence freely and the counts stay highlighted.
 */
function renderTemplate(
  template: string,
  values: Record<string, string>
): ReactNode[] {
  const parts = template.split(/(\{[a-zA-Z]+\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{([a-zA-Z]+)\}$/);
    if (match && values[match[1]] !== undefined) {
      return (
        <span key={i} className="font-semibold text-warm-gray-800">
          {values[match[1]]}
        </span>
      );
    }
    return part;
  });
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
  statMakersLabel: string;
  statProvincesLabel: string;
  /** Template with {count} and {province} placeholders. */
  resultsFiltered: string;
  /** Template with a {count} placeholder. */
  resultsAll: string;
  clearFilterLabel: string;
  emptyActionLabel: string;
  clearProvincesLabel: string;
}

export function MakersPageContent({
  makers,
  title,
  intro,
  filterHeading,
  filterHint,
  emptyTitle,
  emptyDescription,
  statMakersLabel,
  statProvincesLabel,
  resultsFiltered,
  resultsAll,
  clearFilterLabel,
  emptyActionLabel,
  clearProvincesLabel,
}: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const provinces = [...new Set(makers.map((m) => m.province))].sort();

  const filteredMakers = selectedProvince
    ? makers.filter((m) => m.province === selectedProvince)
    : makers;

  return (
    <div>
      <PageHeader banner="blue" eyebrow="The people behind the work" title={title} intro={intro} motif="waves">
        <div className="mt-sm flex flex-wrap gap-sm text-sm">
          <span className="flex items-center gap-2xs">
            <Users className="w-4 h-4" aria-hidden="true" />
            {makers.length} {statMakersLabel}
          </span>
          <span className="flex items-center gap-2xs">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {provinces.length} {statProvincesLabel}
          </span>
        </div>
      </PageHeader>

      <div className="site-container pb-section">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-block items-start">
          {/* Left: maker grid */}
          <div>
            {/* Filter bar. The province select stays mounted whether or not a
                province is selected — previously selecting one replaced the
                dropdown with a clear button, so you could not switch province
                without clearing first. On mobile the select leads the row; on
                desktop it is hidden (the map is the filter) and the row holds
                the result count + an inline clear, left-aligned so it reads as
                the heading for the grid below rather than a stat floating over
                the map panel to the right. */}
            <div className="flex flex-wrap items-end gap-sm mb-stack">
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
                className="text-base text-warm-gray-600 lg:mr-auto"
                aria-live="polite"
              >
                {selectedProvince
                  ? renderTemplate(resultsFiltered, {
                      count: String(filteredMakers.length),
                      province: selectedProvince,
                    })
                  : renderTemplate(resultsAll, {
                      count: String(filteredMakers.length),
                    })}
              </p>

              {selectedProvince && (
                <button
                  type="button"
                  onClick={() => setSelectedProvince(null)}
                  className="text-sm font-medium text-ocean hover:text-ocean-dark tap-target underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
                >
                  {clearFilterLabel}
                </button>
              )}
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
                    {emptyActionLabel}
                  </Button>
                }
              />
            ) : (
              /* Shared MakerCard, so a maker looks the same here as on the
                 homepage and craft pages. */
              <div role="list" aria-label="Makers" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-grid">
                {filteredMakers.map((maker) => (
                  <MakerCard
                    key={maker.id}
                    maker={maker}
                    craftName={maker.craftName || undefined}
                    layout="row"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: province map — desktop filter. Framed in a sand-light
              panel with a border so it reads as a deliberate filter tool rather
              than a map floating on the page. The heading is capped with a
              hairline divider so the title + hint read as the panel's header,
              and the map below it as the control. */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-sand bg-sand-light p-md">
              <div className="pb-sm mb-sm border-b border-sand">
                <h2 className="font-heading text-lg font-semibold text-deep-blue">
                  {filterHeading}
                </h2>
                <p className="text-sm text-warm-gray-600 mt-3xs">{filterHint}</p>
              </div>
              <SolomonIslandsProvinceMap
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
                availableProvinces={provinces}
              />
              {selectedProvince && (
                <div className="pt-sm mt-sm border-t border-sand flex justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedProvince(null)}
                  >
                    {clearProvincesLabel}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
