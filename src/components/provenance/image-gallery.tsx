'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Product image gallery — large main image with a row of square thumbnails
 * beneath. Matches the e-commerce reference layout:
 *   • Main image: contained inside a light background with click-to-zoom
 *   • Thumbnails: row of square images, active state indicated by border
 *   • Swipeable on mobile, arrow-key navigable in fullscreen
 */
export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  }

  function handleTouchEnd() {
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current - touchEndY.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  }

  // Fullscreen: focus management + keyboard nav + focus trap
  useEffect(() => {
    if (!fullscreen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
      previousFocusRef.current?.focus();
    };
  }, [fullscreen, goNext, goPrev]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-white border-2 border-ocean/20 flex items-center justify-center">
        <span className="text-warm-gray-400 text-sm">Image coming soon</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div
          className="relative w-full aspect-square overflow-hidden rounded-lg bg-white border-2 border-ocean/20 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setFullscreen(true)}
            className="w-full h-full relative cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ocean rounded-lg"
            aria-label="View fullscreen"
          >
            <SafeImage
              src={images[activeIndex]}
              alt={`${alt} - image ${activeIndex + 1}`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>

          {/* Navigation arrows on the main image (desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 hidden md:flex tap-target items-center justify-center bg-deep-blue/90 hover:bg-deep-blue text-white rounded-full shadow-card transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex tap-target items-center justify-center bg-deep-blue/90 hover:bg-deep-blue text-white rounded-full shadow-card transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Image counter badge */}
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-deep-blue/80 text-white text-xs px-2 py-1 rounded-md">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Thumbnail strip — desktop only. Below md the dots below do the same
            job in far less space, and showing both gave a phone two competing
            sets of controls for one gallery. */}
        {images.length > 1 && (
          <div className="hidden md:flex gap-3 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`tap-target flex-shrink-0 w-20 h-20 relative overflow-hidden rounded-md border-2 transition-colors ${
                  idx === activeIndex
                    ? 'border-ocean ring-2 ring-ocean/30'
                    : 'border-sand hover:border-ocean/50'
                }`}
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === activeIndex ? 'true' : undefined}
              >
                <SafeImage
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Dot indicators — mobile only. Hit boxes are 44px square and sit
            flush against each other, as in the hero slideshow, so the dots are
            a reliable target while the visible dot stays small. */}
        {images.length > 1 && (
          <div className="flex items-center justify-center md:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="flex h-11 w-11 items-center justify-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === activeIndex ? 'true' : undefined}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    idx === activeIndex ? 'bg-ocean' : 'bg-sand-dark'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen lightbox */}
      {fullscreen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          tabIndex={-1}
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center outline-none"
          onClick={() => setFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 tap-target p-2 text-warm-gray-600 hover:text-deep-blue rounded-full focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <span className="absolute top-4 left-4 text-sm text-warm-gray-600">
              {activeIndex + 1} / {images.length}
            </span>
          )}

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 tap-target p-2 text-warm-gray-600 hover:text-deep-blue rounded-full focus:outline-none focus:ring-2 focus:ring-ocean"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div
            className="relative w-[90vw] h-[80vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={images[activeIndex]}
              alt={`${alt} - fullscreen ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 tap-target p-2 text-warm-gray-600 hover:text-deep-blue rounded-full focus:outline-none focus:ring-2 focus:ring-ocean"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
