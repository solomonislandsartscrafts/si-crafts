import Link from 'next/link';
import Image from 'next/image';
import type { Craft } from '@/types';

interface CraftCardProps {
  craft: Craft;
}

export function CraftCard({ craft }: CraftCardProps) {
  return (
    <Link
      href={`/craft/${craft.slug}`}
      className="group block rounded-lg overflow-hidden bg-card-bg shadow-card hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <div className="aspect-[16/9] relative bg-sand-light bg-weave-pattern">
        {craft.processImageUrls.length > 0 ? (
          <Image
            src={craft.processImageUrls[0]}
            alt={`${craft.name} process`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand">
            <span className="text-warm-gray-400 text-sm">Image coming soon</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">
          {craft.name}
        </h3>
        <p className="text-sm text-warm-gray-600 mt-1 line-clamp-2">
          {craft.description.slice(0, 120)}...
        </p>
      </div>
    </Link>
  );
}
