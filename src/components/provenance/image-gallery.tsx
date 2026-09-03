'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
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
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('center');
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    setZoomed(false);
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setZoomed(false);
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Fullscreen pan-to-zoom. A wholesale buyer is assessing weave, grain and
  // finish, so the lightbox magnifies on click and follows the pointer rather
  // than showing the same fit-to-screen image the page already shows.
  function toggleZoom(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    if (zoomed) {
      setZoomed(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
    setZoomed(true);
  }

  function handleZoomMove(e: React.MouseEvent<HTMLElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

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
      setZoomed(false);
      previousFocusRef.current?.focus();
    };
  }, [fullscreen, goNext, goPrev]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-card-bg shadow-card flex items-center justify-center">
        <span className="text-warm-gray-400 text-sm">Image coming soon</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-sm">
        {/* Main image. White well, no frame: photos arrive at mixed aspect
            ratios and object-contain always leaves space inside the square, so
            any border reads as an uneven frame drawn around each photo. The
            card shadow gives the well its edge instead. */}
        <div
          className="group relative w-full aspect-square overflow-hidden rounded-lg bg-card-bg shadow-card touch-pan-y"
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
              className="object-contain p-2xs"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>

          {/* Navigation arrows on the main image (desktop). Kept quiet: they
              rest at reduced opacity and come up on hover/focus so the photo
              leads, not the chrome. Thumbnails carry the primary navigation. */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 hidden md:flex tap-target items-center justify-center bg-white/90 hover:bg-white text-deep-blue rounded-full shadow-card opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex tap-target items-center justify-center bg-white/90 hover:bg-white text-deep-blue rounded-full shadow-card opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Zoom affordance — mirrors the cursor's zoom-in hint so it is clear
              the fullscreen view magnifies rather than just enlarging. */}
          <span className="absolute bottom-3 left-3 hidden md:flex items-center gap-3xs bg-white/90 text-warm-gray-600 text-xs px-2xs py-3xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
            Click to zoom
          </span>

          {/* Image counter badge */}
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-deep-blue/80 text-white text-xs px-2xs py-3xs rounded-md">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Thumbnail strip — desktop only. Below md the dots below do the same
            job in far less space, and showing both gave a phone two competing
            sets of controls for one gallery. */}
        {images.length > 1 && (
          <div className="hidden md:flex gap-xs overflow-x-auto pb-3xs">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setZoomed(false); setActiveIndex(idx); }}
                className={`tap-target flex-shrink-0 w-20 h-20 relative overflow-hidden rounded-md border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
                  idx === activeIndex
                    ? 'border-ocean'
                    : 'border-sand hover:border-ocean/50'
                }`}
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === activeIndex ? 'true' : undefined}
              >
                {/* object-contain on white, matching the main well: thumbnails
                    of non-square photos would otherwise crop the exact edges —
                    handles, spouts, weave borders — a buyer wants to compare. */}
                <SafeImage
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  className="object-contain bg-card-bg p-3xs"
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
                onClick={() => { setZoomed(false); setActiveIndex(idx); }}
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

      {/* Zoom lightbox — a centred modal panel over a dimmed backdrop, the
          standard lightbox pattern. The backdrop greys the page out (click it
          to close); the image sits in a bounded white card in the middle
          rather than filling the whole viewport. */}
      {fullscreen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          tabIndex={-1}
          className="fixed inset-0 z-[9999] bg-deep-blue/70 backdrop-blur-sm flex items-center justify-center p-sm md:p-xl outline-none"
          onClick={() => setFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Modal panel. Clicks inside stay inside (do not close), so only the
              dimmed backdrop dismisses. Bounded so the image never fills the
              screen: capped width and height, centred, with the card shadow. */}
          <div
            className="relative w-full max-w-2xl max-h-[85vh] bg-card-bg rounded-lg shadow-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-3 right-3 z-10 tap-target flex items-center justify-center bg-white/90 hover:bg-white text-warm-gray-600 hover:text-deep-blue rounded-full shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <span className="absolute top-3 left-3 z-10 bg-deep-blue/80 text-white text-sm px-2xs py-3xs rounded-md">
                {activeIndex + 1} / {images.length}
              </span>
            )}

            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 tap-target flex items-center justify-center bg-white/90 hover:bg-white text-warm-gray-600 hover:text-deep-blue rounded-full shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Pan-to-zoom stage. Click magnifies to 2x centred on the pointer;
                moving the pointer pans the enlarged view; clicking again resets. */}
            <div
              className={`relative w-full aspect-square max-h-[85vh] overflow-hidden ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={toggleZoom}
              onMouseMove={handleZoomMove}
            >
              <SafeImage
                src={images[activeIndex]}
                alt={`${alt} - enlarged ${activeIndex + 1}`}
                fill
                className="object-contain p-sm transition-transform duration-300"
                style={{
                  transform: zoomed ? 'scale(2)' : 'scale(1)',
                  transformOrigin: origin,
                }}
                sizes="(max-width: 768px) 100vw, 42rem"
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 tap-target flex items-center justify-center bg-white/90 hover:bg-white text-warm-gray-600 hover:text-deep-blue rounded-full shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
