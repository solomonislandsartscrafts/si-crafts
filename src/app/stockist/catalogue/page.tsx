'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Download, ShoppingCart } from 'lucide-react';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { SearchInput } from '@/components/catalogue/search-input';
import { ProductGrid } from '@/components/catalogue/product-grid';
import { validateStockistSession, logoutStockist } from '@/services/auth';
import { getWholesaleProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';

const MATERIAL_LABELS: Record<string, string> = { pandanus: 'Pandanus', wood: 'Wood', shells: 'Shells' };

export default function StockistCataloguePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [makers, setMakers] = useState<Maker[]>([]);
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { router.push('/stockist/login'); return; }

      const stockist = await validateStockistSession(token);
      if (!stockist) { localStorage.removeItem('stockist_session'); router.push('/stockist/login'); return; }

      setAuthenticated(true);
      const [prods, mkrs] = await Promise.all([getWholesaleProducts(), getPublicMakers()]);
      setProducts(prods);
      setMakers(mkrs);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem('stockist_session');
    if (token) {
      await logoutStockist(token);
    }
    localStorage.removeItem('stockist_session');
    router.push('/wholesale');
  }

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedMaker) result = result.filter((p) => p.makerId === selectedMaker);
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }
    return result;
  }, [products, selectedMaker, searchQuery]);

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

  if (!authenticated || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
        <p className="text-warm-gray-400">Loading wholesale catalogue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
            Wholesale Catalogue
          </h1>
          <p className="text-sm text-warm-gray-600 mt-1">Pricing shown in AUD (ex. GST)</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/stockist/requests"
            className="tap-target inline-flex items-center gap-2 px-4 py-2 border border-sand-dark text-warm-gray-600 hover:bg-sand-light rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean">
            Requests
          </Link>
          <Link href="/stockist/orders"
            className="tap-target inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light">
            <ShoppingCart className="w-4 h-4" /> Order
          </Link>
          <button className="tap-target inline-flex items-center gap-2 px-4 py-2 border border-sand-dark text-warm-gray-600 hover:bg-sand-light rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean">
            <Download className="w-4 h-4" /> Price List
          </button>
          <button onClick={handleLogout}
            className="tap-target inline-flex items-center gap-2 px-4 py-2 text-sm text-warm-gray-600 hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-ocean">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <MakerFilter makers={makers} selected={selectedMaker} onChange={setSelectedMaker} />
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <p className="text-sm text-warm-gray-400 mb-6" aria-live="polite">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-warm-gray-600 mb-4">No products match your filters.</p>
          <button onClick={() => { setSelectedMaker(null); setSearchQuery(''); }}
            className="text-ocean hover:text-ocean-dark font-medium">Clear all filters</button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([key, groupProducts]) => (
            <section key={key}>
              <h2 className="font-heading text-xl font-bold text-deep-blue mb-4 capitalize">
                {labels[key] || key}
              </h2>
              <ProductGrid products={groupProducts} makers={makers} showPrice={true} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
