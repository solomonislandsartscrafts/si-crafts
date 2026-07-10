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
      {/* Gallery: thumbnails left, main image right */}
      <div className="flex gap-3">
        {/* Vertical thumbnails */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] sm:max-h-[500px]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`tap-target flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 relative rounded-md overflow-hidden transition-all ${
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
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image — click to fullscreen */}
        <div className="flex-1">
          <button
            onClick={() => setFullscreen(true)}
            className="w-full aspect-square relative rounded-xl overflow-hidden bg-sand-light shadow-sm cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="View fullscreen"
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} - image ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </button>
        </div>
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
