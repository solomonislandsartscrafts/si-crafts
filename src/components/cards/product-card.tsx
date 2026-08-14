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
      className="group block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image area */}
      <div className="aspect-square relative bg-white overflow-hidden">
        <SafeImage
          src={product.imageUrls[0] || null}
          alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      {/* Info bar — subtle grey background */}
      <div className="bg-warm-gray-100 p-3 sm:p-4">
        <h3 className="font-heading text-sm sm:text-base font-semibold text-deep-blue leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray-600">
          <span className="capitalize">{product.materialCategory}</span>
          <span>·</span>
          <span className="capitalize">{product.productType}</span>
        </div>
        {makerName && (
          <p className="text-xs text-warm-gray-600 mt-1">by {makerName}</p>
        )}
        {showPrice && (
          <p className="text-sm font-semibold text-deep-blue mt-1">
            {formatPrice(product.wholesalePrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
