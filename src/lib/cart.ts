import type { CartItem } from '@/types';

const CART_KEY = 'si_crafts_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // Dispatch custom event so UI (e.g. cart badge) updates instantly
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

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

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.quantity = Math.min(999, Math.max(1, quantity));
  }
  saveCart(cart);
  return cart;
}

export function updateNote(productId: string, note: string): CartItem[] {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    item.note = note;
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((i) => i.productId !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function getCartTotal(items: CartItem[]): number {
  return Number(items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2));
}

export const GST_THRESHOLD = 1000;
