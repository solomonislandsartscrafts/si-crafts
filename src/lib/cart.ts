/**
 * Shopping cart utilities for wholesale orders.
 * 
 * The cart is stored in localStorage and persists across sessions. Orders are
 * "expressions of interest" rather than live transactions — no payment gateway
 * integration, just a wholesale order request form.
 * 
 * Emits a "cart-updated" custom event on window whenever the cart changes, so
 * the cart badge and other UI elements can react without polling.
 */

import type { CartItem } from '@/types';

/** localStorage key where the cart is persisted. */
const CART_KEY = 'si_crafts_cart';

/**
 * Get the current cart from localStorage.
 * 
 * Returns empty array if cart doesn't exist or can't be parsed. Safe to call
 * during SSR (returns empty array on server).
 * 
 * @returns CartItem[] - Current cart items, or empty array
 * 
 * @example
 * ```tsx
 * const cart = getCart();
 * const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
 * ```
 */
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

/**
 * Save cart to localStorage and emit "cart-updated" event.
 * 
 * The event fires even if the cart didn't change, so listeners can always
 * re-read without tracking state themselves. Used internally by all mutation
 * functions; prefer calling those over saveCart directly.
 * 
 * @param items - Cart items to save
 * 
 * @example
 * ```tsx
 * // Listen for cart changes
 * useEffect(() => {
 *   const handleUpdate = () => setCart(getCart());
 *   window.addEventListener('cart-updated', handleUpdate);
 *   return () => window.removeEventListener('cart-updated', handleUpdate);
 * }, []);
 * ```
 */
export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // Dispatch custom event so UI (e.g. cart badge) updates instantly
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

/**
 * Add a product to the cart, or increase quantity if it's already there.
 * 
 * Quantities are capped at 999 per line item. If the product already exists,
 * notes are appended with semicolon separator rather than replaced.
 * 
 * @param item - Product details (excludes quantity, which is separate param)
 * @param quantity - How many to add (default: 1)
 * @returns CartItem[] - Updated cart
 * 
 * @example
 * ```tsx
 * const updated = addToCart({
 *   productId: product.id,
 *   productCode: product.productCode,
 *   productName: product.name,
 *   unitPrice: product.wholesalePrice,
 *   note: 'Rush order',
 * }, 5);
 * ```
 */
export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity = Math.min(999, existing.quantity + quantity);
    // Append note if provided
    if (item.note) {
      existing.note = existing.note ? `${existing.note}; ${item.note}` : item.note;
    }
  } else {
    cart.push({ ...item, quantity: Math.min(999, Math.max(1, quantity)) });
  }
  saveCart(cart);
  return cart;
}

/**
 * Update the quantity of an existing cart item.
 * 
 * Quantity is clamped between 1 and 999. To remove an item, use removeFromCart
 * instead — a quantity of 0 here will be raised to 1.
 * 
 * @param productId - Product ID to update
 * @param quantity - New quantity (clamped to 1–999)
 * @returns CartItem[] - Updated cart
 */
export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.min(999, Math.max(1, quantity));
  }
  saveCart(cart);
  return cart;
}

/**
 * Update the note on an existing cart item.
 * 
 * Notes are free-text fields for order-specific instructions (e.g. "Rush
 * delivery", "Gift wrapping required"). An empty string clears the note.
 * 
 * @param productId - Product ID to update
 * @param note - New note text
 * @returns CartItem[] - Updated cart
 */
export function updateNote(productId: string, note: string): CartItem[] {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.note = note;
  }
  saveCart(cart);
  return cart;
}

/**
 * Remove a product from the cart completely.
 * 
 * @param productId - Product ID to remove
 * @returns CartItem[] - Updated cart
 */
export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((i) => i.productId !== productId);
  saveCart(cart);
  return cart;
}

/**
 * Clear the entire cart (remove all items).
 * 
 * Used after a successful order submission. Emits "cart-updated" event.
 * 
 * @example
 * ```tsx
 * // After order confirmed
 * clearCart();
 * toast('Order submitted! Your cart has been cleared.');
 * ```
 */
export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

/**
 * Calculate the total price of all items in the cart.
 * 
 * Sum of (quantity × unitPrice) for each item, rounded to 2 decimal places.
 * Returns a number, not a formatted string — use formatPrice() for display.
 * 
 * @param items - Cart items to total
 * @returns number - Total price in AUD
 * 
 * @example
 * ```tsx
 * const total = getCartTotal(cart);
 * if (total >= GST_THRESHOLD) {
 *   toast('Order exceeds A$1,000 — GST applies');
 * }
 * ```
 */
export function getCartTotal(items: CartItem[]): number {
  return Number(items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2));
}

/**
 * Australian GST threshold (A$1,000).
 * 
 * Orders at or above this amount require the buyer to pay GST. The cart shows
 * a warning when the threshold is reached. This is a reminder, not enforcement
 * — the backend and buyer handle GST separately.
 */
export const GST_THRESHOLD = 1000;
