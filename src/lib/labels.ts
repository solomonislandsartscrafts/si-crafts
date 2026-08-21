/**
 * Display labels for the free-text category fields on a product.
 *
 * `materialCategory` and `productType` are stored as lowercase slugs
 * ("bush-twine", "bags") because they are used for filtering and grouping.
 * Those slugs must not reach the page unaltered: a slug reads as a leaked
 * database field, and a plural type is wrong when describing one piece —
 * a single item's type is "Bag", not "Bags".
 */

/** Types that are already singular or have no plural form. */
const UNCOUNTABLE = new Set(['jewellery', 'shell money']);

/**
 * Best-effort singular form of a product type.
 *
 * Covers the regular English cases rather than the full irregular set, so a
 * new type added in the admin reads correctly without a code change. Add to
 * UNCOUNTABLE for anything that has no singular form.
 */
function singularise(word: string): string {
  if (UNCOUNTABLE.has(word)) return word;
  // "posies" -> "posy"
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  // "brooches" -> "brooch", "glasses" -> "glass", "boxes" -> "box".
  // Note "ss" but not a bare "s": "purses" belongs to the rule below, since
  // dropping "es" would give "purs".
  if (/(ss|ch|sh|x|z)es$/.test(word)) return word.slice(0, -2);
  // "bags" -> "bag", "purses" -> "purse". Words already ending in "ss", "us"
  // or "is" are left alone.
  if (word.endsWith('s') && !/(ss|us|is)$/.test(word)) return word.slice(0, -1);
  return word;
}

/** Slug to readable text: "bush-twine" -> "bush twine". */
function deslugify(slug: string): string {
  return slug.replace(/-/g, ' ').trim();
}

/**
 * Material of a single piece, e.g. "bush-twine" -> "bush twine".
 * Pair with Tailwind's `capitalize` for sentence case.
 */
export function materialLabel(materialCategory: string): string {
  return deslugify(materialCategory);
}

/**
 * Type of a single piece, singular, e.g. "bags" -> "bag", "purses" -> "purse".
 * Pair with Tailwind's `capitalize` for sentence case.
 */
export function productTypeLabel(productType: string): string {
  return singularise(deslugify(productType));
}
