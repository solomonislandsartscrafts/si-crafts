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
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);

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

  // Click to advance — skip if this click was triggered by a swipe
  function handleClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (count <= 1) return;
    go(1);
  }

  // Touch handlers for swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setDragging(true);
    setPaused(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    setDragOffset(delta);
  }

  function handleTouchEnd() {
    setDragging(false);
    const threshold = 50; // minimum px to register a swipe
    const didSwipe = Math.abs(touchDeltaX.current) > threshold;

    if (touchDeltaX.current < -threshold) {
      go(1); // swipe left = next
    } else if (touchDeltaX.current > threshold) {
      go(-1); // swipe right = previous
    }

    // Suppress the compatibility click that fires after touchend on recognized swipes
    if (didSwipe) {
      suppressClickRef.current = true;
    }

    touchStartX.current = null;
    touchDeltaX.current = 0;
    setDragOffset(0);
    setPaused(false);
  }

  function handleTouchCancel() {
    setDragging(false);
    setPaused(false);
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setDragOffset(0);
  }

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
      ref={containerRef}
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Full-width slide area — click to advance, swipe to navigate */}
      <div
        className="relative w-full aspect-square sm:aspect-square lg:aspect-[4/3] overflow-hidden bg-sand-light cursor-pointer select-none"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {items.map((item, index) => {
          // Calculate slide transform for swipe feedback
          const isActive = index === current;
          const translateX = dragging && isActive ? dragOffset : 0;

          return (
            <div
              key={index}
              className={`absolute inset-0 ${
                reduceMotion
                  ? ''
                  : dragging
                    ? ''
                    : 'transition-all duration-500 ease-out'
              } ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              style={
                isActive && dragging
                  ? { transform: `translateX(${translateX}px)`, opacity: 1 - Math.abs(translateX) / 600 }
                  : undefined
              }
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
          );
        })}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent z-20 pointer-events-none" />

        {/* Caption overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 lg:p-8 pointer-events-none">
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

        {/* Dots indicator */}
        {count > 1 && (
          <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(index);
                }}
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
