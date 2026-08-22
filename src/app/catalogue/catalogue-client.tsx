'use client';

import { useState, useMemo, useEffect } from 'react';
import { Lock, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CmsInline } from '@/components/ui/cms-text';
import { EmptyState } from '@/components/ui/empty-state';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { MaterialFilter } from '@/components/catalogue/material-filter';
import { SearchInput } from '@/components/catalogue/search-input';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { StockistProductGrid } from '@/components/catalogue/stockist-product-grid';
import { validateStockistSession } from '@/lib/auth-client';
import type { MaterialCategoryOption } from '@/services/categories';

interface CatalogueClientProps {
  products: Product[];
  makers: Maker[];
  materialCategories: MaterialCategoryOption[];
  /** Admin-editable copy, passed down so this stays a pure client component. */
  pricingPrompt: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function CatalogueClient({
  products,
  makers,
  materialCategories,
  pricingPrompt,
  emptyTitle,
  emptyDescription,
}: CatalogueClientProps) {
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStockist, setIsStockist] = useState(false);

  // Confirm the session with the backend rather than trusting the presence of
  // a localStorage key, so an expired token stops showing wholesale pricing.
  useEffect(() => {
    let cancelled = false;

    async function checkStockistSession() {
      const token = localStorage.getItem('stockist_session');
      if (!token) return;

      const stockist = await validateStockistSession(token);
      if (cancelled) return;

      if (stockist) {
        setIsStockist(true);
      } else {
        localStorage.removeItem('stockist_session');
        setIsStockist(false);
      }
    }

    checkStockistSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build a maker name lookup for search
  const makerNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    makers.forEach((m) => {
      map[m.id] = m.name.toLowerCase();
    });
    return map;
  }, [makers]);

  // Filter products in real time as user types
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedMaker) {
      result = result.filter((p) => p.makerId === selectedMaker);
    }

    if (selectedMaterial) {
      result = result.filter((p) => p.materialCategory === selectedMaterial);
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.productCode.toLowerCase().includes(term) ||
          p.materialCategory.toLowerCase().includes(term) ||
          p.productType.toLowerCase().includes(term) ||
          (makerNameMap[p.makerId] || '').includes(term)
      );
    }

    return result;
  }, [products, selectedMaker, selectedMaterial, searchQuery, makerNameMap]);

  // Group products by material
  const grouped = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    filteredProducts.forEach((product) => {
      const key = product.materialCategory;
      if (!groups[key]) groups[key] = [];
      groups[key].push(product);
    });
    return groups;
  }, [filteredProducts]);

  const hasActiveFilters =
    selectedMaker !== null || selectedMaterial !== null || searchQuery.trim() !== '';

  function clearFilters() {
    setSelectedMaker(null);
    setSelectedMaterial(null);
    setSearchQuery('');
  }

  return (
    <div className="site-container pb-10 lg:pb-20">
      {/* Login prompt — only show when NOT logged in */}
      {!isStockist && pricingPrompt && (
        <div className="mb-8 flex items-center gap-2">
          <Lock className="w-4 h-4 text-ocean flex-shrink-0" aria-hidden="true" />
          <p className="text-base text-warm-gray-600">
            <CmsInline value={pricingPrompt} linkClassName="text-ocean font-medium hover:underline" />
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <MaterialFilter
            selected={selectedMaterial}
            onChange={setSelectedMaterial}
            options={materialCategories}
          />
          <MakerFilter
            makers={makers}
            selected={selectedMaker}
            onChange={setSelectedMaker}
          />
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Result count + clear. Both were previously missing for sighted users:
          the count was sr-only, and Clear all filters only appeared once you
          had already hit zero results. */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <p
          className="text-base text-warm-gray-600"
          aria-live="polite"
          aria-atomic="true"
        >
          {filteredProducts.length === 0 ? (
            emptyTitle
          ) : (
            <>
              <span className="font-semibold text-warm-gray-800">
                {filteredProducts.length}
              </span>{' '}
              {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </>
          )}
        </p>
        {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-16">
          {materialCategories.map((category) => {
            const groupProducts = grouped[category.value];
            if (!groupProducts || groupProducts.length === 0) return null;
            return (
              <section key={category.value}>
                <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4 capitalize border-l-2 border-brand-green pl-3">
                  {category.label}
                </h2>
                {isStockist ? (
                  <StockistProductGrid products={groupProducts} makers={makers} />
                ) : (
                  <ProductGrid products={groupProducts} makers={makers} />
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
