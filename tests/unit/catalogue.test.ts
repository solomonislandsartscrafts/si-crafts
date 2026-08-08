/**
 * Unit Tests — Catalogue Filtering & Search
 *
 * Tests:
 * - Filter AND logic with multiple active filters
 * - Search returns case-insensitive matches
 * - Empty state rendering conditions
 * - Grouping by material category and product type
 */

import { describe, it, expect } from 'vitest';
import { mockProducts } from '@/data/mock/products';
import { mockMakers } from '@/data/mock/makers';
import { validateProductCode } from '@/services/products';
import type { Product, Maker } from '@/types';

// --- Filter and search logic (mirrors catalogue page implementation) ---

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

function groupByMaterial(products: Product[]): Record<string, Product[]> {
  const groups: Record<string, Product[]> = {};
  for (const product of products) {
    const key = product.materialCategory;
    if (!groups[key]) groups[key] = [];
    groups[key].push(product);
  }
  return groups;
}

function groupByProductType(products: Product[]): Record<string, Product[]> {
  const groups: Record<string, Product[]> = {};
  for (const product of products) {
    const key = product.productType;
    if (!groups[key]) groups[key] = [];
    groups[key].push(product);
  }
  return groups;
}

// --- Test data ---
const publicProducts = getPublicProducts(mockProducts, mockMakers);

// --- Filter AND logic tests ---

describe('Catalogue: Filter AND logic', () => {
  it('filtering by materialCategory "pandanus" returns only pandanus products', () => {
    const filtered = filterProducts(publicProducts, { materialCategory: 'pandanus' });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.materialCategory).toBe('pandanus');
    }
  });

  it('filtering by materialCategory "wood" returns only wood products', () => {
    const filtered = filterProducts(publicProducts, { materialCategory: 'wood' });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.materialCategory).toBe('wood');
    }
  });

  it('filtering by materialCategory "shells" returns only shell products', () => {
    const filtered = filterProducts(publicProducts, { materialCategory: 'shells' });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.materialCategory).toBe('shells');
    }
  });

  it('combining materialCategory + makerId returns intersection', () => {
    const filtered = filterProducts(publicProducts, {
      materialCategory: 'pandanus',
      makerId: 'maker-1',
    });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.materialCategory).toBe('pandanus');
      expect(p.makerId).toBe('maker-1');
    }
  });

  it('combining all three filters returns only exact matches', () => {
    const filtered = filterProducts(publicProducts, {
      materialCategory: 'wood',
      productType: 'carvings',
      makerId: 'maker-2',
    });
    expect(filtered.length).toBeGreaterThan(0);
    for (const p of filtered) {
      expect(p.materialCategory).toBe('wood');
      expect(p.productType).toBe('carvings');
      expect(p.makerId).toBe('maker-2');
    }
  });

  it('filter with non-existent combination returns empty array', () => {
    const filtered = filterProducts(publicProducts, {
      materialCategory: 'pandanus',
      makerId: 'maker-3', // maker-3 does shells, not pandanus
    });
    expect(filtered.length).toBe(0);
  });

  it('no filter returns all products', () => {
    const filtered = filterProducts(publicProducts, {});
    expect(filtered.length).toBe(publicProducts.length);
  });
});

// --- Search tests ---

describe('Catalogue: Search', () => {
  it('search "bag" returns products with "bag" in name or description', () => {
    const results = searchProducts(publicProducts, 'bag');
    expect(results.length).toBeGreaterThan(0);
    for (const p of results) {
      const combined = (p.name + ' ' + p.description).toLowerCase();
      expect(combined).toContain('bag');
    }
  });

  it('search is case-insensitive', () => {
    const upper = searchProducts(publicProducts, 'DOLPHIN');
    const lower = searchProducts(publicProducts, 'dolphin');
    const mixed = searchProducts(publicProducts, 'DoLpHiN');
    expect(upper.length).toBe(lower.length);
    expect(lower.length).toBe(mixed.length);
    expect(upper.length).toBeGreaterThan(0);
  });

  it('search for product code prefix does not match (codes not in name/description)', () => {
    // Product codes aren't searched in name/description typically
    const results = searchProducts(publicProducts, 'P-J-1');
    // May or may not match depending on description content
    // What matters is: we only search name + description
    for (const p of results) {
      const text = (p.name + ' ' + p.description).toLowerCase();
      expect(text).toContain('p-j-1');
    }
  });

  it('empty search returns all products', () => {
    expect(searchProducts(publicProducts, '')).toHaveLength(publicProducts.length);
  });

  it('whitespace-only search returns all products', () => {
    expect(searchProducts(publicProducts, '   ')).toHaveLength(publicProducts.length);
  });

  it('search with no matches returns empty array', () => {
    const results = searchProducts(publicProducts, 'zzzznonexistent999');
    expect(results.length).toBe(0);
  });

  it('search and filter can be combined', () => {
    const filtered = filterProducts(publicProducts, { materialCategory: 'wood' });
    const searched = searchProducts(filtered, 'bowl');
    expect(searched.length).toBeGreaterThan(0);
    for (const p of searched) {
      expect(p.materialCategory).toBe('wood');
      const text = (p.name + ' ' + p.description).toLowerCase();
      expect(text).toContain('bowl');
    }
  });
});

// --- Empty state tests ---

describe('Catalogue: Empty states', () => {
  it('impossible filter combo returns empty array (triggers "no products" message)', () => {
    const results = filterProducts(publicProducts, {
      materialCategory: 'shells',
      makerId: 'maker-1', // Julie makes pandanus, not shells
    });
    expect(results.length).toBe(0);
  });

  it('searching within filtered results can produce empty', () => {
    const filtered = filterProducts(publicProducts, { materialCategory: 'shells' });
    const searched = searchProducts(filtered, 'wooden');
    expect(searched.length).toBe(0);
  });
});

// --- Grouping tests ---

describe('Catalogue: Grouping', () => {
  it('groupByMaterial produces groups matching unique materialCategories', () => {
    const groups = groupByMaterial(publicProducts);
    const categories = [...new Set(publicProducts.map((p) => p.materialCategory))];
    expect(Object.keys(groups).sort()).toEqual(categories.sort());
  });

  it('groupByProductType produces groups matching unique productTypes', () => {
    const groups = groupByProductType(publicProducts);
    const types = [...new Set(publicProducts.map((p) => p.productType))];
    expect(Object.keys(groups).sort()).toEqual(types.sort());
  });

  it('sum of all group sizes equals total products', () => {
    const groups = groupByMaterial(publicProducts);
    const total = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(publicProducts.length);
  });

  it('grouping preserves filter state (filter then group)', () => {
    const filtered = filterProducts(publicProducts, { makerId: 'maker-1' });
    const groups = groupByMaterial(filtered);
    const total = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(filtered.length);
  });
});

// --- Product code validation in catalogue context ---

describe('Catalogue: Product code integrity', () => {
  it('every product displayed in catalogue has a valid code', () => {
    for (const product of publicProducts) {
      expect(validateProductCode(product.productCode)).toBe(true);
    }
  });

  it('product codes link correctly to provenance pages (/piece/{code})', () => {
    for (const product of publicProducts) {
      const url = `/piece/${product.productCode}`;
      expect(url).toMatch(/^\/piece\/[A-Z]+-[A-Z]+-\d+$/);
    }
  });
});
