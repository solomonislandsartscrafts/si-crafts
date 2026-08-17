'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';

interface CraftHeroImageProps {
  slug: string;
  name: string;
  /** Image URL known at build/server time (may be empty). */
  initialSrc: string | null;
}

/**
 * Craft hero image. Server-rendered craft data cannot see admin-uploaded
 * images because those URLs live in localStorage, so this re-fetches the
 * craft on the client where the merge can happen.
 */
export function CraftHeroImage({ slug, name, initialSrc }: CraftHeroImageProps) {
  const [src, setSrc] = useState<string | null>(initialSrc);

  useEffect(() => {
    // Only look for a locally-stored image if the server didn't supply one.
    if (initialSrc) return;

    let cancelled = false;
    async function load() {
      const { getCraftBySlug } = await import('@/services/crafts');
      const craft = await getCraftBySlug(slug);
      if (!cancelled && craft?.processImageUrls[0]) {
        setSrc(craft.processImageUrls[0]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug, initialSrc]);

  return (
    <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-sand-light">
      <SafeImage
        src={src}
        alt={`${name} process`}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
