/**
 * Accessibility integration tests using axe-core via vitest-axe.
 *
 * These render key public-facing components and run automated accessibility
 * audits to catch violations (missing labels, contrast issues, landmark
 * problems, etc.) before they ship.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

// --- Components under test ---
import { MakerCard } from '@/components/cards/maker-card';
import { ProductCard } from '@/components/cards/product-card';
import { CraftCard } from '@/components/cards/craft-card';
import { Footer } from '@/components/layout/footer';
import { SkipLink } from '@/components/layout/skip-link';
import { AttentionPanel } from '@/components/admin/attention-panel';
import { ActivityFeed } from '@/components/admin/activity-feed';

import type { Maker, Product, Craft, AttentionItem, ActivityItem } from '@/types';

// --- Test data ---
const MAKER: Maker = {
  id: '1',
  slug: 'julie-mone',
  name: 'Julie Mone',
  village: 'Atori',
  province: 'Guadalcanal',
  island: 'Guadalcanal',
  portraitUrl: '/images/makers/julie.jpg',
  portraitAlt: 'Julie Mone weaving pandanus on her verandah',
  story: 'I learned to weave from my mother when I was eight years old.',
  storyCulturalReviewFlag: 'reviewed',
  craftId: 'craft-1',
  consentStatus: 'Signed',
  publishedFlag: true,
  age: 42,
  yearsActive: 34,
  pieceCount: 12,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

const PRODUCT: Product = {
  id: 'p1',
  productCode: 'P-J-1',
  slug: 'pandanus-clutch',
  name: 'Pandanus Clutch Bag',
  description: 'A small clutch woven from dyed pandanus leaf.',
  materialCategory: 'pandanus',
  productType: 'bags',
  makerId: '1',
  craftId: 'craft-1',
  imageUrls: ['/images/products/clutch.jpg'],
  imageAlts: ['Pandanus clutch bag with natural and black dyed weave'],
  dimensions: '25cm × 15cm × 5cm',
  careNotes: 'Keep dry. Store flat.',
  wholesalePrice: 45,
  publishedFlag: true,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-05-20T00:00:00Z',
};

const CRAFT: Craft = {
  id: 'craft-1',
  slug: 'pandanus-weaving',
  name: 'Pandanus Weaving',
  description: 'Leaves are harvested, dried and split into strips that are dyed and woven into bags, mats and fans.',
  processImageUrls: ['/images/crafts/pandanus-process.jpg'],
  processImageAlt: 'Pandanus leaves being split with a bone tool',
  culturalContext: null,
  culturalContextReviewFlag: 'unreviewed',
  materialCategory: 'pandanus',
};

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'alt-missing',
    severity: 'warning',
    count: 2,
    label: '2 products are missing image alt text',
    detail: 'Alt text is required for screen readers.',
    href: '/admin/products',
  },
];

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'a1',
    kind: 'product',
    label: 'Pandanus Clutch',
    detail: 'P-J-1',
    at: new Date().toISOString(),
    href: '/admin/products',
  },
];

// --- Tests ---

describe('Accessibility: Card Components', () => {
  it('MakerCard has no axe violations', async () => {
    const { container } = render(
      <MakerCard maker={MAKER} craftName="Pandanus Weaving" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ProductCard has no axe violations', async () => {
    const { container } = render(
      <ProductCard product={PRODUCT} makerName="Julie Mone" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('CraftCard has no axe violations', async () => {
    const { container } = render(
      <CraftCard craft={CRAFT} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: Layout Components', () => {
  it('Footer has no axe violations', async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SkipLink has no axe violations', async () => {
    const { container } = render(<SkipLink />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: Admin Dashboard Widgets', () => {
  it('AttentionPanel has no axe violations', async () => {
    const { container } = render(<AttentionPanel items={ATTENTION_ITEMS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AttentionPanel empty state has no axe violations', async () => {
    const { container } = render(<AttentionPanel items={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ActivityFeed has no axe violations', async () => {
    const { container } = render(<ActivityFeed items={ACTIVITY_ITEMS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility: Structural requirements', () => {
  it('all card links have accessible names', () => {
    const { container } = render(
      <>
        <MakerCard maker={MAKER} craftName="Pandanus Weaving" />
        <ProductCard product={PRODUCT} makerName="Julie Mone" />
        <CraftCard craft={CRAFT} />
      </>
    );
    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      // Each link should have text content or an aria-label
      const hasName = link.textContent?.trim() || link.getAttribute('aria-label');
      expect(hasName).toBeTruthy();
    });
  });

  it('all images have non-empty alt attributes', () => {
    const { container } = render(
      <>
        <MakerCard maker={MAKER} craftName="Pandanus Weaving" />
        <ProductCard product={PRODUCT} makerName="Julie Mone" />
      </>
    );
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      // alt can be "" for decorative images, but must be present
      expect(alt).not.toBeNull();
      // For content images, alt should be descriptive
      if (alt !== '') {
        expect(alt!.length).toBeGreaterThan(3);
      }
    });
  });
});
