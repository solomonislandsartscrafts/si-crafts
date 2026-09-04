'use client';

import { useState, useEffect, useRef } from 'react';

interface ProvinceMapProps {
  selectedProvince: string | null;
  onProvinceSelect: (province: string | null) => void;
  /**
   * Provinces that actually have makers. Only these are interactive and
   * labelled — filtering to a province with no makers is a dead end, and
   * labelling all nine crowds the small map. Omit to make every province
   * interactive (the previous behaviour).
   */
  availableProvinces?: string[];
}

/**
 * Map colours, pulled from the locked palette rather than raw hex so the map
 * stays on-brand. `deep-blue` is the resting land fill (the heading/footer
 * colour), `ocean` the interactive highlight, and a muted grey for provinces
 * with no makers so they read as present-but-inactive.
 */
const FILL_BASE = '#1B3A4B'; // deep-blue
const FILL_ACTIVE = '#1E5AA8'; // ocean
const FILL_INACTIVE = '#D4D4D4'; // sand-dark — province with no makers

const ID_TO_PROVINCE: Record<string, string> = {
  SBCH: 'Choiseul Province',
  SBWE: 'Western Province',
  SBIS: 'Isabel Province',
  SBCE: 'Central Province',
  SBGU: 'Guadalcanal Province',
  SBCT: 'Guadalcanal Province',
  SBML: 'Malaita Province',
  SBMK: 'Makira-Ulawa Province',
  SBRB: 'Rennell and Bellona Province',
  SBTE: 'Temotu Province',
};

const PROVINCE_LABELS: Record<string, string> = {
  'Choiseul Province': 'CHOISEUL',
  'Western Province': 'WESTERN',
  'Isabel Province': 'ISABEL',
  'Central Province': 'CENTRAL',
  'Guadalcanal Province': 'GUADALCANAL',
  'Malaita Province': 'MALAITA',
  'Makira-Ulawa Province': 'MAKIRA',
  'Rennell and Bellona Province': 'BELLONA & RENNELL',
  'Temotu Province': 'TEMOTU',
};

/**
 * Label positions as % of the SVG viewBox.
 * Positioned beside (not on top of) each province's land mass
 * so the map shapes remain clearly visible.
 */
const LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
  'Choiseul Province': { x: 22, y: 10 },
  'Western Province': { x: 10, y: 42 },
  'Isabel Province': { x: 32, y: 20 },
  'Central Province': { x: 38, y: 48 },
  'Guadalcanal Province': { x: 30, y: 62 },
  'Malaita Province': { x: 55, y: 32 },
  'Makira-Ulawa Province': { x: 58, y: 56 },
  'Rennell and Bellona Province': { x: 28, y: 88 },
  'Temotu Province': { x: 82, y: 63 },
};

const PROVINCE_TO_IDS: Record<string, string[]> = {
  'Choiseul Province': ['SBCH'],
  'Western Province': ['SBWE'],
  'Isabel Province': ['SBIS'],
  'Central Province': ['SBCE'],
  'Guadalcanal Province': ['SBGU', 'SBCT'],
  'Malaita Province': ['SBML'],
  'Makira-Ulawa Province': ['SBMK'],
  'Rennell and Bellona Province': ['SBRB'],
  'Temotu Province': ['SBTE'],
};

