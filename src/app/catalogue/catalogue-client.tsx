'use client';

import { useState, useMemo, useEffect } from 'react';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { CategoryChips } from '@/components/catalogue/category-chips';
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
  /** Admin-editable copy, passed down so this stays a pure client component. */
  emptyTitle: string;
  emptyDescription: string;
}

export function CatalogueClient({
  products,
  makers,
  materialCategories,
  emptyTitle,
  emptyDescription,
}: CatalogueClientProps) {
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [isStockist, setIsStockist] = useState(false);
  // On mobile the filter rail is hidden behind a toggle so it doesn't push the
  // grid down the page. On desktop (lg+) the sidebar is always visible.
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // The filter controls, shared between the desktop sidebar and the mobile
  // stacked layout (same panel, different container). Chips stack vertically so
  // each craft type reads as a list option in the rail.
  const filtersPanel = (
    <div className="space-y-md">
      <CategoryChips
        selected={selectedMaterial}
        onChange={setSelectedMaterial}
        options={materialCategories}
        direction="stack"
      />

      <div className="flex flex-col gap-3xs">
        <span className="text-xs font-semibold uppercase tracking-wide text-warm-gray-400">
          Maker
        </span>
        <MakerFilter
          makers={makers}
          selected={selectedMaker}
          onChange={setSelectedMaker}
        />
      </div>

      <div className="flex flex-col gap-3xs">
        <span className="text-xs font-semibold uppercase tracking-wide text-warm-gray-400">
          Search
        </span>
        <SearchInput value={searchQuery} onChange={setSearchQuery} fullWidth />
      </div>

      <div className="flex flex-col gap-3xs">
        <span className="text-xs font-semibold uppercase tracking-wide text-warm-gray-400">
          Sort
        </span>
        <Select
          id="sort"
          value={sortKey}
          onChange={(v) => setSortKey((v as SortKey) || null)}
          options={sortOptions}
          placeholder="Featured"
          label="Sort products"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="secondary" size="sm" fullWidth onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="site-container pb-section">
      {/* Mobile-only toggle. The filter rail is hidden below lg so it doesn't
          push the product grid down the page; this button reveals it. */}
      <div className="mb-stack lg:hidden">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="catalogue-filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {filtersOpen ? 'Hide filters' : 'Filters'}
        </Button>
      </div>

      {/* Sidebar (desktop) + grid. On mobile this is one column, so the filter
          panel stacks above the grid; from lg it becomes a fixed 260px rail on
          the left with the products beside it, so the grid is visible at first
          glance without scrolling past a control bar. */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-block items-start">
        {/* Filter sidebar. Sticky on desktop so it stays in view as the grid
            scrolls. Hidden on mobile unless toggled open, so it never pushes
            the grid down the page. */}
        <aside
          id="catalogue-filters"
          aria-label="Filter products"
          className={`${
            filtersOpen ? 'block' : 'hidden'
          } lg:block rounded-lg border border-sand bg-warm-gray-100 p-md lg:sticky lg:top-24`}
        >
          {filtersPanel}
        </aside>

        {/* Product column */}
        <div>
          {/* Result count strip above the grid. */}
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

          {/* A single flat grid — no per-material section headings. The craft
              filter already narrows by category. */}
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
            <ProductGrid products={filteredProducts} makers={makers} />
          )}
        </div>
      </div>
    </div>
  );
}
