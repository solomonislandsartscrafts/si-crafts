'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product, Maker, Craft } from '@/types';
import { ImageGallery } from '@/components/provenance/image-gallery';
import { ProductTabs } from '@/components/provenance/product-tabs';
import { MakerSection } from '@/components/provenance/maker-section';
import { ShareButtons } from '@/components/shared/share-buttons';
import { addToCart } from '@/lib/cart';
import { materialLabel, productTypeLabel } from '@/lib/labels';
import { formatPrice } from '@/lib/price';
import { validateStockistSession } from '@/lib/auth-client';

interface PiecePageClientProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
  maker?: Maker | null;
  craft?: Craft | null;
}

export function PiecePageClient({ product, craftName, craftSlug, maker, craft }: PiecePageClientProps) {
  const [isStockist, setIsStockist] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkStockistSession() {
      const token = localStorage.getItem('stockist_session');
      if (!token) { setIsStockist(false); return; }
      const stockist = await validateStockistSession(token);
      if (stockist) {
        setIsStockist(true);
      } else {
        localStorage.removeItem('stockist_session');
        setIsStockist(false);
      }
    }
    checkStockistSession();
  }, []);

  useEffect(() => {
    if (!isStockist || !ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [isStockist]);

  function handleAddToCart() {
    addToCart({
      productId: product.id,
      productCode: product.productCode,
      productName: product.name,
      unitPrice: product.wholesalePrice,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setQty(1);
  }

  return (
    // Two columns only from lg up. Splitting at md put each column at roughly
    // 350px on an iPad in portrait, which squeezed the title onto two lines and
    // narrowed the maker quote to a few words per line.
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery. Capped while the layout is a single column so a
          full-width square does not push the maker below the fold on a tablet. */}
      <div className="w-full max-w-lg mx-auto lg:max-w-none lg:mx-0">
        <ImageGallery images={product.imageUrls} alt={product.name} />
      </div>

      {/* Right: Product Info */}
      <div className="bg-white rounded-lg p-5 sm:p-6">
        {/* Category and trade badge share a row, so the title below always gets
            the full column width. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-2">
          <p className="text-base text-warm-gray-600 capitalize">
            {materialLabel(product.materialCategory)} ·{' '}
            {productTypeLabel(product.productType)}
          </p>
          <span className="flex-shrink-0 inline-block px-3 py-1 text-xs font-medium text-brand-green border border-brand-green/40 rounded-full">
            Wholesale · Trade only
          </span>
        </div>

        {/* Product name */}
        <h1 className="font-heading text-2xl sm:text-3xl font-medium text-deep-blue mb-3">
          {product.name}
        </h1>

        {/* Description */}
        <p className="text-base text-warm-gray-800 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* CTA card — stockists only */}
        {isStockist && (
          <div ref={ctaRef} className="bg-sand-light rounded-lg p-6 mb-6">
            <p className="text-lg font-heading font-semibold text-deep-blue mb-3">
              {formatPrice(product.wholesalePrice)}
              <span className="text-xs text-warm-gray-400 font-body font-normal ml-1">ex. GST</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-sand-dark rounded-md bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="tap-target flex items-center justify-center text-warm-gray-800 hover:bg-sand-light rounded-l-md focus:outline-none focus:ring-2 focus:ring-ocean"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="px-3 text-base font-medium text-deep-blue border-x border-sand-dark min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(999, qty + 1))}
                  className="tap-target flex items-center justify-center text-warm-gray-800 hover:bg-sand-light rounded-r-md focus:outline-none focus:ring-2 focus:ring-ocean"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={added}
                fullWidth
                className={added ? 'bg-success/10 text-success' : ''}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Added
                  </>
                ) : (
                  'Add to Order'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Meet the Maker — sits ABOVE the specification tabs. A QR-scan
            visitor is here for the maker, not the dimensions. MakerSection
            returns null unless the maker's consent flag is set. */}
        <MakerSection maker={maker} craft={craft} />

        {/* Reference info. "Where to buy" is one of the tabs, which is the only
            next step a public visitor has — pricing and Add to Order are
            stockist-only. It replaced a separate section that repeated most of
            what the old "How to buy" tab already said. */}
        <div className="mt-8">
          <ProductTabs product={product} craftName={craftName} craftSlug={craftSlug} />
        </div>

        {/* Share buttons */}
        <div className="mt-6 pt-4 border-t border-sand">
          <ShareButtons title={product.name} />
        </div>
      </div>

      {/* Sticky bottom bar — mobile only, stockists only */}
      {isStockist && showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-20 lg:hidden p-3 bg-white border-t border-sand shadow-md">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex-shrink-0">
              <p className="text-sm font-bold text-deep-blue">{formatPrice(product.wholesalePrice)}</p>
              <p className="text-xs text-warm-gray-600 truncate max-w-[120px]">{product.name}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`tap-target flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                added
                  ? 'inline-flex items-center justify-center gap-2 bg-success/10 text-success'
                  : 'bg-brand-green hover:bg-brand-green-dark text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 inline mr-1" />
                  Add to Order
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
