import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import type { Craft } from '@/types';

/**
 * Craft card. Chrome matches ProductCard / MakerCard / ArticleCard: white
 * surface, shadow-card, rounded-lg, shadow deepening on hover.
 */
interface CraftCardProps {
  craft: Craft;
}

export function CraftCard({ craft }: CraftCardProps) {
  return (
    <Link
      href={`/craft/${craft.slug}`}
      className="group flex flex-col h-full w-full overflow-hidden rounded-lg bg-card-bg shadow-card hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image area — matches ProductCard: white well, no inset, so the
          letterboxing left by object-contain disappears into the card rather
          than framing the photo in grey. */}
      <div className="aspect-square relative bg-card-bg overflow-hidden">
        <SafeImage
          src={craft.processImageUrls[0] || null}
          alt={`${craft.name} process`}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-heading text-base font-semibold text-deep-blue leading-tight">
          {craft.name}
        </h3>
        <p className="text-sm text-warm-gray-600 mt-1 line-clamp-2">
          {craft.description}
        </p>
      </div>
    </Link>
  );
}
