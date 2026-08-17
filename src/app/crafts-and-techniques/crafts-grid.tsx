'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import type { Craft } from '@/types';

export function CraftsGrid() {
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { getAllCrafts } = await import('@/services/crafts');
        const data = await getAllCrafts();
        setCrafts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow-card animate-pulse">
            <div className="aspect-square bg-sand-light" />
            <div className="bg-warm-gray-100 p-3 sm:p-4 space-y-2">
              <div className="h-4 bg-sand-light rounded w-2/3" />
              <div className="h-3 bg-sand-light rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (crafts.length === 0) {
    return <p className="text-warm-gray-400 italic">Crafts coming soon.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {crafts.map((craft) => (
        <Link
          key={craft.id}
          href={`/craft/${craft.slug}`}
          className="group block w-full overflow-hidden rounded-lg shadow-card hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          {/* Image area */}
          <div className="aspect-square relative bg-sand-light overflow-hidden rounded-t-lg">
            <SafeImage
              src={craft.processImageUrls[0] || null}
              alt={craft.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          {/* Info bar — subtle grey background */}
          <div className="bg-warm-gray-100 p-3 sm:p-4">
            <h2 className="font-heading text-sm sm:text-base font-semibold text-deep-blue leading-tight line-clamp-2">
              {craft.name}
            </h2>
            <p className="text-xs text-warm-gray-600 mt-1 line-clamp-2">
              {craft.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
