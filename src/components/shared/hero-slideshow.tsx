'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SlideItem {
  imageUrl: string;
  name: string;
  makerName?: string;
  place?: string;
}

interface HeroSlideshowProps {
  items: SlideItem[];
  interval?: number;
}

export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = items.length;

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

  if (count === 0) {
    return (
      <div className="relative w-full aspect-square sm:aspect-square lg:aspect-[4/3] bg-sand-light flex items-center justify-center">
        <p className="text-warm-gray-400">Product images coming soon</p>
      </div>
    );
  }

  const active = items[current];

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Full-width slide */}
      <div className="relative w-full aspect-square sm:aspect-square lg:aspect-[4/3] overflow-hidden bg-sand-light">
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 ${reduceMotion ? '' : 'transition-opacity duration-700 ease-out'} ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <SafeImage
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent z-20" />

        {/* Caption overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 lg:p-8">
          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold text-white leading-tight">
            {active.name}
          </h2>
          {active.makerName && (
            <p className="text-sm sm:text-base text-white/80 mt-1">
              by {active.makerName}
              {active.place && (
                <span className="text-white/60"> · {active.place}</span>
              )}
            </p>
          )}
        </div>

        {/* Navigation arrows — hidden on single item */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 tap-target w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 tap-target w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {count > 1 && (
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                  index === current ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {active.name}, {current + 1} of {count}
        </p>
      )}
    </div>
  );
}
