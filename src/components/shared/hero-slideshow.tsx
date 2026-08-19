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

export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const count = items.length;

  // Touch/swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const touchDeltaY = useRef(0);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(motionQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener('change', onMotionChange);
    return () => motionQuery.removeEventListener('change', onMotionChange);
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => {
      setCurrent((prev) => (prev + direction + count) % count);
      setSlideKey((k) => k + 1);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const timer = setInterval(() => go(1), interval);
    return () => clearInterval(timer);
  }, [count, paused, interval, go, reduceMotion]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    setPaused(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  }

  function handleTouchEnd() {
    const threshold = 50;
    const absX = Math.abs(touchDeltaX.current);
    const absY = Math.abs(touchDeltaY.current);
    // Only trigger swipe when horizontal movement dominates vertical
    if (absX > threshold && absX > absY) {
      if (touchDeltaX.current < 0) go(1);
      else go(-1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    setPaused(false);
  }

  function handleTouchCancel() {
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    setPaused(false);
  }

  if (count === 0) {
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/3] bg-sand-light flex items-center justify-center">
        <p className="text-warm-gray-400">Images coming soon</p>
      </div>
    );
  }

  const active = items[current];

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Makers, crafts, and products of Solomon Islands"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* === IMAGE === */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-square cursor-pointer select-none overflow-hidden rounded-lg"
        onClick={() => count > 1 && go(1)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Progress bar */}
        {count > 1 && !paused && !reduceMotion && (
          <div className="absolute top-0 left-0 right-0 h-[3px] z-30 bg-white/30">
            <div
              key={slideKey}
              className="h-full bg-white origin-left animate-progress-fill"
              style={{ animationDuration: `${interval}ms` }}
            />
          </div>
        )}

        {/* Slide images */}
        {items.map((item, index) => {
          const isActive = index === current;

          return (
            <div
              key={index}
              className={`absolute inset-0 ${
                reduceMotion
                  ? ''
                  : 'transition-opacity duration-700 ease-in-out'
              } ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className={`absolute inset-0 ${isActive && !reduceMotion ? 'animate-ken-burns' : ''}`}
                style={{ animationDuration: `${interval}ms` }}
              >
                <SafeImage
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  className="object-contain bg-sand-light"
                  sizes="(max-width: 768px) 100vw, 100vw"
                  priority={index === 0}
                />
              </div>
            </div>
          );
        })}

        {/* Dots — inside image, bottom center */}
        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-deep-blue/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrent(index); setSlideKey((k) => k + 1); }}
                className={`shrink-0 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60 ${
                  index === current ? 'bg-white w-5' : 'bg-white/60 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}: ${items[index].title}`}
              />
            ))}
          </div>
        )}

        {/* === MOBILE CAPTION OVERLAY (stays on image for mobile) === */}
        <div className="md:hidden absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/40 to-transparent pt-16 pb-12 px-4 sm:px-5">
          <div key={slideKey} className={reduceMotion ? '' : 'animate-fade-in-up'}>
            {active.tag && (
              <span className="inline-flex text-xs font-medium text-deep-blue bg-white/90 px-2.5 py-1 capitalize rounded-sm mb-2">
                {active.tag}
              </span>
            )}

            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-white leading-tight line-clamp-2">
              {active.title}
            </h2>

            <Link
              href={active.href}
              onClick={(e) => e.stopPropagation()}
              className="tap-target inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 rounded-sm mt-2"
            >
              {active.kind === 'product' ? 'View piece' : active.kind === 'maker' ? 'Meet them' : 'See how'}
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Prev/Next arrows — centered on left and right edges */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 tap-target flex items-center justify-center w-9 h-9 rounded-full bg-deep-blue/50 text-white/90 hover:bg-deep-blue/70 hover:text-white backdrop-blur-sm shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 tap-target flex items-center justify-center w-9 h-9 rounded-full bg-deep-blue/50 text-white/90 hover:bg-deep-blue/70 hover:text-white backdrop-blur-sm shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* === DESKTOP CAPTION — outside image, bottom-left like a tag === */}
      <div className="hidden md:flex items-center gap-3 mt-3 px-1">
        <div
          key={slideKey}
          className={`flex items-center gap-2 ${reduceMotion ? '' : 'animate-fade-in-up'}`}
        >
          {active.tag && (
            <span className="text-[11px] font-semibold text-warm-gray-600 uppercase tracking-wide">
              {active.tag}
            </span>
          )}
          {active.tag && <span className="text-sand-dark">·</span>}
          <h3 className="font-heading text-sm font-medium text-deep-blue leading-snug line-clamp-1">
            {active.title}
          </h3>
          <Link
            href={active.href}
            className="tap-target inline-flex items-center gap-1 text-xs font-medium text-ocean hover:text-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light rounded-sm ml-1"
          >
            {active.kind === 'product' ? 'View piece' : active.kind === 'maker' ? 'Meet them' : 'See how'}
            <ChevronRight className="w-3 h-3 shrink-0" />
          </Link>
        </div>
      </div>

      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {active.title}, {current + 1} of {count}
        </p>
      )}
    </div>
  );
}
