'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ShoppingCart, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
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

  // Short description for the above-the-fold preview only. The full text is
  // rendered untruncated in the Description tab below, so nothing is lost here.
  const shortDescription = product.description
    ? product.description.length > 120
      ? `${product.description.slice(0, 120).trim()}\u2026`
      : product.description
    : null;

  return (
    <div className="space-y-10">
      {/* ─── Top section: Gallery (left) + Product Info (right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column — Image gallery with thumbnails */}
        <div className="w-full">
          <ImageGallery images={product.imageUrls} alt={product.name} />
        </div>

        {/* Right column — Product info */}
        <div className="flex flex-col">
          {/* Category pill */}
          <p className="mb-3">
            {craftName && craftSlug ? (
              <Link
                href={`/craft/${craftSlug}`}
                className="inline-block text-sm font-medium text-ocean bg-ocean/10 px-3 py-1 rounded-full hover:bg-ocean/20 transition-colors"
              >
                {craftName}
              </Link>
            ) : (
              <span className="inline-block text-sm font-medium text-ocean bg-ocean/10 px-3 py-1 rounded-full">
                {materialLabel(product.materialCategory)}
              </span>
            )}
          </p>

          {/* Product name */}
          <h1 className="font-heading text-2xl sm:text-3xl font-medium text-deep-blue mb-3">
            {product.name}
          </h1>

          {/* Gold accent bar under title */}
          <div className="w-16 h-1 bg-accent-gold rounded-full mb-4" />

          {/* Short description preview */}
          {shortDescription && (
            <p className="text-base text-warm-gray-600 leading-relaxed mb-4">
              {shortDescription}
            </p>
          )}

          {/* Price — stockists only */}
          {isStockist && (
            <p className="font-heading text-2xl font-semibold text-deep-blue mb-4">
              {formatPrice(product.wholesalePrice)}
              <span className="text-sm text-warm-gray-400 font-body font-normal ml-2">ex. GST</span>
            </p>
          )}

          {/* Add to order — stockists only */}
          {isStockist && (
            <div ref={ctaRef} className="mb-6">
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

          {/* Category / Reference — compact meta block */}
          <dl className="grid grid-cols-2 gap-4 py-4 border-y border-sand">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ocean mb-1">Category</dt>
              <dd className="text-base capitalize text-warm-gray-800">
                {materialLabel(product.materialCategory)}, {productTypeLabel(product.productType)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ocean mb-1">Reference</dt>
              <dd className="font-mono font-bold text-warm-gray-800">{product.productCode}</dd>
            </div>
          </dl>

          {/* Trade-only badge */}
          {!isStockist && (
            <div className="mt-5 px-4 py-3 bg-ocean/5 border border-ocean/20 rounded-lg">
              <p className="text-sm text-warm-gray-600">
                This piece is available to approved wholesale stockists.{' '}
                <Link href="/stockist/apply" className="text-ocean hover:text-ocean-dark font-medium">
                  Apply for an account
                </Link>{' '}
                or{' '}
                <Link href="/stockists" className="text-ocean hover:text-ocean-dark font-medium">
                  find a retail stockist
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Tabbed section: full width below the fold ─── */}
      <div>
        <ProductTabs product={product} craftName={craftName} craftSlug={craftSlug} />
      </div>

      {/* ─── Meet the Maker ─── */}
      <MakerSection maker={maker} craft={craft} />

      {/* ─── Share — at the bottom after content ─── */}
      <div className="flex items-center justify-center py-4 border-t border-sand">
        <ShareButtons title={product.name} />
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
