import type { Product } from '@/types';
import { formatPrice } from '@/lib/price';
import { materialLabel } from '@/lib/labels';
import {
  PosterCard,
  posterTitleClasses,
  posterBodyClasses,
} from '@/components/cards/poster-card';

interface ProductCardProps {
  product: Product;
  makerName?: string;
  showPrice?: boolean;
}

/**
 * Public catalogue tile — image-forward: a portrait frame carries the photo,
 * the caption sits below. The photo is the point of a wholesale catalogue (a
 * buyer assesses weave, finish and colour), so it leads. Composes the shared
 * PosterCard so it stays identical to every other listing on the site.
 *
 * The material pill sits on the image (top-right), so the grid doubles as a
 * visual index of craft type without a separate line of meta.
 */
export function ProductCard({ product, makerName, showPrice = false }: ProductCardProps) {
  return (
    <PosterCard
      href={`/piece/${product.productCode}`}
      src={product.imageUrls[0] || null}
      alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
      fit="contain"
      pill={materialLabel(product.materialCategory)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
    >
      <h3 className={`${posterTitleClasses} line-clamp-2`}>{product.name}</h3>
      {/* Body size, not the 14px meta size. The maker's name IS the provenance
          on a product tile, and MakerCard already sets the same information
          (village, province) at 16px on the grounds that provenance is the point
          of the site. Setting it as a footnote here and as content there was the
          same fact demoted on the card where a buyer is most likely forming an
          opinion about it. */}
      {makerName && <p className={`mt-2xs ${posterBodyClasses}`}>by {makerName}</p>}
      {showPrice && (
        <p className="mt-2xs font-heading text-base font-semibold text-deep-blue">
          {formatPrice(product.wholesalePrice)}
        </p>
      )}
    </PosterCard>
  );
}
