import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/price';

interface ProductCardProps {
  product: Product;
  makerName?: string;
  showPrice?: boolean;
}

export function ProductCard({ product, makerName, showPrice = false }: ProductCardProps) {
  return (
    <Link
      href={`/piece/${product.productCode}`}
      className="group flex flex-col h-full w-full overflow-hidden rounded-lg bg-card-bg shadow-card hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image area. White well, no inset: product photos arrive at mixed
          aspect ratios, so object-contain always leaves some empty space in the
          square. On a grey well that space read as a visible frame around every
          photo; white makes it disappear into the card instead.
          Deliberately still object-contain — cropping to fill would cut the
          edges off handles, spouts and weave borders that buyers need to see. */}
      <div className="aspect-square relative bg-card-bg overflow-hidden">
        <SafeImage
          src={product.imageUrls[0] || null}
          alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      {/* Info bar. White like every other card — this was bg-warm-gray-100,
          the only card on the site with a grey footer. */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-heading text-base font-semibold text-deep-blue leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-warm-gray-600">
          <span className="capitalize">{product.materialCategory}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{product.productType}</span>
        </div>
        {makerName && (
          <p className="text-sm text-warm-gray-600 mt-1">by {makerName}</p>
        )}
        {showPrice && (
          <p className="text-base font-semibold text-deep-blue mt-1">
            {formatPrice(product.wholesalePrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
