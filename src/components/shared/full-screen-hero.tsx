'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';

interface FullScreenHeroProps {
  images: string[];
  interval?: number;
}

/**
 * Full-screen background slideshow for the homepage hero.
 * Cross-fades between images every `interval` ms.
 */
export function FullScreenHero({ images, interval = 5000 }: FullScreenHeroProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-deep-blue" />;
  }

  return (
    <div className="absolute inset-0">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== current}
        >
          <SafeImage
            src={img}
            alt=""
            fill
            className="object-contain p-4"
            sizes="100vw"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
