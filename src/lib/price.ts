/**
 * Price utility.
 *
 * All prices are stored and displayed in AUD. No conversion is needed — the
 * wholesale price entered by admins IS the AUD price charged to stockists.
 *
 * `formatPrice` is the ONLY way to render a price. The cart used to interpolate
 * a raw number (`A${sbdToAud(x)}`), which dropped cents, so the same item read
 * "A$48.00" on its card and "A$48" in the cart. Always use formatPrice.
 */

/**
 * Format a price as "A$X.XX", with thousands separators above 999
 * (e.g. "A$1,250.00"). The single source of truth for price display.
 *
 * Grouping matters here: the GST threshold notice refers to "A$1,000", so
 * totals near that figure need to be readable at a glance.
 */
export function formatPrice(price: number): string {
  return `A$${price.toLocaleString('en-AU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
