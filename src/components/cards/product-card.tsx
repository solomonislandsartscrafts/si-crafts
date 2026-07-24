import Link from 'next/link';
import Image from 'next/image';
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
      className="group block rounded-lg overflow-hidden bg-card-bg shadow-card hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <div className="aspect-square relative bg-sand-light bg-weave-pattern">
        {product.imageUrls.length > 0 ? (
          <Image
            src={product.imageUrls[0]}
            alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand">
            <span className="text-warm-gray-400 text-sm">Image coming soon</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-sm font-semibold text-deep-blue group-hover:text-ocean transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray-600">
          <span className="capitalize">{product.materialCategory}</span>
          <span>·</span>
          <span className="capitalize">{product.productType}</span>
        </div>
        {makerName && (
          <p className="text-xs text-ocean mt-1">by {makerName}</p>
        )}
        {showPrice && (
          <p className="text-sm font-semibold text-deep-blue mt-2">
            {formatPrice(product.wholesalePrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
