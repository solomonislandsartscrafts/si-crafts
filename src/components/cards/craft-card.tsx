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
      className="group flex h-full flex-col rounded-lg overflow-hidden bg-card-bg shadow-card hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <div className="aspect-[3/2] relative bg-sand-light bg-weave-pattern">
        <SafeImage
          src={craft.processImageUrls[0] || null}
          alt={`${craft.name} process`}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading font-semibold text-deep-blue group-hover:text-ocean transition-colors">
          {craft.name}
        </h3>
        <p className="text-sm text-warm-gray-600 mt-1 line-clamp-2">
          {craft.description}
        </p>
      </div>
    </Link>
  );
}
