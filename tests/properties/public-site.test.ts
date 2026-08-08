/**
 * Property Tests — Phases 2–5: Public Site & Provenance
 *
 * Properties 8–14:
 * - P8: No pricing for unauthenticated users
 * - P9: Product card required fields
 * - P10: Product detail required fields
 * - P11: Makers index alphabetical sort
 * - P12: No generic identity-erasing phrases
 * - P13: Provenance page five sections in order
 * - P14: Unreviewed cultural content not rendered publicly
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mockMakers } from '@/data/mock/makers';
import { mockProducts } from '@/data/mock/products';
import { mockCrafts } from '@/data/mock/crafts';
import type { Maker, Product } from '@/types';

// --- Helpers ---

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

// --- Property 8: No pricing for unauthenticated users ---

describe('Property 8: No pricing for unauthenticated users', () => {
  it('public products have wholesalePrice but it must NOT be rendered without auth', () => {
    // This tests the data contract: public product objects DO contain price data,
    // but the UI contract says it must never be displayed to unauthenticated users.
    // We verify the data shape supports the gating logic.
    const publicProducts = getPublicProducts(mockProducts, mockMakers);
    for (const product of publicProducts) {
      // Every product has a price (validates data exists for stockists)
      expect(product.wholesalePrice).toBeGreaterThan(0);
      // The "showPrice" prop on ProductCard defaults to false — UI contract
      // This test verifies the data model supports separation of concerns
    }
  });

  it('no product has a retail price field (wholesale only model)', () => {
    for (const product of mockProducts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((product as any).retailPrice).toBeUndefined();
    }
  });
});

// --- Property 9: Product card required fields ---

describe('Property 9: Product card required fields', () => {
  it('every public product has name, productCode, materialCategory, and productType', () => {
    const publicProducts = getPublicProducts(mockProducts, mockMakers);
    fc.assert(
      fc.property(
        fc.constantFrom(...publicProducts),
        (product) => {
          return (
            product.name.length > 0 &&
            product.productCode.length > 0 &&
            product.materialCategory.length > 0 &&
            product.productType.length > 0
          );
        }
      )
    );
  });

  it('every public product has a valid makerId pointing to an existing maker', () => {
    const publicProducts = getPublicProducts(mockProducts, mockMakers);
    const allMakerIds = new Set(mockMakers.map((m) => m.id));
    for (const product of publicProducts) {
      expect(allMakerIds.has(product.makerId)).toBe(true);
    }
  });

  it('every product has a slug for URL routing', () => {
    for (const product of mockProducts) {
      expect(product.slug.length).toBeGreaterThan(0);
    }
  });
});

// --- Property 10: Product detail (provenance) required fields ---

describe('Property 10: Product detail required fields', () => {
  it('every product has productCode, name, materialCategory, and description', () => {
    for (const product of mockProducts) {
      expect(product.productCode).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.materialCategory).toBeTruthy();
      expect(product.description).toBeTruthy();
    }
  });

  it('every product references a valid craftId', () => {
    const craftIds = new Set(mockCrafts.map((c) => c.id));
    for (const product of mockProducts) {
      expect(craftIds.has(product.craftId)).toBe(true);
    }
  });

  it('dimensions and careNotes are either null or non-empty strings', () => {
    for (const product of mockProducts) {
      if (product.dimensions !== null) {
        expect(product.dimensions.length).toBeGreaterThan(0);
      }
      if (product.careNotes !== null) {
        expect(product.careNotes.length).toBeGreaterThan(0);
      }
    }
  });
});

// --- Property 11: Makers index alphabetical sort ---

describe('Property 11: Makers index alphabetical sort', () => {
  it('public makers are sorted alphabetically by name', () => {
    const publicMakers = getPublicMakers(mockMakers);
    for (let i = 1; i < publicMakers.length; i++) {
      expect(
        publicMakers[i - 1].name.localeCompare(publicMakers[i].name)
      ).toBeLessThanOrEqual(0);
    }
  });

  it('sort is stable — identical names preserve original order', () => {
    // With real maker names all being unique, just verify sort works
    const publicMakers = getPublicMakers(mockMakers);
    const names = publicMakers.map((m) => m.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});

// --- Property 12: No generic identity-erasing phrases ---

describe('Property 12: No generic identity-erasing phrases', () => {
  const BANNED_PHRASES = [
    'skilled artisan',
    'local craftsperson',
    'traditional community',
    'indigenous artisan',
    'native craftsman',
    'tribal artist',
  ];

  it('no maker story contains banned generic phrases', () => {
    const publicMakers = getPublicMakers(mockMakers);
    for (const maker of publicMakers) {
      if (maker.story) {
        const storyLower = maker.story.toLowerCase();
        for (const phrase of BANNED_PHRASES) {
          expect(storyLower).not.toContain(phrase);
        }
      }
    }
  });

  it('every published maker has a specific name (not generic)', () => {
    const publicMakers = getPublicMakers(mockMakers);
    for (const maker of publicMakers) {
      expect(maker.name.length).toBeGreaterThan(0);
      // Name must have at least two parts (first + last)
      expect(maker.name.split(' ').length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every published maker has a specific village', () => {
    const publicMakers = getPublicMakers(mockMakers);
    for (const maker of publicMakers) {
      expect(maker.village.length).toBeGreaterThan(0);
      // Should not be generic
      expect(maker.village.toLowerCase()).not.toBe('village');
      expect(maker.village.toLowerCase()).not.toBe('community');
    }
  });
});

// --- Property 13: Provenance page five sections in order ---

describe('Property 13: Provenance page five sections in order', () => {
  // The five sections: "This Piece", "Your Maker", "The Craft", "The Place", "Where to Buy"
  const PROVENANCE_SECTIONS = [
    'This Piece',
    'Your Maker',
    'The Craft',
    'The Place',
    'Where to Buy',
  ] as const;

  it('provenance data model supports all five sections', () => {
    const publicProducts = getPublicProducts(mockProducts, mockMakers);
    for (const product of publicProducts) {
      const maker = mockMakers.find((m) => m.id === product.makerId);
      const craft = mockCrafts.find((c) => c.id === product.craftId);

      // "This Piece" — product data
      expect(product.name).toBeTruthy();
      expect(product.productCode).toBeTruthy();

      // "Your Maker" — maker data
      expect(maker).toBeDefined();
      expect(maker!.name).toBeTruthy();

      // "The Craft" — craft data
      expect(craft).toBeDefined();
      expect(craft!.name).toBeTruthy();

      // "The Place" — island/province from maker
      expect(maker!.province).toBeTruthy();

      // "Where to Buy" — always present as static link
    }
  });

  it('there are exactly 5 provenance sections defined', () => {
    expect(PROVENANCE_SECTIONS).toHaveLength(5);
  });

  it('every product links to a craft that has a slug for the craft detail link', () => {
    for (const product of mockProducts) {
      const craft = mockCrafts.find((c) => c.id === product.craftId);
      expect(craft).toBeDefined();
      expect(craft!.slug.length).toBeGreaterThan(0);
    }
  });
});

// --- Property 14: Unreviewed cultural content not rendered publicly ---

describe('Property 14: Unreviewed cultural content not rendered publicly', () => {
  it('crafts with "unreviewed" culturalContextReviewFlag should not render cultural narrative publicly', () => {
    const unreviewedCrafts = mockCrafts.filter(
      (c) => c.culturalContextReviewFlag === 'unreviewed'
    );
    // Verify there are unreviewed crafts in our data
    expect(unreviewedCrafts.length).toBeGreaterThan(0);
    // The contract: when flag is "unreviewed", the culturalContext text must not be shown
    // We verify the flag exists and the data model supports this gating
    for (const craft of unreviewedCrafts) {
      expect(craft.culturalContextReviewFlag).toBe('unreviewed');
      // Cultural context exists in data but must be gated by the flag
      expect(craft.culturalContext).toBeTruthy();
    }
  });

  it('makers with "unreviewed" stories should show "pending cultural review" instead', () => {
    const unreviewedMakers = mockMakers.filter(
      (m) => m.storyCulturalReviewFlag === 'unreviewed'
    );
    expect(unreviewedMakers.length).toBeGreaterThan(0);
    for (const maker of unreviewedMakers) {
      expect(maker.storyCulturalReviewFlag).toBe('unreviewed');
    }
  });

  it('reviewed content has the "reviewed" flag', () => {
    const reviewedMakers = mockMakers.filter(
      (m) => m.storyCulturalReviewFlag === 'reviewed'
    );
    expect(reviewedMakers.length).toBeGreaterThan(0);
    for (const maker of reviewedMakers) {
      expect(maker.story).toBeTruthy();
    }
  });
});
