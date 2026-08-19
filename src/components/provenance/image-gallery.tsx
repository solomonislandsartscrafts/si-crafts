'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

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

  // Swipe handlers — only trigger horizontal swipes, preserve vertical scroll
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

    // Only swipe if horizontal movement exceeds vertical
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

    // Move focus into modal
    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();

      // Focus trap
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
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [fullscreen, goNext, goPrev]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-sand-light flex items-center justify-center">
        <span className="text-warm-gray-400 text-sm">Image coming soon</span>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-warm-gray-100 p-4 flex flex-col gap-4">
        {/* Main image — swipeable on mobile */}
        <div
          className="relative w-full aspect-square overflow-hidden rounded-lg bg-white touch-pan-y"
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
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute top-3 right-3 bg-deep-blue/70 text-white text-xs px-2 py-0.5 rounded-full">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Dot indicators on mobile */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 md:hidden">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === activeIndex ? 'bg-ocean' : 'bg-sand-dark'
                }`}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Thumbnails — inside the same box */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`tap-target flex-shrink-0 w-16 h-16 relative overflow-hidden rounded-md border-2 transition-colors ${
                  idx === activeIndex
                    ? 'border-ocean'
                    : 'border-transparent hover:border-sand-dark'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <SafeImage
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover rounded-md"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen lightbox — focus-managed modal */}
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
