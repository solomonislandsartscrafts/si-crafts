import type { Product } from '@/types';
import { formatPrice } from '@/lib/price';
import { materialLabel } from '@/lib/labels';
import {
  PosterCard,
  posterTitleClasses,
} from '@/components/cards/poster-card';

interface ProductCardProps {
  product: Product;
  makerName?: string;
  /**
   * The maker's place (village or province). Appended to the "by {maker}" line
   * so the card carries provenance — who AND where — not just a name. Optional:
   * a card with a name but no place simply shows the name.
   */
  makerLocation?: string;
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
export function ProductCard({ product, makerName, makerLocation, showPrice = false }: ProductCardProps) {
  return (
    <PosterCard
      href={`/piece/${product.productCode}`}
      src={product.imageUrls[0] || null}
      alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
      fit="contain"
      pill={materialLabel(product.materialCategory)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
    >
      {/* Reserve two lines for the title so a one-line title (e.g. "Shoulder
          Bag") does not sit shorter than a two-line one ("Clutch Purse
          (Small)"). Cards in a row then keep equal caption heights. */}
      <h3 className={`${posterTitleClasses} line-clamp-2 min-h-[3rem]`}>{product.name}</h3>
      {/* Body size, not the 14px meta size. The maker's name IS the provenance
          on a product tile, and MakerCard already sets the same information
          (village, province) at 16px on the grounds that provenance is the point
          of the site. Setting it as a footnote here and as content there was the
          same fact demoted on the card where a buyer is most likely forming an
          opinion about it.

          Clamped to ONE line: "Julie Mone · Guadalcanal Province" wrapped to two
          lines while "Peter Kera · Western Province" fit on one, which is what
          made the cards in a row sit at different heights. One line keeps every
          maker/place line the same height. */}
      {makerName && (
        <p className="mt-2xs text-base leading-body text-warm-gray-600 line-clamp-1">
          by {makerName}
          {makerLocation && (
            <span className="text-warm-gray-600"> · {makerLocation}</span>
          )}
        </p>
      )}
      {showPrice ? (
        <p className="mt-2xs font-heading text-base font-semibold text-deep-blue">
          {formatPrice(product.wholesalePrice)}
        </p>
      ) : (
        /* A quiet status label in the spot a price would sit — not an
           instruction. The "why" and the "sign in" action are said once in the
           note below the grid, so repeating "sign in for pricing" on every card
           was the same sentence three times on one screen. Muted so it reads as
           a category, not a price. */
        <p className="mt-2xs text-sm text-warm-gray-400">Trade pricing</p>
      )}
    </PosterCard>
  );
}
