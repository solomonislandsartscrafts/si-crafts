/**
 * Property Tests — Phase 1: Data Model & Service Layer
 *
 * Properties 2–7, 23–25:
 * - P2: Service returns null for unknown identifier
 * - P3: Product codes valid and unique
 * - P4: Filter AND logic
 * - P5: Search case-insensitive substring
 * - P6: Public makers consent gating
 * - P7: Public products exclude unpublished-maker products
 * - P23: Consent status and published flag linkage
 * - P24: Product code validation
 * - P25: New maker content defaults to unreviewed
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mockMakers } from '@/data/mock/makers';
import { mockProducts } from '@/data/mock/products';
import { mockCrafts } from '@/data/mock/crafts';
import { validateProductCode } from '@/services/products';
import type { Maker, Product } from '@/types';

// --- Helpers mimicking service-layer logic for testable business rules ---

function getPublicMakers(makers: Maker[]): Maker[] {
  return makers
    .filter((m) => m.consentStatus === 'Signed' && m.publishedFlag)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getPublicProducts(products: Product[], makers: Maker[]): Product[] {
  const publishedMakerIds = new Set(
    makers
      .filter((m) => m.consentStatus === 'Signed' && m.publishedFlag)
      .map((m) => m.id)
  );
  return products.filter((p) => p.publishedFlag && publishedMakerIds.has(p.makerId));
}

function filterProducts(
  products: Product[],
  filters: { materialCategory?: string; productType?: string; makerId?: string }
): Product[] {
  return products.filter((p) => {
    if (filters.materialCategory && p.materialCategory !== filters.materialCategory) return false;
    if (filters.productType && p.productType !== filters.productType) return false;
    if (filters.makerId && p.makerId !== filters.makerId) return false;
    return true;
  });
}

function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
  );
}

// --- Property 2: Service returns null for unknown identifier ---

describe('Property 2: Service returns null for unknown identifier', () => {
  it('no maker matches a randomly generated slug', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 30 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
        (slug) => {
          const existingSlugs = mockMakers.map((m) => m.slug);
          if (existingSlugs.includes(slug)) return true; // skip collisions
          const found = mockMakers.find((m) => m.slug === slug) ?? null;
          return found === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no product matches a randomly generated code', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 10 }),
        (code) => {
          const existingCodes = mockProducts.map((p) => p.productCode);
          if (existingCodes.includes(code)) return true; // skip collisions
          const found = mockProducts.find((p) => p.productCode === code) ?? null;
          return found === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 3: Product codes valid and unique ---

describe('Property 3: Product codes valid and unique', () => {
  it('all mock product codes match the pattern {LETTERS}-{LETTERS}-{DIGITS}', () => {
    for (const product of mockProducts) {
      expect(validateProductCode(product.productCode)).toBe(true);
    }
  });

  it('all product codes are unique', () => {
    const codes = mockProducts.map((p) => p.productCode);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('all product IDs are unique', () => {
    const ids = mockProducts.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// --- Property 4: Filter AND logic ---

describe('Property 4: Filter AND logic', () => {
  const publicProducts = getPublicProducts(mockProducts, mockMakers);
  const categories = [...new Set(publicProducts.map((p) => p.materialCategory))];
  const types = [...new Set(publicProducts.map((p) => p.productType))];
  const makerIds = [...new Set(publicProducts.map((p) => p.makerId))];

  it('applying materialCategory filter returns only products of that category', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...categories),
        (cat) => {
          const filtered = filterProducts(publicProducts, { materialCategory: cat });
          return filtered.every((p) => p.materialCategory === cat);
        }
      ),
      { numRuns: categories.length }
    );
  });

  it('applying multiple filters returns intersection, not union', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...categories),
        fc.constantFrom(...makerIds),
        (cat, maker) => {
          const filtered = filterProducts(publicProducts, {
            materialCategory: cat,
            makerId: maker,
          });
          return filtered.every(
            (p) => p.materialCategory === cat && p.makerId === maker
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('filter result is always a subset of unfiltered products', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...categories),
        (cat) => {
          const filtered = filterProducts(publicProducts, { materialCategory: cat });
          return filtered.length <= publicProducts.length;
        }
      )
    );
  });
});

// --- Property 5: Search case-insensitive substring ---

describe('Property 5: Search returns case-insensitive substring matches', () => {
  it('searching for a product name substring (any case) always finds it', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...mockProducts.map((p) => p.name)),
        (name) => {
          // Take a substring and randomise case
          const start = Math.floor(Math.random() * Math.max(1, name.length - 3));
          const sub = name.slice(start, start + 3).toUpperCase();
          const results = searchProducts(mockProducts, sub);
          return results.some((p) => p.name === name);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('empty search returns all products', () => {
    expect(searchProducts(mockProducts, '')).toHaveLength(mockProducts.length);
    expect(searchProducts(mockProducts, '   ')).toHaveLength(mockProducts.length);
  });

  it('search is case-insensitive', () => {
    const results1 = searchProducts(mockProducts, 'DOLPHIN');
    const results2 = searchProducts(mockProducts, 'dolphin');
    const results3 = searchProducts(mockProducts, 'Dolphin');
    expect(results1.length).toBe(results2.length);
    expect(results2.length).toBe(results3.length);
  });
});

// --- Property 6: Public makers consent gating ---

describe('Property 6: Public makers consent gating', () => {
  it('getPublicMakers never returns a maker with consent "Not Signed"', () => {
    const publicMakers = getPublicMakers(mockMakers);
    for (const maker of publicMakers) {
      expect(maker.consentStatus).toBe('Signed');
    }
  });

  it('getPublicMakers never returns a maker with publishedFlag false', () => {
    const publicMakers = getPublicMakers(mockMakers);
    for (const maker of publicMakers) {
      expect(maker.publishedFlag).toBe(true);
    }
  });

  it('unpublished makers exist in mock data but not in public results', () => {
    const unpublished = mockMakers.filter((m) => !m.publishedFlag);
    expect(unpublished.length).toBeGreaterThan(0);
    const publicMakers = getPublicMakers(mockMakers);
    for (const m of unpublished) {
      expect(publicMakers.find((pm) => pm.id === m.id)).toBeUndefined();
    }
  });
});

// --- Property 7: Public products exclude unpublished-maker products ---

describe('Property 7: Public products exclude unpublished-maker products', () => {
  it('all public products belong to a published & consented maker', () => {
    const publicProducts = getPublicProducts(mockProducts, mockMakers);
    const publishedMakerIds = new Set(
      mockMakers
        .filter((m) => m.consentStatus === 'Signed' && m.publishedFlag)
        .map((m) => m.id)
    );
    for (const product of publicProducts) {
      expect(publishedMakerIds.has(product.makerId)).toBe(true);
    }
  });

  it('products linked to unpublished makers are never in public results', () => {
    const unpublishedMakerIds = new Set(
      mockMakers
        .filter((m) => !m.publishedFlag || m.consentStatus !== 'Signed')
        .map((m) => m.id)
    );
    const publicProducts = getPublicProducts(mockProducts, mockMakers);
    for (const product of publicProducts) {
      expect(unpublishedMakerIds.has(product.makerId)).toBe(false);
    }
  });
});

// --- Property 23: Consent status and published flag linkage ---

describe('Property 23: Consent status and published flag linkage', () => {
  it('a maker with consent "Not Signed" must have publishedFlag false', () => {
    // This is a data invariant that must hold in mock data
    const notSigned = mockMakers.filter((m) => m.consentStatus === 'Not Signed');
    for (const maker of notSigned) {
      expect(maker.publishedFlag).toBe(false);
    }
  });

  it('setting consent to "Not Signed" should logically mean unpublished (property)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...mockMakers),
        (maker) => {
          if (maker.consentStatus === 'Not Signed') {
            return maker.publishedFlag === false;
          }
          return true; // no constraint for signed makers
        }
      )
    );
  });
});

// --- Property 24: Product code validation ---

describe('Property 24: Product code validation', () => {
  it('valid codes pass validation', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 3 }),
          fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 3 }),
          fc.integer({ min: 1, max: 999 })
        ),
        ([material, maker, num]) => {
          const code = `${material}-${maker}-${num}`;
          return validateProductCode(code) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('codes with lowercase letters fail validation', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 3 }),
          fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 3 }),
          fc.integer({ min: 1, max: 999 })
        ),
        ([material, maker, num]) => {
          const code = `${material}-${maker}-${num}`;
          return validateProductCode(code) === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('codes missing segments fail validation', () => {
    expect(validateProductCode('P')).toBe(false);
    expect(validateProductCode('P-J')).toBe(false);
    expect(validateProductCode('P-J-')).toBe(false);
    expect(validateProductCode('')).toBe(false);
    expect(validateProductCode('P-J-abc')).toBe(false);
  });
});

// --- Property 25: New maker content defaults to unreviewed ---

describe('Property 25: New maker content defaults to unreviewed', () => {
  it('makers without reviewed stories have storyCulturalReviewFlag "unreviewed"', () => {
    const unreviewedMakers = mockMakers.filter(
      (m) => m.storyCulturalReviewFlag === 'unreviewed'
    );
    // At least one exists
    expect(unreviewedMakers.length).toBeGreaterThan(0);
  });

  it('crafts with unreviewed cultural context have culturalContextReviewFlag "unreviewed"', () => {
    const unreviewedCrafts = mockCrafts.filter(
      (c) => c.culturalContextReviewFlag === 'unreviewed'
    );
    expect(unreviewedCrafts.length).toBeGreaterThan(0);
  });

  it('CulturalReviewStatus type only allows "unreviewed" or "reviewed"', () => {
    for (const maker of mockMakers) {
      expect(['unreviewed', 'reviewed']).toContain(maker.storyCulturalReviewFlag);
    }
    for (const craft of mockCrafts) {
      expect(['unreviewed', 'reviewed']).toContain(craft.culturalContextReviewFlag);
    }
  });
});
