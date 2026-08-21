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
  /** CSS object-position value to control crop focus (e.g. 'top', 'center', 'bottom', '50% 30%'). Defaults to 'center'. */
  objectPosition?: string;
}

interface HeroSlideshowProps {
  items: SlideItem[];
  interval?: number;
}

function ctaLabel(kind: SlideKind) {
  return kind === 'product' ? 'View piece' : kind === 'maker' ? 'Meet them' : 'See how';
}

/**
 * Hero slideshow — a traditional full-image slideshow with a gradient overlay
 * at the bottom so text is always readable on top of the image.
 * Auto-advances, pauses on hover/focus/touch, supports swipe and keyboard nav.
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
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/2] flex items-center justify-center bg-sand-light">
        <p className="text-warm-gray-400 text-sm px-4 text-center">Images coming soon</p>
      </div>
    );
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
      {/* Slide container */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[3/2] overflow-hidden bg-sand-light"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        {items.map((item, index) => {
          const isActive = index === current;
          return (
            <div
              key={index}
              className={`absolute inset-0 pointer-events-none ${reduceMotion ? '' : 'transition-opacity duration-700 ease-in-out'}`}
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
              aria-hidden={!isActive}
            >
              <SafeImage
                src={item.imageUrl}
                alt={isActive ? item.imageAlt : ''}
                fill
                className="object-cover"
                style={{ objectPosition: item.objectPosition || 'center' }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                priority={index === 0}
              />
            </div>
          );
        })}

        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 z-[2] pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(27, 58, 75, 0.85) 0%, rgba(27, 58, 75, 0.5) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 sm:px-6 sm:pb-6">
          {items[current].kicker && (
            <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-1">
              {items[current].kicker}
            </p>
          )}
          <h3 className="font-heading text-lg sm:text-xl font-semibold text-white leading-tight line-clamp-2">
            {items[current].title}
          </h3>
          {items[current].subtitle && (
            <p className="text-sm text-white/80 mt-1 line-clamp-1">
              {items[current].subtitle}
            </p>
          )}
          <Link
            href={items[current].href}
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm"
          >
            {ctaLabel(items[current].kind)}
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>

        {/* Prev/Next arrows */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 sm:left-3 -translate-y-1/2 z-20 tap-target flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 z-20 tap-target flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                index === current ? 'bg-ocean' : 'bg-sand-dark hover:bg-warm-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {items[current].title}, {current + 1} of {count}
        </p>
      )}
    </div>
  );
}
