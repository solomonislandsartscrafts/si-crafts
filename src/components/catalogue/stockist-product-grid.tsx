import type { Product, Maker } from '@/types';
import { StockistProductCard } from './stockist-product-card';

interface StockistProductGridProps {
  products: Product[];
  makers: Maker[];
}

export function StockistProductGrid({ products, makers }: StockistProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
