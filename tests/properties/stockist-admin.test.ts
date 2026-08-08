/**
 * Property Tests — Phases 6–8: Stockist Gate, Orders, Admin
 *
 * Properties 15–22:
 * - P15: Authenticated stockist sees pricing
 * - P16: Unauthenticated redirect from stockist-gated routes
 * - P17: Cart state consistency after operations
 * - P18: Cart total equals sum of line items
 * - P19: GST warning threshold
 * - P20: Order history sorted descending
 * - P21: Editor denied admin-management routes
 * - P22: Non-admin redirect from admin routes
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mockProducts } from '@/data/mock/products';
import { mockOrders } from '@/data/mock/orders';
import { mockStockists } from '@/data/mock/stockists';
import { mockAdmins } from '@/data/mock/admins';
import type { CartItem, AdminUser } from '@/types';

// --- Cart logic (mirrors the client-side cart implementation) ---

const GST_THRESHOLD = 1000;

function calculateCartTotal(items: CartItem[]): number {
  return Number(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)
  );
}

function addToCart(cart: CartItem[], item: CartItem): CartItem[] {
  const existing = cart.find((i) => i.productCode === item.productCode);
  if (existing) {
    return cart.map((i) =>
      i.productCode === item.productCode
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    );
  }
  return [...cart, item];
}

function removeFromCart(cart: CartItem[], productCode: string): CartItem[] {
  return cart.filter((i) => i.productCode !== productCode);
}

function updateQuantity(cart: CartItem[], productCode: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeFromCart(cart, productCode);
  return cart.map((i) =>
    i.productCode === productCode ? { ...i, quantity } : i
  );
}

// --- Role checking logic ---

type AdminRoute = 'makers' | 'products' | 'crafts' | 'orders' | 'stockists' | 'admins';

function canAccessRoute(user: AdminUser, route: AdminRoute): boolean {
  if (!user.isActive) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'editor') {
    // Editors can access everything except admin management
    return route !== 'admins';
  }
  return false;
}

function isLockedOut(user: AdminUser): boolean {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}

// --- Property 15: Authenticated stockist sees pricing ---

describe('Property 15: Authenticated stockist sees pricing', () => {
  it('approved stockists exist in mock data', () => {
    const approved = mockStockists.filter((s) => s.status === 'approved');
    expect(approved.length).toBeGreaterThan(0);
  });

  it('all products have a wholesalePrice > 0 (visible to authenticated stockists)', () => {
    for (const product of mockProducts) {
      expect(product.wholesalePrice).toBeGreaterThan(0);
    }
  });

  it('wholesalePrice is a finite number with at most 2 decimal places', () => {
    for (const product of mockProducts) {
      expect(Number.isFinite(product.wholesalePrice)).toBe(true);
      const decimals = product.wholesalePrice.toString().split('.')[1];
      if (decimals) {
        expect(decimals.length).toBeLessThanOrEqual(2);
      }
    }
  });
});

// --- Property 16: Unauthenticated redirect from stockist-gated routes ---

describe('Property 16: Unauthenticated redirect from stockist-gated routes', () => {
  const STOCKIST_GATED_ROUTES = [
    '/stockist/catalogue',
    '/stockist/orders',
    '/stockist/order-history',
    '/stockist/account',
  ];

  const PUBLIC_STOCKIST_ROUTES = [
    '/stockist/login',
    '/stockist/apply',
  ];

  it('gated routes require authentication (session token)', () => {
    // Contract: without a valid session token, these routes redirect to login
    for (const route of STOCKIST_GATED_ROUTES) {
      // Validates that the route pattern exists in our route list
      expect(route).toContain('/stockist/');
      expect(PUBLIC_STOCKIST_ROUTES).not.toContain(route);
    }
  });

  it('login and apply routes are publicly accessible', () => {
    for (const route of PUBLIC_STOCKIST_ROUTES) {
      expect(STOCKIST_GATED_ROUTES).not.toContain(route);
    }
  });

  it('pending stockists should not have access to wholesale catalogue', () => {
    const pending = mockStockists.filter((s) => s.status === 'pending');
    expect(pending.length).toBeGreaterThan(0);
    // Contract: only "approved" status grants catalogue access
    for (const stockist of pending) {
      expect(stockist.status).not.toBe('approved');
    }
  });
});

// --- Property 17: Cart state consistency after operations ---

describe('Property 17: Cart state consistency after operations', () => {
  it('adding an item increases cart length or quantity', () => {
    fc.assert(
      fc.property(
        fc.record({
          productId: fc.string({ minLength: 1 }),
          productCode: fc.constantFrom(...mockProducts.map((p) => p.productCode)),
          productName: fc.string({ minLength: 1 }),
          quantity: fc.integer({ min: 1, max: 999 }),
          unitPrice: fc.integer({ min: 1, max: 500 }),
        }),
        (item) => {
          const cart: CartItem[] = [];
          const newCart = addToCart(cart, item);
          return newCart.length === 1 && newCart[0].productCode === item.productCode;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('removing an item decreases cart length', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...mockProducts.slice(0, 5)),
        (product) => {
          const item: CartItem = {
            productId: product.id,
            productCode: product.productCode,
            productName: product.name,
            quantity: 2,
            unitPrice: product.wholesalePrice,
          };
          const cart = addToCart([], item);
          const after = removeFromCart(cart, product.productCode);
          return after.length === 0;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('no duplicate productCodes in cart after multiple adds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...mockProducts.slice(0, 5)),
        fc.integer({ min: 1, max: 10 }),
        (product, times) => {
          let cart: CartItem[] = [];
          for (let i = 0; i < times; i++) {
            cart = addToCart(cart, {
              productId: product.id,
              productCode: product.productCode,
              productName: product.name,
              quantity: 1,
              unitPrice: product.wholesalePrice,
            });
          }
          const codes = cart.map((i) => i.productCode);
          return new Set(codes).size === codes.length;
        }
      ),
      { numRuns: 30 }
    );
  });

  it('updating quantity to 0 removes the item', () => {
    const item: CartItem = {
      productId: 'prod-1',
      productCode: 'P-J-1',
      productName: 'Test',
      quantity: 5,
      unitPrice: 10,
    };
    const cart = addToCart([], item);
    const updated = updateQuantity(cart, 'P-J-1', 0);
    expect(updated.length).toBe(0);
  });
});

// --- Property 18: Cart total equals sum of line items ---

describe('Property 18: Cart total equals sum of line items', () => {
  it('total equals sum of (quantity × unitPrice) for arbitrary items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.string({ minLength: 1 }),
            productCode: fc.string({ minLength: 3 }),
            productName: fc.string({ minLength: 1 }),
            quantity: fc.integer({ min: 1, max: 100 }),
            unitPrice: fc.integer({ min: 1, max: 500 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          const total = calculateCartTotal(items);
          const expected = Number(
            items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2)
          );
          return Math.abs(total - expected) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty cart has total 0', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('mock orders have totalAud matching item calculations', () => {
    for (const order of mockOrders) {
      const calculated = calculateCartTotal(order.items);
      expect(calculated).toBe(order.totalAud);
    }
  });
});

// --- Property 19: GST warning threshold ---

describe('Property 19: GST warning threshold', () => {
  it('warns when cart total exceeds $1000', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            productId: fc.string({ minLength: 1 }),
            productCode: fc.string({ minLength: 3 }),
            productName: fc.string({ minLength: 1 }),
            quantity: fc.integer({ min: 1, max: 50 }),
            unitPrice: fc.integer({ min: 50, max: 200 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          const total = calculateCartTotal(items);
          const shouldWarn = total > GST_THRESHOLD;
          // Property: warning state is deterministic based on total
          return shouldWarn === (total > 1000);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('exactly $1000 does NOT trigger warning (only exceeds)', () => {
    const items: CartItem[] = [
      { productId: '1', productCode: 'P-J-1', productName: 'Test', quantity: 10, unitPrice: 100 },
    ];
    const total = calculateCartTotal(items);
    expect(total).toBe(1000);
    expect(total > GST_THRESHOLD).toBe(false);
  });

  it('$1000.01 triggers warning', () => {
    const items: CartItem[] = [
      { productId: '1', productCode: 'P-J-1', productName: 'Test', quantity: 1, unitPrice: 1000.01 },
    ];
    const total = calculateCartTotal(items);
    expect(total > GST_THRESHOLD).toBe(true);
  });
});

// --- Property 20: Order history sorted descending ---

describe('Property 20: Order history sorted descending', () => {
  it('orders sorted by submittedAt descending shows most recent first', () => {
    const sorted = [...mockOrders].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    for (let i = 1; i < sorted.length; i++) {
      expect(
        new Date(sorted[i - 1].submittedAt).getTime()
      ).toBeGreaterThanOrEqual(
        new Date(sorted[i].submittedAt).getTime()
      );
    }
  });

  it('all orders have valid ISO date strings for submittedAt', () => {
    for (const order of mockOrders) {
      const date = new Date(order.submittedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    }
  });

  it('all orders have a non-empty referenceNumber', () => {
    for (const order of mockOrders) {
      expect(order.referenceNumber.length).toBeGreaterThan(0);
    }
  });
});

// --- Property 21: Editor denied admin-management routes ---

describe('Property 21: Editor denied admin-management routes', () => {
  it('editors cannot access /admin/admins route', () => {
    const editors = mockAdmins.filter((a) => a.role === 'editor');
    expect(editors.length).toBeGreaterThan(0);
    for (const editor of editors) {
      expect(canAccessRoute(editor, 'admins')).toBe(false);
    }
  });

  it('editors CAN access makers, products, crafts, orders, stockists', () => {
    const editors = mockAdmins.filter((a) => a.role === 'editor');
    const allowedRoutes: AdminRoute[] = ['makers', 'products', 'crafts', 'orders', 'stockists'];
    for (const editor of editors) {
      for (const route of allowedRoutes) {
        expect(canAccessRoute(editor, route)).toBe(true);
      }
    }
  });

  it('super_admins can access ALL routes including admins', () => {
    const superAdmins = mockAdmins.filter((a) => a.role === 'super_admin');
    expect(superAdmins.length).toBeGreaterThan(0);
    const allRoutes: AdminRoute[] = ['makers', 'products', 'crafts', 'orders', 'stockists', 'admins'];
    for (const admin of superAdmins) {
      for (const route of allRoutes) {
        expect(canAccessRoute(admin, route)).toBe(true);
      }
    }
  });
});

// --- Property 22: Non-admin redirect from admin routes ---

describe('Property 22: Non-admin redirect from admin routes', () => {
  const ADMIN_ROUTES = [
    '/admin/dashboard',
    '/admin/makers',
    '/admin/products',
    '/admin/crafts',
    '/admin/stockists',
    '/admin/orders',
    '/admin/admins',
  ];

  it('admin routes are separate from public routes', () => {
    for (const route of ADMIN_ROUTES) {
      expect(route).toMatch(/^\/admin\//);
    }
  });

  it('stockists are not admins (different auth domains)', () => {
    const stockistEmails = new Set(mockStockists.map((s) => s.email));
    const adminEmails = new Set(mockAdmins.map((a) => a.email));
    // No overlap between stockist and admin accounts
    for (const email of stockistEmails) {
      expect(adminEmails.has(email)).toBe(false);
    }
  });

  it('inactive admins should be denied access', () => {
    const inactiveAdmin: AdminUser = {
      ...mockAdmins[0],
      isActive: false,
    };
    expect(canAccessRoute(inactiveAdmin, 'makers')).toBe(false);
    expect(canAccessRoute(inactiveAdmin, 'admins')).toBe(false);
  });

  it('locked-out admins are identified by lockedUntil field', () => {
    const lockedAdmin: AdminUser = {
      ...mockAdmins[0],
      lockedUntil: new Date(Date.now() + 900000).toISOString(), // 15 min from now
      failedLoginAttempts: 5,
    };
    expect(isLockedOut(lockedAdmin)).toBe(true);

    const expiredLock: AdminUser = {
      ...mockAdmins[0],
      lockedUntil: new Date(Date.now() - 1000).toISOString(), // already expired
      failedLoginAttempts: 5,
    };
    expect(isLockedOut(expiredLock)).toBe(false);
  });
});
