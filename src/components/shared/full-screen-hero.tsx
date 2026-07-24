'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
          <Image
            src={img}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
