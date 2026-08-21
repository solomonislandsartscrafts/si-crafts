import type { Product, Maker } from '@/types';
import { StockistProductCard } from './stockist-product-card';

interface StockistProductGridProps {
  products: Product[];
  makers: Maker[];
}

export function StockistProductGrid({ products, makers }: StockistProductGridProps) {
  return (
    /* Grid config must match ProductGrid, otherwise the catalogue reflows the
       moment a stockist logs in. */
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => {
        const maker = makers.find((m) => m.id === product.makerId);
        return (
          <StockistProductCard
            key={product.id}
            product={product}
            makerName={maker?.name}
          />
        );
      })}
    </div>
  );
}
