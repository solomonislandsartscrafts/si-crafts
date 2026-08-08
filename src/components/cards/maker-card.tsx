import Link from 'next/link';
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
      className="group flex h-full flex-col rounded-lg overflow-hidden border border-sand hover:border-ocean/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image area */}
      <div className="aspect-[3/4] relative bg-sand-light overflow-hidden">
        <SafeImage
          src={maker.portraitUrl}
          alt={`${maker.name}, ${craftName || 'maker'} from ${maker.village}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Info area — grey background, matches product cards */}
      <div className="flex flex-1 flex-col p-4 bg-warm-gray-100">
        <h3 className="font-heading text-sm font-semibold text-deep-blue group-hover:text-ocean transition-colors">
          {maker.name}
        </h3>
        <p className="text-xs text-warm-gray-600 mt-1">
          {maker.village}, {maker.province}
        </p>
        {craftName && (
          <p className="text-xs text-ocean mt-1">{craftName}</p>
        )}
      </div>
    </Link>
  );
}
