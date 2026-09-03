import type { Product, Maker } from '@/types';
import { ProductCard } from '@/components/cards/product-card';
import { posterGridClasses } from '@/components/cards/poster-card';

interface ProductGridProps {
  products: Product[];
  makers: Maker[];
  showPrice?: boolean;
}

export function ProductGrid({ products, makers, showPrice = false }: ProductGridProps) {
  return (
    /* Shared poster grid — 2-up, 3-up at lg, 4-up at xl. Same constant as
       StockistProductGrid so the catalogue never reflows when a stockist logs
       in, and the same as every other listing on the site. */
    <div role="list" aria-label="Products" className={posterGridClasses}>
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
