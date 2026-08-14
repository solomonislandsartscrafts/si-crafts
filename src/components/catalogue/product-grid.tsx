import type { Product, Maker } from '@/types';
import { ProductCard } from '@/components/cards/product-card';

interface ProductGridProps {
  products: Product[];
  makers: Maker[];
  showPrice?: boolean;
}

export function ProductGrid({ products, makers, showPrice = false }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      {products.map((product) => {
        const maker = makers.find((m) => m.id === product.makerId);
        return (
          <ProductCard
            key={product.id}
            product={product}
            makerName={maker?.name}
            showPrice={showPrice}
          />
        );
      })}
    </div>
  );
}
