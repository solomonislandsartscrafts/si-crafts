'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';

export interface SlideItem {
  imageUrl: string;
  imageAlt: string;
  /** Product name. */
  title: string;
  /** Who made it, e.g. "by Julie Mone · Atori, Guadalcanal Province". */
  subtitle?: string;
  href: string;
  /** CSS object-position value to control crop focus (e.g. 'top', 'center', 'bottom', '50% 30%'). Defaults to 'center'. */
  objectPosition?: string;
}

interface HeroSlideshowProps {
  items: SlideItem[];
  interval?: number;
}

/** How much a neighbour shrinks. Paired with STEP_PCT below. */
const SIDE_SCALE = 0.82;

/**
 * Horizontal shift per step, as a % of the card's own width. At 50% a
 * neighbour's centre lands exactly on the centre card's edge, so precisely half
 * of it is tucked behind and half stays visible — whatever SIDE_SCALE is.
 */
const STEP_PCT = 50;

/**
 * Stage height is driven by the card width, so the two must change together.
 * Tuned so a card lands near the house 3/4 poster ratio — narrow and upright,
 * rather than the near-square block it was.
 */
const stageAspect = 'aspect-[9/10] sm:aspect-[4/3] lg:aspect-[10/7]';
// Sized so the exposed half of each neighbour, plus its shadow, still lands
// inside the stage from sm up. On a phone the neighbours peek off the edge,
// which is the expected mobile pattern.
const cardWidth = 'w-[72%] sm:w-[50%] lg:w-[46%]';

/**
 * Hero gallery — a coverflow carousel. The centre card links through to its
 * piece; the dimmed neighbours are tucked half behind it and bring themselves
 * to the centre when clicked.
 * Images are contained in a sand well so a whole piece is always visible and
 * every photo reads at the same size, whatever its own background. The product
 * name and maker sit in a footer inside the card.
 * Auto-advances, pauses on hover/focus/touch, supports swipe and arrow keys.
 */
