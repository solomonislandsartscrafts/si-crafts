/**
 * Price conversion utility.
 * All prices are stored in SBD (Solomon Islands Dollars).
 * AUD equivalent is displayed for stockists.
 * Rate: 1 AUD = 5 SBD
 */

export const SBD_TO_AUD_RATE = 5; // 5 SBD = 1 AUD

/**
 * Format price as "A$X (SBD $Y)" — converts stored SBD to AUD
 */
export function formatPrice(sbdPrice: number): string {
  const sbd = Math.round(sbdPrice);
  const aud = Math.round(sbd / SBD_TO_AUD_RATE);
  return `A$${aud} (SBD $${sbd})`;
}

/**
 * Format just AUD price from stored SBD
 */
export function formatAud(sbdPrice: number): string {
  return `A$${Math.round(sbdPrice / SBD_TO_AUD_RATE)}`;
}

/**
 * Format just SBD price
 */
export function formatSbd(sbdPrice: number): string {
  return `SBD $${Math.round(sbdPrice)}`;
}

/**
 * Convert SBD to AUD
 */
export function sbdToAud(sbdPrice: number): number {
  return Math.round(sbdPrice / SBD_TO_AUD_RATE);
}

/**
 * Convert AUD to SBD
 */
export function audToSbd(audPrice: number): number {
  return Math.round(audPrice * SBD_TO_AUD_RATE);
}
