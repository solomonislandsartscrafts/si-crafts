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
  'Rennell and Bellona Province': 'RENNELL & BELLONA',
  'Temotu Province': 'TEMOTU',
};

export function SolomonIslandsProvinceMap({
  selectedProvince,
  onProvinceSelect,
}: ProvinceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

  const activeProvince = hoveredProvince || selectedProvince;
  const activeLabel = activeProvince
    ? PROVINCE_LABELS[activeProvince] || activeProvince
    : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fetch and inline the SVG
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

          // Style
          const el = path as SVGPathElement;
          el.style.cursor = 'pointer';
          el.style.transition = 'fill 0.2s, opacity 0.2s';
          el.style.fill = '#3d3d3d';

          // Events
          el.addEventListener('mouseenter', () => {
            setHoveredProvince(province);
            highlightProvince(svg, id, true);
          });
          el.addEventListener('mouseleave', () => {
            setHoveredProvince(null);
            highlightProvince(svg, id, false);
          });
          el.addEventListener('click', () => {
            onProvinceSelect(
              province === selectedProvince ? null : province
            );
          });
          el.addEventListener('focus', () => {
            setHoveredProvince(province);
            highlightProvince(svg, id, true);
          });
          el.addEventListener('blur', () => {
            setHoveredProvince(null);
            highlightProvince(svg, id, false);
          });

          // Accessibility
          el.setAttribute('role', 'button');
          el.setAttribute('tabindex', '0');
          el.setAttribute('aria-label', `Show makers in ${province}`);
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onProvinceSelect(
                province === selectedProvince ? null : province
              );
            }
          });
        });

        // Hide label points and circles we don't need
        const pts = svg.querySelector('#points');
        if (pts) pts.setAttribute('display', 'none');
        const lpts = svg.querySelector('#label_points');
        if (lpts) lpts.setAttribute('display', 'none');

        // Set background
        svg.style.backgroundColor = '#f7fbfc';
        svg.setAttribute('fill', '#3d3d3d');
        svg.setAttribute('stroke', '#ffffff');

        setSvgLoaded(true);
      });
  }, [onProvinceSelect, selectedProvince]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />

      {activeLabel ? (
        <div className="mt-4 text-center">
          <span className="text-lg md:text-xl font-bold text-deep-blue uppercase tracking-wide">
            {activeLabel}
          </span>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-warm-gray-400">
          {svgLoaded
            ? 'Hover over or tap an island to see its name'
            : 'Loading map...'}
        </p>
      )}
    </div>
  );
}

function highlightProvince(
  svg: SVGSVGElement,
  id: string,
  active: boolean
) {
  // Also highlight SBCT when SBGU is hovered (both are Guadalcanal)
  const ids = id === 'SBGU' ? ['SBGU', 'SBCT'] : id === 'SBCT' ? ['SBGU', 'SBCT'] : [id];
  ids.forEach((pathId) => {
    const el = svg.querySelector(`#${pathId}`) as SVGPathElement | null;
    if (el) {
      el.style.fill = active ? '#9CA3AF' : '#3d3d3d';
    }
  });
}
