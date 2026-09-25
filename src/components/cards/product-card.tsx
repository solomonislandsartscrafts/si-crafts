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
  /**
   * Heading level for the card title. Defaults to `h3`, correct wherever the
   * grid sits under a section `h2` (homepage carousels, a maker/piece page's
   * "Other pieces" block). Pass `h2` on a flat listing page where the grid is
   * the first content under the page `h1` (the catalogue), so the document does
   * not skip h1 → h3 — the heading-order rule Lighthouse flags.
   */
  titleAs?: 'h2' | 'h3';
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
export function ProductCard({ product, makerName, makerLocation, showPrice = false, titleAs: TitleTag = 'h3' }: ProductCardProps) {
  return (
    <PosterCard
      href={`/piece/${product.productCode}`}
      src={product.imageUrls[0] || null}
      alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
      fit="contain"
      pill={materialLabel(product.materialCategory)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
    >
      {/* One line for the title, so the caption stays short and the whole card
          reads as close to square as the content allows. Clamped to one line
          keeps every card in a row the same height without reserving a second
          line's worth of empty space under short titles. */}
      <TitleTag className={`${posterTitleClasses} line-clamp-1`}>{product.name}</TitleTag>
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
      {/* Relationship-based spacing (systematic, not equal): the maker/place
          line is the piece's IDENTITY alongside the title, so it hugs the title
          at `mt-2xs` (8px) — the two read as one group. */}
      {makerName && (
        <p className="mt-2xs text-base leading-body text-warm-gray-600 line-clamp-1">
          by {makerName}
          {makerLocation && (
            <span className="text-warm-gray-600"> · {makerLocation}</span>
          )}
        </p>
      )}
      {/* The price / trade-pricing line is a DIFFERENT kind of information (the
          commercial status), so it steps away from the identity group at
          `mt-xs` (12px) rather than sitting the same 8px from the maker line as
          the maker line sits from the title. Unequal spacing groups title+maker
          and sets the price apart, instead of three evenly-stacked lines. */}
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
