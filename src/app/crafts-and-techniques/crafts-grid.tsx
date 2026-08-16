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
          <div key={i} className="aspect-[4/5] bg-sand-light animate-pulse rounded" />
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
          className="group relative block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ocean"
        >
          <div className="aspect-[4/5] relative bg-sand-light overflow-hidden">
            <SafeImage
              src={craft.processImageUrls[0] || null}
              alt={craft.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <h2 className="font-heading text-sm sm:text-base font-semibold text-white leading-tight">
                {craft.name}
              </h2>
              <p className="text-xs text-white/80 mt-0.5 line-clamp-2">
                {craft.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
