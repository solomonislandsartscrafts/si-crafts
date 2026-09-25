'use client';

import { useState, useMemo, useEffect } from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { SearchInput } from '@/components/catalogue/search-input';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { StockistProductGrid } from '@/components/catalogue/stockist-product-grid';
import { Select } from '@/components/ui/select';
import { validateStockistSession } from '@/lib/auth-client';
import type { MaterialCategoryOption } from '@/services/categories';

/**
 * Sort options. Name and Maker are available to everyone; the two price sorts
 * are added only for logged-in stockists, since public visitors never see
 * pricing. `null` = the default order the products arrive in.
 */
type SortKey = 'name' | 'maker' | 'price-asc' | 'price-desc';

const PUBLIC_SORTS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'maker', label: 'Maker' },
];

const STOCKIST_SORTS: { value: SortKey; label: string }[] = [
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
];

interface CatalogueClientProps {
  products: Product[];
  makers: Maker[];
  materialCategories: MaterialCategoryOption[];
  /** Seed for the search field, from the `?q=` param the header search sets. */
  initialQuery?: string;
  /** Admin-editable copy, passed down so this stays a pure client component. */
  emptyTitle: string;
  emptyDescription: string;
}

export function CatalogueClient({
  products,
  makers,
  materialCategories,
  initialQuery = '',
  emptyTitle,
  emptyDescription,
}: CatalogueClientProps) {
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [isStockist, setIsStockist] = useState(false);

  // `initialQuery` seeds the field from the `?q=` param, but on client-side
  // navigation (the header search setting a new `?q=`) React keeps this
  // component mounted, so the initial value alone would leave the field and
  // results showing the previous query. Re-sync whenever the incoming query
  // changes. Local user edits still win between navigations — this only fires
  // when the seed itself changes.
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

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

  // Filter, then sort. Filtering runs in real time as the user types; sorting
  // is applied last so it orders whatever survived the filters.
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

    if (sortKey) {
      // Copy before sorting so the source array is not mutated.
      result = [...result].sort((a, b) => {
        switch (sortKey) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'maker':
            return (makerNameMap[a.makerId] || '').localeCompare(
              makerNameMap[b.makerId] || ''
            );
          case 'price-asc':
            return a.wholesalePrice - b.wholesalePrice;
          case 'price-desc':
            return b.wholesalePrice - a.wholesalePrice;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [products, selectedMaker, selectedMaterial, searchQuery, sortKey, makerNameMap]);

  // Price sorts only exist for stockists. If a stockist sorts by price and then
  // logs out (session expires), fall back to no sort rather than leaving a
  // price sort active with no way to see or change it.
  const sortOptions = isStockist ? [...PUBLIC_SORTS, ...STOCKIST_SORTS] : PUBLIC_SORTS;
  useEffect(() => {
    if (!isStockist && (sortKey === 'price-asc' || sortKey === 'price-desc')) {
      setSortKey(null);
    }
  }, [isStockist, sortKey]);

  const hasActiveFilters =
    selectedMaker !== null ||
    selectedMaterial !== null ||
    searchQuery.trim() !== '' ||
    sortKey !== null;

  function clearFilters() {
    setSelectedMaker(null);
    setSelectedMaterial(null);
    setSearchQuery('');
    setSortKey(null);
  }

  // Material as a compact Select — the top bar puts every control on one row,
  // so the vertical CategoryFilter list (which suited the old left rail) is
  // replaced by a single-line dropdown that sits beside search and maker.
  const materialSelectOptions = materialCategories.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  return (
    <div className="site-container pb-section">
      {/* Horizontal filter bar across the top — Search, Material, Maker and Sort
          all in one row, so the grid below runs the full page width. This
          replaces the old left rail (260px sidebar) + separate mobile bar: one
          layout for every breakpoint, controls up top, results underneath.

          Order is deliberate: Search, Material, Maker — the three controls that
          narrow the results ("show me fewer things") — then a flexible gap, then
          Sort pushed to the right, since it reorders rather than narrows. Search
          leads because it is the shortest path for a visitor who already knows
          what they want (a product type, a product code).

          The row wraps on narrow screens (`flex-wrap`): search takes a flexible
          first slot, then the selects stack under it on a phone. Every control
          is 44px tall (h-11) so the bar reads as one aligned strip. No boxed
          panel — a near-white fill on a white page adds weight without adding
          separation (the same conclusion the filter rail and poster card
          reached); the `mb-block` gap below the bar does the separating. */}
      <div className="mb-block flex flex-wrap items-center gap-sm">
        <div className="min-w-[12rem] flex-1 sm:max-w-xs">
          <SearchInput value={searchQuery} onChange={setSearchQuery} fullWidth />
        </div>

        <Select
          id="material-filter"
          value={selectedMaterial}
          onChange={setSelectedMaterial}
          options={materialSelectOptions}
          placeholder="All materials"
          label="Filter by material"
        />

        <MakerFilter
          makers={makers}
          selected={selectedMaker}
          onChange={setSelectedMaker}
        />

        {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}

        {/* Sort pushed to the right edge of the bar (`ml-auto`), separated from
            the narrowing controls. Falls to the next line on a phone with the
            rest. */}
        <div className="ml-auto">
          <Select
            id="sort"
            value={sortKey}
            onChange={(v) => setSortKey((v as SortKey) || null)}
            options={sortOptions}
            placeholder="Featured"
            label="Sort products"
            align="right"
          />
        </div>
      </div>

      {/* Result count above the full-width grid. */}
      <p
        className="mb-stack text-base text-warm-gray-600"
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

      {/* A single flat, full-width grid — no per-material section headings. The
          material filter already narrows by category. */}
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
      ) : isStockist ? (
        <StockistProductGrid products={filteredProducts} makers={makers} />
      ) : (
        <ProductGrid products={filteredProducts} makers={makers} titleAs="h2" />
      )}
    </div>
  );
}