export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = items.length;

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener('change', onMotionChange);
    return () => motionQuery.removeEventListener('change', onMotionChange);
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => setCurrent((prev) => (prev + direction + count) % count),
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const timer = setInterval(() => go(1), interval);
    return () => clearInterval(timer);
  }, [count, paused, interval, go, reduceMotion]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setPaused(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (touchDeltaX.current < -50) go(1);
    else if (touchDeltaX.current > 50) go(-1);
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setPaused(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  }

  if (count === 0) {
    return (
      <div className={`w-full ${stageAspect} flex items-center justify-center rounded-lg bg-card-bg`}>
        <p className="text-warm-gray-400 text-sm px-4 text-center">Images coming soon</p>
      </div>
    );
  }

  // `current` is clamped against the CURRENT item count, not the count it was
  // set against. If items shrink between renders, the stale index would point
  // past the end and `active` would be undefined.
  const safeIndex = current % count;
  const active = items[safeIndex];

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Handmade pieces from Solomon Islands"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
    >
      {/* Stage. overflow-hidden stops the off-stage cards causing sideways
          scroll on phones, where the gallery runs full-bleed. */}
      <div
        className={`relative w-full ${stageAspect} overflow-hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => {
          // Shortest way round the loop, so slide 0 sits to the right of the
          // last slide rather than far off to the left.
          const raw = (index - safeIndex + count) % count;
          const offset = raw > count / 2 ? raw - count : raw;
          const isActive = offset === 0;
          // Cards more than one step out wait just off-stage, faded, so they
          // slide in from the correct side. They must also be unreachable.
          const onStage = Math.abs(offset) <= 1;
          const shift = Math.max(-1.5, Math.min(1.5, offset)) * STEP_PCT;

          // Every card is the same shape whatever its state, so nothing
          // resizes as a card moves into the centre — only depth cues change:
          // scale, shadow, and how much the card is faded back.
          const cardClasses = [
            // inset-y-6 leaves room inside the clipped stage for the centre
            // card's cast shadow, which would otherwise be cut off flat.
            'group absolute inset-y-6 left-1/2 flex flex-col overflow-hidden rounded-lg',
            'bg-card-bg border border-sand focus:outline-none focus:ring-2 focus:ring-ocean',
            cardWidth,
            // The centre card casts onto the two behind it, which is what makes
            // the stack read as depth rather than as three flat panels.
            isActive ? 'shadow-lift-lg' : 'shadow-lift opacity-60 hover:opacity-90',
            reduceMotion ? '' : 'transition-all duration-500 ease-out',
          ].join(' ');

          const cardStyle = {
            transform: `translateX(calc(-50% + ${shift}%)) scale(${isActive ? 1 : SIDE_SCALE})`,
            zIndex: 10 - Math.abs(offset),
            // Only the parked cards are forced transparent; the rest is handled
            // by classes so a neighbour can lift on hover.
            ...(onStage ? {} : { opacity: 0 }),
          };

          const cardBody = (
            <>
              {/* Image well: gives every piece the same frame, so a cutout on
                  white and a full photo sit at the same visual weight. */}
              <div className="relative flex-1 bg-card-bg">
                <SafeImage
                  src={item.imageUrl}
                  alt={isActive ? item.imageAlt : ''}
                  fill
                  className="object-contain p-5 sm:p-6"
                  style={{ objectPosition: item.objectPosition || 'center' }}
                  sizes="(max-width: 640px) 68vw, (max-width: 1024px) 54vw, 360px"
                  priority={index === 0}
                />
              </div>

              {/* Footer inside the card. Kept on every card so the image well
                  is the same height throughout; the text only shows on the
                  centre one, where it can be read. */}
              <div
                className={`border-t border-sand px-4 py-3 ${
                  isActive ? '' : 'opacity-0'
                } ${reduceMotion ? '' : 'transition-opacity duration-300'}`}
              >
                <span className="block font-heading text-base sm:text-lg font-semibold text-deep-blue leading-tight line-clamp-1 group-hover:text-ocean transition-colors">
                  {item.title}
                </span>
                {/* Two lines, not one: this is the maker credit and the village
                    it came from, and at phone card width a single clamped line
                    cut the province off the end of the provenance. */}
                {item.subtitle && (
                  <span className="block text-sm text-warm-gray-600 mt-0.5 line-clamp-2">
                    {item.subtitle}
                  </span>
                )}
              </div>
            </>
          );

          // Every card is a Link, active or not. Swapping the element type as a
          // card reached the centre made React tear down the node and mount a
          // fresh one, so the coverflow transition never ran — the card simply
          // appeared in its new place. A neighbour's click is intercepted to
          // bring it to the centre instead of navigating.
          return (
            <Link
              key={index}
              href={item.href}
              className={cardClasses}
              style={cardStyle}
              tabIndex={onStage ? 0 : -1}
              aria-hidden={!onStage}
              aria-label={isActive ? undefined : `Show ${item.title}`}
              onClick={(e) => {
                if (isActive) return;
                e.preventDefault();
                setCurrent(index);
              }}
            >
              {cardBody}
            </Link>
          );
        })}
      </div>

      {/* Position dots — the only chrome. Without them there is nothing to say
          the gallery holds more than one piece, or where you are in it. */}
      {count > 1 && (
        <>
          {/* Hit boxes are 44px square and sit flush against each other, so the
              dots are a reliable target on a phone while the visible dot stays
              small. */}
          <div className="flex items-center justify-center">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className="flex h-11 w-11 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
                aria-label={`Show ${item.title}`}
                aria-current={index === safeIndex}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === safeIndex ? 'bg-ocean' : 'bg-sand-dark hover:bg-warm-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {active.title}, {safeIndex + 1} of {count}
          </p>
        </>
      )}
    </div>
  );
}
