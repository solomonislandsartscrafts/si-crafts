'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Maker, Product } from '@/types';
import { ProductCard } from '@/components/cards/product-card';

interface ProductsCarouselProps {
  products: Product[];
  /** Makers, so each card can show its maker's name and province. */
  makers: Maker[];
}

/**
 * Horizontal, swipeable row of product cards for the homepage "Featured
 * products" section — the same interaction as `MakersCarousel`, applied to the
 * pieces so the two homepage showcases read as one family.
 *
 * The layout is breakpoint-dependent:
 *
 * - Below `lg` (phone/tablet) it is a plain responsive grid — 2-up at every
 *   width, matching the catalogue grid (`posterGridClasses`), so a phone user
 *   sees the pieces at once with no swipe and the homepage and catalogue read
 *   the same on mobile.
 * - From `lg` up the same markup becomes a single scroll-snap row driven by
 *   prev/next arrows that page by one card. Arrows only appear once there is
 *   somewhere to scroll (disabled at each end), so a short list never shows dead
 *   controls.
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
          track. Hidden below lg because the phone shows every card in a grid.
          Each is disabled
          (and hidden) at its end of the track so a short list never shows a
          live control that does nothing. The square product frames are taller
          than these buttons, so centring on the track keeps them clear of the
          captions. */}
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

      {/* The track. Below `lg` it is a plain responsive grid — 2-up at every
          width to match the catalogue grid (`posterGridClasses`), so a phone
          user sees the pieces at once with no swipe. From `lg` up it becomes a single
          scroll-snap row driven by the arrows above: `lg:-mx-0 … lg:px-0` and
          the flex/snap utilities only apply at that breakpoint. `scrollbar-hide`
          keeps the native scrollbar off the design. `div role="list"` (not a
          native `ul`/`li`) because `PosterCard` already supplies each card's
          `role="listitem"`, so a native `li` would nest a listitem inside a
          listitem. */}
      <div
        role="list"
        ref={trackRef}
        aria-label="Featured products"
        className="grid grid-cols-2 gap-grid lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-auto lg:scroll-smooth lg:scroll-pl-0 lg:px-0 lg:pb-3xs lg:scrollbar-hide"
      >
        {products.map((product) => {
          const maker = makers.find((m) => m.id === product.makerId);
          return (
            <div
              key={product.id}
              data-carousel-item
              // Below `lg` the cards are grid cells and take their width from the
              // grid (2-up at every width, matching the catalogue), so a phone
              // shows the pieces with no swipe. From `lg` up they become
              // fixed-width flex items in the scroll row, always leaving a
              // partial next card visible as the "there is more" cue — settling
              // at 4-up on desktop, matching the maker carousel's rhythm.
              className="lg:w-[31%] lg:flex-shrink-0 lg:snap-start xl:w-[23%]"
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

    </div>
  );
}
