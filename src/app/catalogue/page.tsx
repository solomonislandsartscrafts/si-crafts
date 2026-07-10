'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import type { Product, Maker, MaterialCategory } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { SearchInput } from '@/components/catalogue/search-input';
import { ProductGrid } from '@/components/catalogue/product-grid';

const MATERIAL_LABELS: Record<MaterialCategory, string> = {
  pandanus: 'Pandanus',
  wood: 'Wood',
  shells: 'Shells',
};

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [makers, setMakers] = useState<Maker[]>([]);
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { getPublicProducts } = await import('@/services/products');
      const { getPublicMakers } = await import('@/services/makers');
      const [prods, mkrs] = await Promise.all([
        getPublicProducts(),
        getPublicMakers(),
      ]);
      setProducts(prods);
      setMakers(mkrs);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedMaker) {
      result = result.filter((p) => p.makerId === selectedMaker);
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, selectedMaker, searchQuery]);

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

  const labels = MATERIAL_LABELS;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
        <p className="text-warm-gray-400">Loading catalogue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">
        Catalogue
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Browse our full collection of Solomon Islands handicrafts.
      </p>

      {/* Login prompt */}
      <div className="bg-ocean/5 border border-ocean/20 rounded-lg p-4 mb-8 flex items-center gap-3">
        <Lock className="w-5 h-5 text-ocean flex-shrink-0" />
        <p className="text-sm text-warm-gray-600">
          <Link href="/stockist/login" className="text-ocean font-medium hover:underline">
            Log in as a stockist
          </Link>{' '}
          to view wholesale pricing.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <MakerFilter
            makers={makers}
            selected={selectedMaker}
            onChange={setSelectedMaker}
          />
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-warm-gray-400 mb-6" aria-live="polite">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
      </p>

      {/* Product groups */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-gray-600 mb-4">
            No products match your current filters.
          </p>
          <button
            onClick={() => {
              setSelectedMaker(null);
              setSearchQuery('');
            }}
            className="text-ocean hover:text-ocean-dark font-medium transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([key, groupProducts]) => (
            <section key={key}>
              <h2 className="font-heading text-xl font-bold text-deep-blue mb-4 capitalize">
                {labels[key] || key}
              </h2>
              <ProductGrid products={groupProducts} makers={makers} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
