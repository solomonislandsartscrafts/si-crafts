'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SlideItem {
  imageUrl: string;
  name: string;
}

interface HeroSlideshowProps {
  items: SlideItem[];
  interval?: number;
}

/**
 * Minimal hero slideshow — just images that cross-fade.
 * No arrows, no dots, no caption clutter. The image IS the message.
 */
export function HeroSlideshow({ items, interval = 5000 }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (items.length === 0) {
    return <div className="absolute inset-0 bg-sand-light" />;
  }

  return (
    <div className="absolute inset-0">
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== current}
        >
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
