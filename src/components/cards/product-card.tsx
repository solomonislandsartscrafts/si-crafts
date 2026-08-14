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
      className="group flex h-full flex-col rounded-lg overflow-hidden border border-sand hover:border-ocean/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      {/* Image area — white background */}
      <div className="aspect-square relative bg-white overflow-hidden">
        <SafeImage
          src={product.imageUrls[0] || null}
          alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      {/* Info area — deep blue caption like gallery cards */}
      <div className="flex flex-1 flex-col p-4 bg-deep-blue">
        <h3 className="font-heading text-sm font-semibold text-white group-hover:text-white/80 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
          <span className="capitalize">{product.materialCategory}</span>
          <span>·</span>
          <span className="capitalize">{product.productType}</span>
        </div>
        {makerName && (
          <p className="text-xs text-white/80 mt-1">by {makerName}</p>
        )}
        {showPrice && (
          <p className="text-sm font-semibold text-white mt-auto pt-2">
            {formatPrice(product.wholesalePrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
