'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

export type SlideKind = 'product' | 'maker' | 'craft';

export interface SlideItem {
  kind: SlideKind;
  imageUrl: string;
  imageAlt: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  tag?: string;
  href: string;
}

interface HeroSlideshowProps {
  items: SlideItem[];
  interval?: number;
}

/** How far each neighbouring slide sits from centre, and how it recedes. */
const DEPTH = [
  { offset: 0, scale: 1, opacity: 1, blur: 0, z: 30 },
  { offset: 58, scale: 0.84, opacity: 0.55, blur: 1, z: 20 },
  { offset: 100, scale: 0.7, opacity: 0.25, blur: 2, z: 10 },
];

/** Mobile offsets — tighter spacing so neighbours peek rather than clip mid-card. */
const DEPTH_MOBILE = [
  { offset: 0, scale: 1, opacity: 1, blur: 0, z: 30 },
  { offset: 48, scale: 0.78, opacity: 0.45, blur: 1.5, z: 20 },
  { offset: 85, scale: 0.65, opacity: 0.2, blur: 2, z: 10 },
];

function ctaLabel(kind: SlideKind) {
  return kind === 'product' ? 'View piece' : kind === 'maker' ? 'Meet them' : 'See how';
}

/**
 * Hero gallery — a coverflow carousel. The active slide sits centre and full
 * size; neighbours recede to either side, scaled down, dimmed and softly
 * blurred. Only the active slide is captioned. Clicking a neighbour brings
 * it to centre; the prev/next buttons below step through slides one at a time.
 *
 * Autoplay pauses on hover, keyboard focus, and touch so it can't yank a
 * slide away while someone is reading, tabbing through, or swiping.
 */
export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const count = items.length;

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener('change', onMotionChange);

    const mobileQuery = window.matchMedia('(max-width: 639px)');
    setIsMobile(mobileQuery.matches);
    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileQuery.addEventListener('change', onMobileChange);

    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      mobileQuery.removeEventListener('change', onMobileChange);
    };
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
    const threshold = 50;
    if (touchDeltaX.current < -threshold) go(1);
    else if (touchDeltaX.current > threshold) go(-1);
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
      <div className="relative w-full aspect-square flex items-center justify-center">
        <div className="w-[60%] max-w-[380px] rounded-lg overflow-hidden bg-card-bg shadow-card ring-1 ring-black/5">
          <div className="relative aspect-[4/5] flex items-center justify-center bg-sand-light">
            <p className="text-warm-gray-400 text-sm px-4 text-center">Images coming soon</p>
          </div>
        </div>
      </div>
    );
  }

  const active = items[current];

  /** Shortest signed distance from the active slide, wrapping around the ends. */
  function distanceFromCurrent(index: number) {
    let d = index - current;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  }

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Makers, crafts, and products of Solomon Islands"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
    >
      {/* Stage — neighbours peek from the edges, clipped rather than overflowing.
          Scales with the column width instead of a fixed pixel height, so it
          fills the hero space properly at every breakpoint. */}
      <div
        className="relative w-full aspect-square overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) => {
          const d = distanceFromCurrent(index);
          const depthTable = isMobile ? DEPTH_MOBILE : DEPTH;
          const depth = depthTable[Math.min(Math.abs(d), depthTable.length - 1)];
          const isActive = d === 0;
          const hidden = Math.abs(d) >= depthTable.length;
          const direction = Math.sign(d);

          return (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              tabIndex={isActive ? -1 : 0}
              aria-label={isActive ? undefined : `Show ${item.title}`}
              aria-hidden={hidden}
              className={`absolute top-1/2 left-1/2 w-[62%] max-w-[380px] rounded-lg overflow-hidden bg-card-bg shadow-card ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
                isActive ? 'cursor-default' : 'cursor-pointer'
              } ${reduceMotion ? '' : 'transition-all duration-700 ease-out'}`}
              style={{
                transform: `translate(calc(-50% + ${depth.offset * direction}%), -50%) scale(${depth.scale})`,
                opacity: hidden ? 0 : depth.opacity,
                filter: depth.blur ? `blur(${depth.blur}px)` : undefined,
                zIndex: depth.z,
                pointerEvents: hidden || isActive ? 'none' : 'auto',
              }}
            >
              <div className="relative aspect-[4/5] bg-sand-light">
                {/* Image fills the entire card */}
                <SafeImage
                  src={item.imageUrl}
                  alt={isActive ? item.imageAlt : ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 62vw, 380px"
                  priority={index === 0}
                />

                {/* Caption — solid dark band anchored to the bottom, only on the active card */}
                {isActive && (
                  <figcaption
                    className={`absolute inset-x-0 bottom-0 px-3 py-2.5 bg-deep-blue/90 text-left ${reduceMotion ? '' : 'animate-fade-in-up'}`}
                  >
                    <p className="font-heading text-sm font-semibold text-white leading-tight line-clamp-1">
                      {item.title}
                    </p>
                    <Link
                      href={item.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm"
                    >
                      {ctaLabel(item.kind)}
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    </Link>
                  </figcaption>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Prev/Next controls — below the stage, centred */}
      {count > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => go(-1)}
            className="tap-target flex items-center justify-center w-11 h-11 rounded-full border border-sand-dark bg-card-bg text-warm-gray-600 hover:border-ocean hover:text-ocean shadow-card transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="tap-target flex items-center justify-center w-11 h-11 rounded-full border border-sand-dark bg-card-bg text-warm-gray-600 hover:border-ocean hover:text-ocean shadow-card transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {active.title}, {current + 1} of {count}
        </p>
      )}
    </div>
  );
}
