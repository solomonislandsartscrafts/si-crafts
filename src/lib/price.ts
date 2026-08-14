/**
 * Price utility.
 * All prices are stored and displayed in AUD (Australian Dollars).
 * No currency conversion is needed — the wholesale price entered by
 * admins IS the AUD price charged to stockists.
 */

/**
 * Format price as "A$X.XX"
 */
export function formatPrice(price: number): string {
  return `A$${price.toFixed(2)}`;
}

/**
 * Format price as whole dollar "A$X" (no cents)
 */
export function formatAud(price: number): string {
  return `A$${Math.round(price)}`;
}

/**
 * Identity function — kept for backwards compatibility with any code
 * that previously converted SBD to AUD. Now a no-op since prices are AUD.
 */
export function sbdToAud(price: number): number {
  return price;
}

/**
 * Identity function — kept for backwards compatibility.
 */
export function audToSbd(price: number): number {
  return price;
}
