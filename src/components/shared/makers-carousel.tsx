'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import type { Maker } from '@/types';
import { MakerCard } from '@/components/cards/maker-card';

interface MakersCarouselProps {
  makers: Maker[];
  /** Craft-name lookup keyed by craftId, passed through to each MakerCard. */
  craftNameMap: Record<string, string>;
}

/**
 * Horizontal, swipeable row of maker cards for the homepage "Meet the makers"
 * section.
 *
 * The makers used to stack into a fixed grid, which showed the same handful of
 * faces every time and gave the section no sense of "there are more people
 * here". This is a single scrolling track instead:
 *
 * - On a phone it is a native scroll-snap row — the user swipes left/right with
 *   a thumb, which is the gesture they already expect. A "Swipe to explore"
 *   hint sits under the track on small screens so the affordance is obvious; it
 *   hides itself the moment the user scrolls.
 * - On desktop the same track is driven by prev/next arrow buttons that page by
 *   one card. Arrows only appear once there is somewhere to scroll (disabled at
 *   each end), so a short list of makers never shows dead controls.
 *
 * Native scroll rather than a JS-transformed carousel on purpose (KISS): the
 * browser handles momentum, snapping and keyboard/trackpad scrolling for free,
 * and it degrades gracefully with JS off — the row is still swipeable.
 */
export function MakersCarousel({ makers, craftNameMap }: MakersCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Recompute which arrows are usable from the track's current scroll offset.
  // Runs on mount, on scroll, and on resize because the visible-card count (and
  // therefore whether there is overflow at all) changes with the viewport.
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  // Scroll by roughly one card. `behavior: 'smooth'` is honoured by the
  // browser's own reduced-motion handling, so arrow paging jumps instantly for
  // users who ask for reduced motion without any extra code here.
  const scrollByCard = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>('[data-carousel-item]');
    // Card width + the gap between cards. Falls back to ~72% of the viewport
    // (one card + a peek) if the measurement is not available yet.
    const step = firstCard
      ? firstCard.offsetWidth + 24
      : el.clientWidth * 0.72;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  if (makers.length === 0) return null;

  return (
    <div className="relative">
      {/* Desktop arrows — vertically centred on the left/right edges of the
          track, the conventional "page the carousel" affordance. Hidden below
          lg because the phone uses swipe, not buttons. Each is disabled (and
          visually dimmed) at its end of the track, so a short list of makers
          never shows a live control that does nothing.

          Nudged half-off the track edge and given a solid card background +
          shadow so they read as floating controls over the row rather than
          sitting on a card. The portrait card frames are taller than these
          buttons, so centring on the track keeps them clear of the captions. */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollLeft}
        aria-label="Previous makers"
        className="absolute left-0 top-[38%] z-10 hidden -translate-x-1/2 -translate-y-1/2 tap-target lg:flex items-center justify-center rounded-full border border-sand-dark bg-card-bg text-deep-blue shadow-card transition-colors hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollRight}
        aria-label="Next makers"
        className="absolute right-0 top-[38%] z-10 hidden translate-x-1/2 -translate-y-1/2 tap-target lg:flex items-center justify-center rounded-full border border-sand-dark bg-card-bg text-deep-blue shadow-card transition-colors hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* The track. `-mx-gutter … px-gutter` lets cards bleed to the screen
          edge on mobile so a card can sit half-visible off the right edge (the
          "there is more" cue), while the first card still lines up with the page
          gutter. `scrollbar-hide` keeps the native scrollbar off the design. */}
      {/* `div role="list"` rather than a native `ul`/`li`, to match every card
          grid on the site. The list semantics have to live in exactly one place:
          `PosterCard` supplies each card's `role="listitem"`, so a native `li`
          here wrapped a listitem inside a listitem — which axe flags, because the
          inner one's nearest list ancestor is a listitem, not a list. One
          container pattern site-wide is what keeps that from happening again. */}
      {/* `scroll-pl-gutter` makes each snapped card come to rest at the gutter
          rather than flush against the screen edge — without it a scroll-snap
          container snaps `snap-start` cards to the padding box edge, so the
          first card sat at 0 on a phone and the section had no left inset. It
          mirrors `px-gutter` and is reset with the padding at `lg`. */}
      <div
        role="list"
        ref={trackRef}
        aria-label="Featured makers"
        className="-mx-gutter flex snap-x snap-mandatory gap-grid overflow-x-auto scroll-smooth scroll-pl-gutter px-gutter pb-3xs scrollbar-hide lg:mx-0 lg:scroll-pl-0 lg:px-0"
      >
        {makers.map((maker) => (
          <div
            key={maker.id}
            data-carousel-item
            // Fixed, responsive card widths so the track always shows a partial
            // next card (the swipe affordance): ~1.4 cards on a phone, more as
            // the screen widens, settling at 4-up on desktop — matching the old
            // grid's densest state. The widths sit just under a clean fraction
            // so the gap does not push the last card fully off; the browser
            // handles the exact snap.
            className="w-[72%] flex-shrink-0 snap-start sm:w-[46%] md:w-[38%] lg:w-[31%] xl:w-[23%]"
          >
            <MakerCard
              maker={maker}
              craftName={craftNameMap[maker.craftId] || undefined}
            />
          </div>
        ))}
      </div>

      {/* Mobile swipe hint — the desktop arrows do this job on wide screens, so
          this is lg:hidden. Stays visible as long as there is more to the right
          (`canScrollRight`) rather than fading on the first scroll, so the "there
          is more" affordance is honest: it persists while it is true and clears
          itself the moment the user reaches the last maker. Decorative icon; the
          text carries the meaning. */}
      {canScrollRight && makers.length > 1 && (
        <p
          aria-hidden="true"
          className="mt-sm flex items-center justify-center gap-2xs text-sm text-warm-gray-400 transition-opacity duration-300 lg:hidden"
        >
          <MoveHorizontal className="h-4 w-4" />
          Swipe to explore more makers
        </p>
      )}
    </div>
  );
}
