import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import type { Craft } from '@/types';

interface CraftCardProps {
  craft: Craft;
}

export function CraftCard({ craft }: CraftCardProps) {
  return (
    <Link
      href={`/craft/${craft.slug}`}
      className="group block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image area */}
      <div className="aspect-square relative bg-white overflow-hidden">
        <SafeImage
          src={craft.processImageUrls[0] || null}
          alt={`${craft.name} process`}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      {/* Info bar — subtle grey background */}
      <div className="bg-warm-gray-100 p-3 sm:p-4">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-deep-blue leading-tight">
          {craft.name}
        </h3>
        <p className="text-xs text-warm-gray-600 mt-1 line-clamp-2">
          {craft.description}
        </p>
      </div>
    </Link>
  );
}
