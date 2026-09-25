'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import type { Maker, Product } from '@/types';
import { ProductCard } from '@/components/cards/product-card';

interface ProductsCarouselProps {
  products: Product[];
  /** Makers, so each card can show its maker's name and province. */
  makers: Maker[];
}

/**
 * Horizontal, swipeable row of product cards for the homepage "Featured
 * products" section — the SAME interaction and layout as `MakersCarousel`, so
 * the two homepage showcases read as one family at every breakpoint:
 *
 * - On a phone it is a native scroll-snap row: cards bleed to the screen edge so
 *   a partial next card is always visible (the "there is more" cue), the user
 *   swipes with a thumb, and a "Swipe to explore" hint sits under the track and
 *   clears itself once the user reaches the end.
 * - On desktop the same track is driven by prev/next arrows that page by one
 *   card. Arrows only appear once there is somewhere to scroll (disabled at each
 *   end), so a short list never shows dead controls.
 *
 * Native scroll rather than a JS-transformed carousel (KISS): the browser
 * handles momentum, snapping and keyboard/trackpad scrolling for free, and it
 * degrades gracefully with JS off — the row is still swipeable. Kept as a
 * sibling of `MakersCarousel` rather than a shared generic: the two are small,
 * self-contained, and render different cards, and one abstraction over both
 * would be more code than the duplication it removes.
 */
export function ProductsCarousel({ products, makers }: ProductsCarouselProps) {
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
    const step = firstCard ? firstCard.offsetWidth + 24 : el.clientWidth * 0.72;
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="relative">
      {/* Desktop arrows — vertically centred on the left/right edges of the
          track. Each is disabled and faded to `opacity-0` when the track can't
          scroll in that direction. Since the desktop layout is now a fixed
          4-column grid with no overflow, both stay disabled → invisible on
          desktop; they only ever appear if the grid is later made scrollable
          again. On mobile they are hidden outright (`hidden`, no `lg:flex`
          reached) since the phone uses swipe. */}
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollLeft}
        aria-label="Previous products"
        className="absolute left-0 top-[38%] z-10 hidden -translate-x-1/2 -translate-y-1/2 tap-target lg:flex items-center justify-center rounded-full border border-sand-dark bg-card-bg text-deep-blue shadow-card transition-colors hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollRight}
        aria-label="Next products"
        className="absolute right-0 top-[38%] z-10 hidden translate-x-1/2 -translate-y-1/2 tap-target lg:flex items-center justify-center rounded-full border border-sand-dark bg-card-bg text-deep-blue shadow-card transition-colors hover:border-ocean hover:text-ocean disabled:cursor-not-allowed disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* The track — identical to MakersCarousel. `-mx-gutter … px-gutter` lets
          cards bleed to the screen edge on mobile so a card sits half-visible off
          the right edge (the "there is more" cue), while the first card still
          lines up with the page gutter. `scroll-pl-gutter` makes each snapped
          card rest at the gutter rather than flush to the edge. `scrollbar-hide`
          keeps the native scrollbar off the design. `div role="list"` (not a
          native `ul`/`li`) because `PosterCard` already supplies each card's
          `role="listitem"`. */}
      {/* Below `lg` this is a swipeable scroll-snap row (same as MakersCarousel
          — cards bleed to the edge, thumb-swipe). From `lg` up it becomes a
          fixed 4-column GRID instead of a scroll row: the homepage shows exactly
          four featured crafts on desktop with no horizontal overflow, so there
          is nothing to page and the prev/next arrows stay hidden (they only
          appear when the track can scroll). `overflow-x-auto` is scoped to below
          `lg` (`max-lg:overflow-x-auto`) so the grid does not reintroduce a
          scrollbar. */}
      <div
        role="list"
        ref={trackRef}
        aria-label="Featured crafts"
        className="-mx-gutter flex snap-x snap-mandatory gap-grid max-lg:overflow-x-auto scroll-smooth scroll-pl-gutter px-gutter pb-3xs scrollbar-hide lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0"
      >
        {products.map((product) => {
          const maker = makers.find((m) => m.id === product.makerId);
          return (
            <div
              key={product.id}
              data-carousel-item
              // Mobile: fixed widths so the row shows a partial next card (the
              // swipe cue), matching MakersCarousel. From `lg` up the width
              // utilities are dropped so each card is a plain grid cell — four
              // equal columns, no peek, no overflow.
              className="w-[72%] flex-shrink-0 snap-start sm:w-[46%] md:w-[38%] lg:w-auto lg:flex-shrink"
            >
              <ProductCard
                product={product}
                makerName={maker?.name}
                makerLocation={maker?.province}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile swipe hint — matches MakersCarousel: lg:hidden (arrows do this
          on desktop), stays visible while there is more to the right and clears
          itself at the end. Decorative icon; the text carries the meaning. */}
      {canScrollRight && products.length > 1 && (
        <p
          aria-hidden="true"
          className="mt-sm flex items-center justify-center gap-2xs text-sm text-warm-gray-400 transition-opacity duration-300 lg:hidden"
        >
          <MoveHorizontal className="h-4 w-4" />
          Swipe to explore more crafts
        </p>
      )}
    </div>
  );
}
