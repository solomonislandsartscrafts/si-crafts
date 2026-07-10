import Link from 'next/link';
import Image from 'next/image';
import type { Maker } from '@/types';

interface MakerCardProps {
  maker: Maker;
  craftName?: string;
}

export function MakerCard({ maker, craftName }: MakerCardProps) {
  return (
    <Link
      href={`/maker/${maker.slug}`}
      className="group block rounded-lg overflow-hidden bg-card-bg shadow-card hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <div className="aspect-[3/4] relative bg-sand-light bg-weave-pattern">
        {maker.portraitUrl ? (
          <Image
            src={maker.portraitUrl}
            alt={`${maker.name}, ${craftName || 'maker'} from ${maker.village}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand">
            <span className="text-warm-gray-400 text-sm">Photo coming soon</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">
          {maker.name}
        </h3>
        <p className="text-sm text-warm-gray-600 mt-1">
          {maker.village}, {maker.province}
        </p>
        {craftName && (
          <p className="text-xs text-ocean mt-1">{craftName}</p>
        )}
      </div>
    </Link>
  );
}
