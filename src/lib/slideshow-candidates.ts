import type { Product, Maker, Craft } from '@/types';

/**
 * Shared filters that determine which items are eligible slideshow candidates.
 * Used by both the homepage slide builder and the admin slideshow page so that
 * admin toggles reflect the actual items that can appear in the hero.
 */

/** Products eligible for the slideshow: published with at least one image. */
export function getSlideshowProductCandidates(products: Product[]): Product[] {
  return products.filter((p) => p.publishedFlag && p.imageUrls[0]);
}

/** Makers eligible for the slideshow: published with a portrait and age or yearsActive. */
export function getSlideshowMakerCandidates(makers: Maker[]): Maker[] {
  return makers.filter(
    (m) => m.publishedFlag && m.portraitUrl && (m.age || m.yearsActive)
  );
}

/** Crafts eligible for the slideshow: must have a process image. */
export function getSlideshowCraftCandidates(crafts: Craft[]): Craft[] {
  return crafts.filter((c) => !!c.processImageUrls[0]);
}
