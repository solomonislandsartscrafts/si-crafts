/**
 * PageBackdrop — decorative, non-interactive background layer for public pages.
 *
 * Motif: an abstract Solomon Islands seascape. Soft washes suggest sun (gold,
 * top right), deep water (ocean blue, bottom left) and land (green, lower
 * right); over them, nested contour lines read as reef edges and ocean
 * currents. The washes live in CSS (.page-backdrop in globals.css) so the
 * edges stay soft; only the line work is drawn here.
 *
 * Rules it obeys:
 *  - Purely decorative: aria-hidden, pointer-events-none, fixed behind content.
 *  - Colours come from theme tokens via currentColor (no raw hex in markup).
 *  - Stroke opacities stay at or below 9% so text contrast is unaffected.
 *  - Hidden in forced-colors and the high-contrast accessibility mode (CSS).
 */

/** Vertical offsets + stroke opacity for each line in a contour group. */
const CONTOURS = [
  { dy: 0, opacity: 0.09 },
  { dy: 22, opacity: 0.07 },
  { dy: 46, opacity: 0.055 },
  { dy: 72, opacity: 0.04 },
  { dy: 100, opacity: 0.028 },
];

export function PageBackdrop() {
  return (
    <div className="page-backdrop" aria-hidden="true">
      <svg
        className="page-backdrop__art"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        {/* Ocean current contours — lower half, sweeping left to right */}
        <g className="text-ocean" fill="none" stroke="currentColor" strokeWidth="1.5">
          {CONTOURS.map(({ dy, opacity }) => (
            <path
              key={`current-${dy}`}
              d="M-120 636 C 190 552 430 726 700 640 S 1150 452 1560 548"
              transform={`translate(0 ${dy})`}
              strokeOpacity={opacity}
            />
          ))}
        </g>

        {/* Reef contours — upper right, shorter arcs */}
        <g className="text-brand-green" fill="none" stroke="currentColor" strokeWidth="1.5">
          {CONTOURS.map(({ dy, opacity }) => (
            <path
              key={`reef-${dy}`}
              d="M1560 210 C 1320 140 1180 268 1000 222 S 760 128 620 196"
              transform={`translate(0 ${-dy})`}
              strokeOpacity={opacity}
            />
          ))}
        </g>

        {/* Single warm line — echoes the gold stripe in the flag */}
        <g className="text-accent-gold-dark" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M-120 400 C 240 320 460 452 760 380 S 1240 236 1560 300"
            strokeOpacity="0.09"
          />
        </g>
      </svg>
    </div>
  );
}
