'use client';

import { useState, useMemo, useEffect } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { MaterialFilter } from '@/components/catalogue/material-filter';
import { SearchInput } from '@/components/catalogue/search-input';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { StockistProductGrid } from '@/components/catalogue/stockist-product-grid';
import type { MaterialCategoryOption } from '@/services/categories';

interface CatalogueClientProps {
  products: Product[];
  makers: Maker[];
  materialCategories: MaterialCategoryOption[];
}

export function CatalogueClient({ products, makers, materialCategories }: CatalogueClientProps) {
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStockist, setIsStockist] = useState(false);

  useEffect(() => {
    setIsStockist(!!localStorage.getItem('stockist_session'));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
      {/* Login prompt — only show when NOT logged in */}
      {!isStockist && (
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Lock className="w-4 h-4 text-ocean flex-shrink-0" />
          <p className="text-warm-gray-600">
            <Link href="/login" className="text-ocean font-medium hover:underline">
              Log in as a stockist
            </Link>{' '}
            to view wholesale pricing.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-10">
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

      {/* Product groups */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {filteredProducts.length === 0
          ? 'No products match your current filters.'
          : `Showing ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}.`}
      </p>
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-gray-600 mb-4">
            No products match your current filters.
          </p>
          <button
            onClick={() => {
              setSelectedMaker(null);
              setSelectedMaterial(null);
              setSearchQuery('');
            }}
            className="text-ocean hover:text-ocean-dark font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {materialCategories.map((category) => {
            const groupProducts = grouped[category.value];
            if (!groupProducts || groupProducts.length === 0) return null;
            return (
              <section key={category.value}>
                <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-4 capitalize border-l-2 border-terracotta pl-3">
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
