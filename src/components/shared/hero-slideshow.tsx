'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeImage } from '@/components/ui/safe-image';

export interface SlideItem {
  imageUrl: string;
  /** Piece name — shown as the caption headline. */
  name: string;
  /** Maker's name, if the maker is published. */
  makerName?: string;
  /** "Village, Province" — shown under the maker's name. */
  place?: string;
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

/**
 * Hero gallery — a coverflow carousel. The active piece sits centre and full
 * size; neighbours recede to either side, scaled down, dimmed and softly
 * blurred. Only the active slide is captioned.
 *
 * Autoplay pauses on hover and on keyboard focus so it can't yank a slide
 * away while someone is reading or tabbing through.
 */
export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const count = items.length;

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener('change', onMotionChange);

    // Track viewport width to use tighter mobile offsets
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

  if (count === 0) {
    return (
      <div className="relative h-[340px] sm:h-[400px] lg:h-[440px] flex items-center justify-center">
        <div className="w-[56%] sm:w-[62%] max-w-[300px] rounded-xl overflow-hidden bg-card-bg shadow-lg ring-1 ring-black/5">
          <div className="relative aspect-[4/5] flex flex-col">
            <div className="relative flex-1">
              <SafeImage
                src=""
                alt="Product images coming soon"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 62vw, 300px"
              />
            </div>
            <div className="px-4 py-3 bg-deep-blue text-left">
              <p className="font-heading text-base font-semibold text-white leading-snug">
                Coming Soon
              </p>
              <p className="text-xs text-white/80 mt-0.5">
                Product images will appear here
              </p>
            </div>
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
      aria-label="Featured pieces"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Stage — neighbours peek from the edges. On mobile, cards are smaller
          and use tighter offsets to avoid harsh clipping. */}
      <div className="relative h-[340px] sm:h-[400px] lg:h-[440px] overflow-hidden">
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
              aria-label={isActive ? undefined : `Show ${item.name}`}
              aria-hidden={hidden}
              className={`absolute top-1/2 left-1/2 w-[56%] sm:w-[62%] max-w-[300px] rounded-xl overflow-hidden bg-card-bg shadow-lg ring-1 ring-black/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-ocean ${
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
              <div className="relative aspect-[4/5] flex flex-col">
                {/* Image area — contains full image without cropping */}
                <div className="relative flex-1">
                  <SafeImage
                    src={item.imageUrl}
                    alt={isActive ? item.name : ''}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 56vw, 300px"
                    priority={index === 0}
                  />
                </div>

                {/* Caption — below the image, always visible on active slide */}
                {isActive && (
                  <figcaption className="px-4 py-3 bg-deep-blue text-left">
                    <p className="font-heading text-base font-semibold text-white leading-snug">
                      {item.name}
                    </p>
                    {item.makerName && (
                      <p className="text-xs text-white mt-0.5">
                        by {item.makerName}
                        {item.place && (
                          <span className="text-white/80"> · {item.place}</span>
                        )}
                      </p>
                    )}
                  </figcaption>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls removed — autoplay rotates slides, click/tap a neighbour to jump */}
      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {active.name}, {current + 1} of {count}
        </p>
      )}
    </div>
  );
}
