'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { Product, Maker } from '@/types';
import { MakerFilter } from '@/components/catalogue/maker-filter';
import { SearchInput } from '@/components/catalogue/search-input';
import { StockistProductGrid } from '@/components/catalogue/stockist-product-grid';
import { validateStockistSession } from '@/lib/auth-client';
import { getWholesaleProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCardGrid } from '@/components/ui/skeleton';

const MATERIAL_LABELS: Record<string, string> = { pandanus: 'Pandanus', wood: 'Wood', shells: 'Shells', 'bush-twine': 'Bush-twine' };

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
    try {
      const token = localStorage.getItem('stockist_session');
      if (token) {
        await fetch('/api/auth/stockist/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } finally {
      localStorage.removeItem('stockist_session');
      router.push('/');
    }
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
      <div className="site-container page-y">
        <SkeletonCardGrid />
      </div>
    );
  }

  return (
    <div className="site-container page-y">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-sm mb-lg">
        <div>
          <h1 className={pageTitleClasses}>Wholesale Catalogue</h1>
          <p className="text-base text-warm-gray-600 mt-3xs">Pricing shown in AUD (ex. GST)</p>
        </div>
        <div className="flex items-center gap-xs">
          <ButtonLink href="/stockist/requests" variant="secondary" size="sm">
            Requests
          </ButtonLink>
          <ButtonLink href="/stockist/orders" size="sm">
            Order
          </ButtonLink>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-sm items-start sm:items-center justify-between mb-lg">
        <div className="flex flex-col sm:flex-row gap-xs w-full sm:w-auto">
          <MakerFilter makers={makers} selected={selectedMaker} onChange={setSelectedMaker} />
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      <p className="text-sm text-warm-gray-400 mb-md" aria-live="polite">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
      </p>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products match your filters."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSelectedMaker(null); setSearchQuery(''); }}
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-block">
          {Object.entries(grouped).map(([key, groupProducts]) => (
            <section key={key}>
              <h2 className="font-heading text-xl font-medium text-deep-blue mb-sm capitalize">
                {labels[key] || key}
              </h2>
              <StockistProductGrid products={groupProducts} makers={makers} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
