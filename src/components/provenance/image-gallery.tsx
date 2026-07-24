'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard nav in fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [fullscreen, goNext, goPrev]);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-sand flex items-center justify-center">
        <span className="text-warm-gray-400 text-sm">Image coming soon</span>
      </div>
    );
  }

  return (
    <>
      {/* Gallery: main image on top, thumbnails below */}
      <div className="flex flex-col gap-3">
        {/* Main image with navigation arrows */}
        <div className="relative w-full aspect-square overflow-hidden bg-sand-light">
          <button
            onClick={() => setFullscreen(true)}
            className="w-full h-full relative cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="View fullscreen"
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} - image ${activeIndex + 1}`}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>

          {/* Left/Right arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 tap-target w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-deep-blue shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 tap-target w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-deep-blue shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-deep-blue/70 text-white text-xs px-2 py-1 rounded">
              {activeIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Horizontal thumbnails below */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`tap-target flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden bg-sand-light transition-all ${
                  idx === activeIndex
                    ? 'ring-2 ring-ocean opacity-100'
                    : 'opacity-50 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen lightbox */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-deep-blue/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 tap-target p-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean rounded-md"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          <span className="absolute top-4 left-4 text-sm text-white/60">
            {activeIndex + 1} / {images.length}
          </span>

          {/* Previous */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 tap-target p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean rounded-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Main fullscreen image */}
          <div
            className="relative w-[90vw] h-[80vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} - fullscreen ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 tap-target p-2 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean rounded-md"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Bottom thumbnails in fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={`w-12 h-12 relative rounded-md overflow-hidden transition-all ${
                    idx === activeIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-40 hover:opacity-80'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${alt} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
