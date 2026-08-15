import Link from 'next/link';
import { MapPin, Clock, Package } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import type { Maker } from '@/types';

interface MakerCardProps {
  maker: Maker;
  craftName?: string;
}

export function MakerCard({ maker, craftName }: MakerCardProps) {
  return (
    <Link
      href={`/maker/${maker.slug}`}
      className="group flex flex-col h-full overflow-hidden rounded-lg shadow-card hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image — 60% of card height */}
      <div className="relative w-full" style={{ flex: '0 0 60%' }}>
        <div className="aspect-[4/3] relative bg-sand-light overflow-hidden">
          <SafeImage
            src={maker.portraitUrl}
            alt={`${maker.name}, ${craftName || 'maker'} from ${maker.village}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Info — 40% of card */}
      <div className="flex flex-1 flex-col justify-between p-4 bg-white">
        <div>
          <h3 className="font-heading text-base sm:text-lg font-semibold text-deep-blue leading-tight">
            {maker.name}
          </h3>

          {/* Location */}
          <p className="flex items-center gap-1 text-xs text-warm-gray-600 mt-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {maker.village}, {maker.province}
          </p>

          {/* Meta details */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {maker.age && (
              <span className="text-xs text-warm-gray-400">
                Age {maker.age}
              </span>
            )}
            {maker.yearsActive && (
              <span className="flex items-center gap-0.5 text-xs text-warm-gray-400">
                <Clock className="w-3 h-3" />
                {maker.yearsActive} yrs experience
              </span>
            )}
            {maker.pieceCount && maker.pieceCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-warm-gray-400">
                <Package className="w-3 h-3" />
                {maker.pieceCount} {maker.pieceCount === 1 ? 'piece' : 'pieces'}
              </span>
            )}
          </div>

          {/* Craft badge */}
          {craftName && (
            <span className="inline-block mt-2 text-xs font-medium text-ocean bg-ocean/10 px-2 py-0.5 rounded">
              {craftName}
            </span>
          )}
        </div>

        {/* CTA */}
        <p className="text-sm font-medium text-ocean group-hover:text-ocean-dark transition-colors mt-3">
          View story →
        </p>
      </div>
    </Link>
  );
}
