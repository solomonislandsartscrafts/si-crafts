'use client';

import { useState } from 'react';

/**
 * TEMPORARY hero-gradient A/B switcher.
 *
 * The homepage hero band has gone through several gradient designs. This lets a
 * reviewer flip between them live so people can say which they prefer before one
 * is made final. It is NOT a permanent feature — once a design is chosen, drop
 * this component, put the winning `backgroundImage` back inline on the hero
 * `<section>` in `page.tsx`, and delete this file.
 *
 * How it works: the switcher renders the chosen gradient as an absolutely
 * positioned layer that fills the hero `<section>` (which is `relative
 * overflow-hidden`). The hero's own corner vignette, wave motif and content sit
 * ABOVE this layer in the DOM, so they are unaffected — only the base gradient
 * changes. Every colour used is a locked flag-palette value; no new colours.
 */

interface GradientOption {
  /** Short label shown on the switch button. */
  label: string;
  /** One-line description of the look, shown next to the active button. */
  note: string;
  /** The CSS `background-image` value for this option. */
  backgroundImage: string;
}

// Solid fallback colour behind every option (matches the hero `<section>`'s
// `bg-brand-green`), so a renderer that drops the gradient still shows green.
const FALLBACK_BG = '#1E7A3D';

const OPTIONS: GradientOption[] = [
  {
    label: '1',
    note: 'Three distinct zones (current)',
    // The CURRENT design: blue / green / gold each own a diagonal third, with a
    // bloom deepening each. Kept exactly as it is in page.tsx.
    backgroundImage:
      'radial-gradient(70% 90% at 8% 12%, rgba(30, 90, 168, 0.40) 0%, rgba(30, 90, 168, 0) 50%), ' +
      'radial-gradient(65% 90% at 50% 60%, rgba(40, 153, 77, 0.55) 0%, rgba(40, 153, 77, 0) 52%), ' +
      'radial-gradient(80% 110% at 96% 92%, rgba(244, 183, 40, 0.62) 0%, rgba(244, 183, 40, 0.16) 38%, rgba(244, 183, 40, 0) 66%), ' +
      'linear-gradient(115deg, #142E40 0%, #1B3A4B 24%, #1E7A3D 50%, #35995A 66%, #E8A81E 100%)',
  },
  {
    label: '2',
    note: 'Airy blended wash',
    // The smoother "dyed-textile" version: one continuous diagonal blend through
    // the full flag palette (deep-blue → ocean → green → gold) with soft blooms,
    // no hard zone boundaries. Reads lighter and more scenic than the zoned one.
    backgroundImage:
      'radial-gradient(90% 90% at 15% 15%, rgba(27, 58, 75, 0.55) 0%, rgba(27, 58, 75, 0) 55%), ' +
      'radial-gradient(80% 80% at 85% 85%, rgba(244, 183, 40, 0.45) 0%, rgba(244, 183, 40, 0) 60%), ' +
      'linear-gradient(125deg, #1B3A4B 0%, #1E5AA8 32%, #1E7A3D 62%, #F4B728 100%)',
  },
  {
    label: '3',
    note: 'Deep blue → green (calm)',
    // A calmer two-colour blend: deep-blue into brand-green, gold kept only as a
    // faint lower-right bloom. Closest to the original solid green band but with
    // gentle depth, for when the full-palette versions read too busy.
    backgroundImage:
      'radial-gradient(80% 100% at 90% 95%, rgba(244, 183, 40, 0.28) 0%, rgba(244, 183, 40, 0) 55%), ' +
      'linear-gradient(120deg, #142E40 0%, #1B3A4B 30%, #1E7A3D 100%)',
  },
  {
    label: '4',
    note: 'Solid green (original flat)',
    // The very first version: a flat brand-green band, no gradient. Included so
    // reviewers can compare the depth versions against the plain baseline.
    backgroundImage: 'linear-gradient(0deg, #1E7A3D 0%, #1E7A3D 100%)',
  },
  {
    label: '5',
    note: 'Vertical ocean → green',
    // A top-to-bottom blend rather than diagonal: deep-blue at the top settling
    // into brand-green at the base, with a faint gold bloom bottom-right. Reads
    // as sky-over-land. The dark top keeps the heading region safe.
    backgroundImage:
      'radial-gradient(70% 80% at 88% 90%, rgba(244, 183, 40, 0.30) 0%, rgba(244, 183, 40, 0) 55%), ' +
      'linear-gradient(180deg, #142E40 0%, #1B3A4B 30%, #1E5AA8 58%, #1E7A3D 100%)',
  },
  {
    label: '6',
    note: 'Gold sunrise (warm)',
    // Warmest option: a dark deep-blue upper-left anchoring the text, blooming
    // out to a broad gold lower-right like a low sun over the field, with a
    // green mid-band between. The text column stays on the dark blue corner.
    backgroundImage:
      'radial-gradient(100% 120% at 100% 100%, rgba(247, 197, 85, 0.70) 0%, rgba(244, 183, 40, 0.20) 40%, rgba(244, 183, 40, 0) 68%), ' +
      'radial-gradient(80% 90% at 20% 15%, rgba(20, 46, 64, 0.65) 0%, rgba(20, 46, 64, 0) 55%), ' +
      'linear-gradient(120deg, #1B3A4B 0%, #1E7A3D 55%, #E8A81E 100%)',
  },
  {
    label: '7',
    note: 'Deep ocean (cool, minimal)',
    // Coolest, quietest option: mostly deep-blue and ocean with only a whisper
    // of green low-right. No gold. For when the brief wants restrained and
    // corporate rather than the full flag palette. Very safe for white text.
    backgroundImage:
      'radial-gradient(75% 90% at 85% 92%, rgba(30, 122, 61, 0.35) 0%, rgba(30, 122, 61, 0) 55%), ' +
      'linear-gradient(125deg, #102532 0%, #1B3A4B 40%, #1E5AA8 100%)',
  },
  {
    label: '8',
    note: 'Full flag sweep (vivid)',
    // Boldest of the palette versions: a wide diagonal sweep hitting all four
    // flag tones at near-full strength, blue → ocean → green → gold, with blooms
    // reinforcing each. Livelier than option 1's contained zones. A dark-blue
    // bloom top-left still protects the heading.
    backgroundImage:
      'radial-gradient(70% 85% at 10% 10%, rgba(16, 37, 50, 0.60) 0%, rgba(16, 37, 50, 0) 50%), ' +
      'radial-gradient(60% 80% at 40% 55%, rgba(40, 153, 77, 0.45) 0%, rgba(40, 153, 77, 0) 55%), ' +
      'radial-gradient(85% 110% at 98% 95%, rgba(247, 197, 85, 0.68) 0%, rgba(244, 183, 40, 0.18) 40%, rgba(244, 183, 40, 0) 66%), ' +
      'linear-gradient(110deg, #1B3A4B 0%, #1E5AA8 30%, #1E7A3D 58%, #F4B728 100%)',
  },
];

export function HeroGradientSwitcher() {
  const [selected, setSelected] = useState(0);
  const active = OPTIONS[selected];

  return (
    <>
      {/* The gradient layer. Fills the hero section, sits at the very back. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: FALLBACK_BG, backgroundImage: active.backgroundImage }}
      />

      {/* The switch control — a small floating bar, top-left of the hero, above
          the content so it is always clickable. Deliberately plain and obvious
          (it is temporary): a labelled row of numbered buttons plus the active
          option's name. `z-30` clears the content column and the header band. */}
      <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-lg bg-deep-blue/85 px-sm py-xs text-center backdrop-blur-sm sm:left-4 sm:translate-x-0 sm:text-left">
        <p className="mb-2xs text-xs font-semibold uppercase tracking-wide text-accent-gold-light">
          Gradient preview — {active.note}
        </p>
        <div className="flex flex-wrap justify-center gap-2xs sm:justify-start">
          {OPTIONS.map((opt, i) => {
            const isActive = i === selected;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={isActive}
                className={`tap-target flex min-w-[44px] items-center justify-center rounded-md px-xs font-heading text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold ${
                  isActive
                    ? 'bg-accent-gold text-deep-blue'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