export function SolomonIslandsProvinceMap({
  selectedProvince,
  onProvinceSelect,
  availableProvinces,
}: ProvinceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

  const activeProvince = hoveredProvince || selectedProvince;

  // A province is interactive only if it has makers. When no list is passed,
  // every province is available (the previous behaviour).
  const availableSet = availableProvinces ? new Set(availableProvinces) : null;
  function isAvailable(province: string) {
    return availableSet === null || availableSet.has(province);
  }

  // Resting fill for a province: muted grey if it has no makers, else the
  // deep-blue land colour.
  function restFill(province: string) {
    return isAvailable(province) ? FILL_BASE : FILL_INACTIVE;
  }

  // Highlight/unhighlight SVG paths for a given province
  function highlightProvinceByName(province: string, active: boolean) {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;
    const ids = PROVINCE_TO_IDS[province] || [];
    ids.forEach((pathId) => {
      const el = svg.querySelector(`#${pathId}`) as SVGPathElement | null;
      if (el) {
        el.style.fill = active ? FILL_ACTIVE : restFill(province);
      }
    });
  }

  function handleLabelEnter(province: string) {
    if (!isAvailable(province)) return;
    setHoveredProvince(province);
    highlightProvinceByName(province, true);
  }

  function handleLabelLeave(province: string) {
    setHoveredProvince(null);
    highlightProvinceByName(province, false);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    fetch('/images/Solomon islands map.svg')
      .then((res) => res.text())
      .then((svgText) => {
        container.innerHTML = svgText;
        const svg = container.querySelector('svg');
        if (!svg) return;

        // Style the SVG
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';

        // Wire up province paths. Only provinces that have makers are made
        // interactive; the rest are painted in the muted inactive fill and left
        // inert, so the map never filters to an empty result.
        const paths = svg.querySelectorAll('#features path');
        paths.forEach((path) => {
          const id = path.getAttribute('id') || '';
          const province = ID_TO_PROVINCE[id];
          if (!province) return;

          const el = path as SVGPathElement;
          el.style.transition = 'fill 0.2s, opacity 0.2s';

          if (!isAvailable(province)) {
            el.style.fill = FILL_INACTIVE;
            el.style.cursor = 'default';
            el.setAttribute('aria-hidden', 'true');
            return;
          }

          // Pointer-only: hover/click convenience for a mouse user tracing the
          // map shapes. Deliberately NOT wired for keyboard/AT (no role,
          // tabindex, or keydown handler) — every available province already
          // has a real, fully accessible control below in the label-pill
          // overlay (a proper `<button>` with a Tailwind focus-visible ring
          // and `aria-pressed`). Making the raw SVG `<path>` a second focusable
          // control for the same action doubled the tab stops for the same
          // nine choices, and — because the path is injected via `innerHTML`
          // and styled by directly setting `el.style.fill`, not through
          // Tailwind classes — it had no way to render a focus indicator
          // distinct from its own hover state, so a keyboard user landing on
          // it could not tell it was focused at all. Raw SVG paths are also an
          // inconsistently-supported focus target across browsers/AT, which
          // WAI-ARIA's SVG accessibility guidance flags as fragile. The pill
          // is the one accessible entry point per province; the path is
          // presentation.
          el.style.cursor = 'pointer';
          el.style.fill = FILL_BASE;
          el.setAttribute('aria-hidden', 'true');

          el.addEventListener('mouseenter', () => {
            setHoveredProvince(province);
            highlightProvinceByName(province, true);
          });
          el.addEventListener('mouseleave', () => {
            setHoveredProvince(null);
            highlightProvinceByName(province, false);
          });
          el.addEventListener('click', () => {
            onProvinceSelect(province === selectedProvince ? null : province);
          });
        });

        // Hide existing label points
        const pts = svg.querySelector('#points');
        if (pts) pts.setAttribute('display', 'none');
        const lpts = svg.querySelector('#label_points');
        if (lpts) lpts.setAttribute('display', 'none');
        const labels = svg.querySelector('#labels');
        if (labels) labels.setAttribute('display', 'none');

        // Set background — match page background so map blends seamlessly
        svg.style.backgroundColor = 'transparent';
        svg.setAttribute('fill', FILL_BASE);
        svg.setAttribute('stroke', '#ffffff');

        setSvgLoaded(true);
      });
    // availableProvinces joined to a stable string: the array is a new
    // reference each render, so depending on it directly would re-wire the SVG
    // on every render. The joined value only changes when the set truly does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onProvinceSelect, selectedProvince, (availableProvinces || []).join('|')]);

  return (
    <div className="w-full">
      {/* Map wrapper — relative container for SVG + label overlay. Labels are
          positioned as a % of this same box, so the SVG and the overlay must
          share one transform (none here) to stay aligned. */}
      <div className="relative w-full min-h-[300px]">
        {/* SVG map container */}
        <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />

        {/* Province labels overlaid on the map. Only provinces with makers are
            labelled — labelling all nine crowded the small map and the text ran
            together. Each label is a small white pill so it stays legible over
            the land and never merges with a neighbouring label. */}
        {svgLoaded && (
          <div className="absolute inset-0">
            {Object.entries(LABEL_POSITIONS).map(([province, pos]) => {
              if (!isAvailable(province)) return null;
              const isActive = activeProvince === province;
              const isSelected = selectedProvince === province;
              const label = PROVINCE_LABELS[province] || province;
              return (
                <button
                  key={province}
                  type="button"
                  onClick={() => onProvinceSelect(province === selectedProvince ? null : province)}
                  onMouseEnter={() => handleLabelEnter(province)}
                  onMouseLeave={() => handleLabelLeave(province)}
                  className={`absolute inline-flex items-center rounded-full border px-2xs py-3xs text-[11px] font-semibold uppercase tracking-wide shadow-card transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
                    isActive || isSelected
                      ? 'border-ocean bg-ocean text-white'
                      : 'border-sand bg-white text-deep-blue hover:border-ocean hover:text-ocean'
                  }`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  aria-label={`Filter makers by ${province}`}
                  aria-pressed={isSelected}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Instruction text below map */}
      <p className="mt-sm text-center text-sm text-warm-gray-400">
        {svgLoaded
          ? selectedProvince
            ? `Showing makers from ${PROVINCE_LABELS[selectedProvince] || selectedProvince}`
            : 'Select a highlighted province to filter makers'
          : 'Loading map...'}
      </p>
    </div>
  );
}


