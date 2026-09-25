import type { Product, Maker } from '@/types';
import { ProductCard } from '@/components/cards/product-card';
import { posterGridClasses } from '@/components/cards/poster-card';

interface ProductGridProps {
  products: Product[];
  makers: Maker[];
  showPrice?: boolean;
  /**
   * Heading level for each card title. Defaults to `h3`. The public catalogue
   * is a flat grid directly under the page `h1` (no section headings), so it
   * passes `h2` to avoid an h1 → h3 skip. Left at `h3` where the grid sits under
   * an `h2` heading.
   */
  titleAs?: 'h2' | 'h3';
}

export function ProductGrid({ products, makers, showPrice = false, titleAs = 'h3' }: ProductGridProps) {
  return (
    /* Shared poster grid — 2-up, 3-up at lg, 4-up at xl. Same constant as
       StockistProductGrid so the catalogue never reflows when a stockist logs
       in, and the same as every other listing on the site. Spans the full
       content column (the `site-container` gutters) so the grid lines up with
       the page header and filter bar above it rather than sitting narrower. */
    <div
      role="list"
      aria-label="Products"
      className={posterGridClasses}
    >
      {products.map((product) => {
        const maker = makers.find((m) => m.id === product.makerId);
        return (
          <ProductCard
            key={product.id}
            product={product}
            makerName={maker?.name}
            makerLocation={maker?.province}
            showPrice={showPrice}
            titleAs={titleAs}
          />
        );
      })}
    </div>
  );
}
