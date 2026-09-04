import type { Product, Maker } from '@/types';
import { StockistProductCard } from './stockist-product-card';
import { posterGridClasses } from '@/components/cards/poster-card';

interface StockistProductGridProps {
  products: Product[];
  makers: Maker[];
}

export function StockistProductGrid({ products, makers }: StockistProductGridProps) {
  return (
    /* Shared poster grid — must match ProductGrid so the catalogue does not
       reflow the moment a stockist logs in. */
    <div role="list" aria-label="Products" className={posterGridClasses}>
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
