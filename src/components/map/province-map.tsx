'use client';

import { useState, useEffect, useRef } from 'react';

interface ProvinceMapProps {
  selectedProvince: string | null;
  onProvinceSelect: (province: string | null) => void;
}

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
}: ProvinceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

  const activeProvince = hoveredProvince || selectedProvince;

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
        el.style.fill = active ? '#2E7D8C' : '#3d3d3d';
      }
    });
  }

  function handleLabelEnter(province: string) {
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

        // Make all province paths interactive
        const paths = svg.querySelectorAll('#features path');
        paths.forEach((path) => {
          const id = path.getAttribute('id') || '';
          const province = ID_TO_PROVINCE[id];
          if (!province) return;

          const el = path as SVGPathElement;
          el.style.cursor = 'pointer';
          el.style.transition = 'fill 0.2s, opacity 0.2s';
          el.style.fill = '#3d3d3d';

          el.addEventListener('mouseenter', () => {
            setHoveredProvince(province);
            highlightProvince(svg, id, true);
          });
          el.addEventListener('mouseleave', () => {
            setHoveredProvince(null);
            highlightProvince(svg, id, false);
          });
          el.addEventListener('click', () => {
            onProvinceSelect(province === selectedProvince ? null : province);
          });
          el.addEventListener('focus', () => {
            setHoveredProvince(province);
            highlightProvince(svg, id, true);
          });
          el.addEventListener('blur', () => {
            setHoveredProvince(null);
            highlightProvince(svg, id, false);
          });

          el.setAttribute('role', 'button');
          el.setAttribute('tabindex', '0');
          el.setAttribute('aria-label', `Show makers in ${province}`);
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onProvinceSelect(province === selectedProvince ? null : province);
            }
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
        svg.setAttribute('fill', '#3d3d3d');
        svg.setAttribute('stroke', '#ffffff');

        setSvgLoaded(true);
      });
  }, [onProvinceSelect, selectedProvince]);

  return (
    <div className="w-full">
      {/* Map wrapper — relative container for SVG + label overlay.
          The scale-up sits HERE, not on the SVG alone: the labels are
          positioned as a % of the same box, so scaling only the SVG slid every
          province out from under its own label. */}
      <div className="relative w-full min-h-[280px] transform scale-110 origin-center">
        {/* SVG map container */}
        <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />

        {/* Province text labels overlaid on the map */}
        {svgLoaded && (
          <div className="absolute inset-0">
            {Object.entries(LABEL_POSITIONS).map(([province, pos]) => {
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
                  className={`absolute text-[9px] sm:text-[11px] md:text-sm font-bold uppercase tracking-wide transition-colors cursor-pointer tap-target flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ocean rounded ${
                    isActive
                      ? 'text-ocean'
                      : isSelected
                        ? 'text-ocean-dark'
                        : 'text-warm-gray-600 hover:text-ocean'
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
      <p className="mt-4 text-center text-sm text-warm-gray-400">
        {svgLoaded
          ? selectedProvince
            ? `Showing makers from ${PROVINCE_LABELS[selectedProvince] || selectedProvince}`
            : 'Click a province or its label to filter makers'
          : 'Loading map...'}
      </p>
    </div>
  );
}

function highlightProvince(svg: SVGSVGElement, id: string, active: boolean) {
  const ids = id === 'SBGU' ? ['SBGU', 'SBCT'] : id === 'SBCT' ? ['SBGU', 'SBCT'] : [id];
  ids.forEach((pathId) => {
    const el = svg.querySelector(`#${pathId}`) as SVGPathElement | null;
    if (el) {
      el.style.fill = active ? '#2E7D8C' : '#3d3d3d';
    }
  });
}
