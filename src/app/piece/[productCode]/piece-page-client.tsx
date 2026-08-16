'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ShoppingCart } from 'lucide-react';
import type { Product, Maker, Craft } from '@/types';
import { ImageGallery } from '@/components/provenance/image-gallery';
import { ProductTabs } from '@/components/provenance/product-tabs';
import { ShareButtons } from '@/components/shared/share-buttons';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/price';
import { validateStockistSession } from '@/lib/auth-client';
import { SafeImage } from '@/components/ui/safe-image';

interface PiecePageClientProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
  maker?: Maker | null;
  craft?: Craft | null;
}

export function PiecePageClient({ product, craftName, craftSlug, maker }: PiecePageClientProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <ImageGallery images={product.imageUrls} alt={product.name} />

      {/* Right: Product Info */}
      <div>
        {/* Category breadcrumb */}
        <p className="text-sm text-warm-gray-600 capitalize mb-1">
          {product.materialCategory} · {product.productType}
        </p>

        {/* Wholesale badge — top right aligned */}
        <div className="flex items-start justify-between gap-4 mb-3">
          {/* Product name */}
          <h1 className="font-heading text-2xl sm:text-3xl font-medium text-deep-blue">
            {product.name}
          </h1>
          <span className="flex-shrink-0 inline-block px-3 py-1 text-xs font-medium text-terracotta border border-terracotta/40 rounded-full">
            Wholesale · Trade only
          </span>
        </div>

        {/* Description */}
        <p className="text-warm-gray-700 leading-relaxed mb-4">
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
              <div className="flex items-center border border-sand-dark rounded-md bg-white text-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="tap-target px-3 py-2 text-warm-gray-600"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="px-2 font-medium text-deep-blue border-x border-sand-dark min-w-[2rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(999, qty + 1))}
                  className="tap-target px-3 py-2 text-warm-gray-600"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`tap-target flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
                  added
                    ? 'bg-success/10 text-success'
                    : 'bg-terracotta hover:bg-terracotta-dark text-white'
                }`}
              >
                {added ? 'Added!' : 'Add to Order'}
              </button>
            </div>
          </div>
        )}

        {/* Product info tabs */}
        <ProductTabs product={product} craftName={craftName} craftSlug={craftSlug} />

        {/* Meet the Maker — storytelling section */}
        {maker && maker.publishedFlag && (
          <div className="mt-8">
            <h2 className="font-heading text-xl font-medium text-deep-blue mb-4">
              Meet the Maker
            </h2>

            {/* Maker identity — portrait, name, place */}
            <Link
              href={`/maker/${maker.slug}`}
              className="group flex items-center gap-3 mb-4 bg-warm-gray-100 hover:bg-sand-light rounded-lg p-3 transition-colors"
            >
              <div className="w-12 h-12 flex-shrink-0 relative rounded-full overflow-hidden bg-sand">
                <SafeImage
                  src={maker.portraitUrl}
                  alt={maker.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold text-deep-blue group-hover:text-ocean transition-colors">
                  {maker.name}
                </p>
                <p className="text-xs text-warm-gray-600">
                  {maker.village}, {maker.province}
                </p>
              </div>
            </Link>

            {/* Maker's story — first-person excerpt */}
            <div className="text-sm text-warm-gray-700 leading-relaxed space-y-2">
              {maker.story ? (
                <>
                  <p className="italic text-warm-gray-800">
                    &ldquo;{maker.story.length > 180 ? `${maker.story.slice(0, 180).trim()}…` : maker.story}&rdquo;
                  </p>
                  <p className="text-xs text-warm-gray-500">— {maker.name}, {maker.village}</p>
                </>
              ) : (
                <p>
                  {maker.name} is a maker from {maker.village}, {maker.province}. This piece was made by hand using skills passed down through generations.
                </p>
              )}
              <Link
                href={`/maker/${maker.slug}`}
                className="inline-block text-sm font-medium text-ocean hover:text-ocean-dark transition-colors mt-1"
              >
                Read {maker.name}&apos;s full story →
              </Link>
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div className="mt-6 pt-4 border-t border-sand">
          <ShareButtons title={product.name} />
        </div>

        {/* Wholesale-only notice — public visitors */}
        {!isStockist && (
          <div ref={ctaRef} className="sr-only" aria-hidden="true" />
        )}
      </div>

      {/* Sticky bottom bar — mobile only, stockists only */}
      {isStockist && showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-20 md:hidden p-3 bg-white border-t border-sand shadow-md">
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
                  : 'bg-terracotta hover:bg-terracotta-dark text-white'
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
