'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeImage } from '@/components/ui/safe-image';

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

  // Touch/swipe state
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

  function handleClick() {
    if (count <= 1) return;
    go(1);
  }

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

  if (count === 0) {
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/3] bg-sand-light flex items-center justify-center rounded-lg">
        <p className="text-warm-gray-400">Product images coming soon</p>
      </div>
    );
  }

  const active = items[current];

  // Calculate card positions relative to current
  function getCardStyle(index: number): { zIndex: number; transform: string; opacity: number } {
    const offset = (index - current + count) % count;

    if (offset === 0) {
      // Front card
      return { zIndex: 30, transform: 'translateY(0) scale(1)', opacity: 1 };
    } else if (offset === 1 || (offset === count - 1 && count === 2)) {
      // Second card (behind right)
      return { zIndex: 20, transform: 'translateY(12px) scale(0.93)', opacity: 0.7 };
    } else if (offset === 2 || offset === count - 1) {
      // Third card (behind further)
      return { zIndex: 10, transform: 'translateY(24px) scale(0.86)', opacity: 0.4 };
    }
    // Hidden
    return { zIndex: 0, transform: 'translateY(36px) scale(0.8)', opacity: 0 };
  }

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stacked card area */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/3] cursor-pointer select-none"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ paddingBottom: '24px' }} /* Space for stacked cards peeking */
      >
        {items.map((item, index) => {
          const { zIndex, transform, opacity } = getCardStyle(index);
          const isActive = index === current;

          return (
            <div
              key={index}
              className={`absolute inset-x-0 top-0 bottom-6 rounded-xl overflow-hidden shadow-card ${
                reduceMotion ? '' : 'transition-all duration-500 ease-out'
              }`}
              style={{ zIndex, transform, opacity }}
            >
              <SafeImage
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-contain bg-sand-light"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />

              {/* Caption overlay — only on active card */}
              {isActive && (
                <>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 pointer-events-none">
                    <h2 className="font-heading text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-tight">
                      {active.name}
                    </h2>
                    {active.makerName && (
                      <p className="text-sm text-white/80 mt-1">
                        by {active.makerName}
                        {active.place && (
                          <span className="text-white/60"> · {active.place}</span>
                        )}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots indicator */}
      {count > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(index);
              }}
              className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ocean ${
                index === current ? 'bg-ocean w-5' : 'bg-sand-dark'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {count > 1 && (
        <p className="sr-only" aria-live="polite">
          Showing {active.name}, {current + 1} of {count}
        </p>
      )}
    </div>
  );
}
