'use client';

import { useState, useMemo, useEffect } from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { CategoryFilter } from '@/components/catalogue/category-filter';
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

/**
 * The small caps label above each control in the filter rail. Defined once
 * rather than retyped per section — the same reason `inputClasses` exists.
 * `text-xs` is legitimate here: these are field labels, not reading content.
 */
const filterLabelClasses =
  'text-xs font-semibold uppercase tracking-wide text-warm-gray-400';

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

  // Material options as a compact Select — used only in the mobile filter bar.
  // The desktop rail keeps the CategoryFilter list; on a phone a single-line
  // dropdown is far lighter than an expanding panel of stacked controls.
  const materialSelectOptions = materialCategories.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  // The filter controls, shared between the desktop rail and the mobile stacked
  // layout — same markup, different container.
  //
  // Order is deliberate and it is not the order these were originally in:
  // Search, then Material, then Maker. Search is the shortest path for a visitor
  // who already knows what they want ("bowl", a product code), so it goes first.
  // It used to sit third, below a six-item material list, which buried the one
  // control that can answer a specific question in one action.
  //
  // Sort is NOT here. It orders results rather than narrowing them, so it lives
  // beside the result count above the grid — see the product column below.
  const filtersPanel = (
    <div className="space-y-md">
      <div className="flex flex-col gap-2xs">
        <span className={filterLabelClasses}>Search</span>
        <SearchInput value={searchQuery} onChange={setSearchQuery} fullWidth />
      </div>

      <div className="flex flex-col gap-2xs">
        <span className={filterLabelClasses}>Material</span>
        <CategoryFilter
          selected={selectedMaterial}
          onChange={setSelectedMaterial}
          options={materialCategories}
        />
      </div>

      <div className="flex flex-col gap-2xs">
        <span className={filterLabelClasses}>Maker</span>
        <MakerFilter
          makers={makers}
          selected={selectedMaker}
          onChange={setSelectedMaker}
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
      {/* Mobile filter bar — lightweight, inline, and always visible below lg.
          Replaces the old "Filters" toggle that expanded the full stacked rail
          (search + material list + maker select + clear) and pushed the grid
          down the page. On a phone the two controls a visitor reaches for most —
          search and material — sit in one compact row that reflows to two lines
          on the narrowest screens. Maker filtering stays on the desktop rail;
          on mobile, search covers a maker's name. */}
      <div className="mb-stack flex flex-wrap items-center gap-sm lg:hidden">
        <div className="flex-1 min-w-[12rem]">
          <SearchInput value={searchQuery} onChange={setSearchQuery} fullWidth />
        </div>
        <Select
          id="material-mobile"
          value={selectedMaterial}
          onChange={setSelectedMaterial}
          options={materialSelectOptions}
          placeholder="All materials"
          label="Filter by material"
        />
        {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Sidebar (desktop) + grid. On mobile this collapses to a single column
          (the rail is hidden, replaced by the compact bar above); from lg it
          becomes a fixed 260px rail on the left with the products beside it. */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-block items-start">
        {/* Filter rail — desktop only (`hidden lg:block`), sticky so it stays in
            view as the grid scrolls. Mobile uses the compact bar above instead,
            so the full stacked panel never pushes the grid down the page.
            No panel: this was a `bg-warm-gray-100` (#FAFAFA) box with a
            `border-sand` outline and `p-md`. On a white page a near-white fill
            adds weight without adding separation — the same conclusion the
            poster card reached when it dropped the panel around its caption.
            The `gap-block` (32 → 64px) between rail and grid already separates
            them, so the labels and options can do the work unboxed. */}
        <aside
          id="catalogue-filters"
          aria-label="Filter products"
          className="hidden lg:sticky lg:top-24 lg:block"
        >
          {filtersPanel}
        </aside>

        {/* Product column */}
        <div>
          {/* Result count + sort, on one row above the grid.
              Sort belongs here rather than in the filter rail: it reorders the
              results instead of narrowing them, and this is where the visitor is
              already looking once the count changes. It also keeps the rail to
              three controls that all answer "show me fewer things". */}
          <div className="mb-stack flex flex-wrap items-center justify-between gap-sm">
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
