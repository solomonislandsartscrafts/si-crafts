'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, Check, ShoppingCart } from 'lucide-react';
import type { Product, Maker, Craft } from '@/types';
import { ImageGallery } from '@/components/provenance/image-gallery';
import { ProductTabs } from '@/components/provenance/product-tabs';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/price';

interface PiecePageClientProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
  maker?: Maker | null;
  craft?: Craft | null;
}

export function PiecePageClient({ product, craftName, craftSlug, maker, craft }: PiecePageClientProps) {
  const [copied, setCopied] = useState(false);
  const [isStockist, setIsStockist] = useState(false);
  const [added, setAdded] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setIsStockist(!!localStorage.getItem('stockist_session'));
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(product.productCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAddToCart() {
    addToCart({
      productId: product.id,
      productCode: product.productCode,
      productName: product.name,
      unitPrice: product.wholesalePrice,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setShowNotes(false);
    setNotes('');
    setQty(1);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <ImageGallery images={product.imageUrls} alt={product.name} />

      {/* Right: Product Info — ordered by importance */}
      <div>
        {/* 1. Product name — the primary identifier */}
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
          {product.name}
        </h1>

        {/* 2. Maker — the emotional differentiator */}
        {maker && maker.publishedFlag && (
          <Link href={`/maker/${maker.slug}`} className="block mt-5 group">
            <div className="flex gap-4 items-center p-4 bg-sand-light rounded-lg hover:bg-sand transition-colors">
              <div className="w-14 h-14 flex-shrink-0 relative rounded-full overflow-hidden bg-sand shadow-sm ring-2 ring-white">
                {maker.portraitUrl ? (
                  <Image
                    src={maker.portraitUrl}
                    alt={`${maker.name} from ${maker.village}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-warm-gray-400 text-[10px]">Photo</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-base font-bold text-deep-blue group-hover:text-ocean transition-colors">
                  {maker.name}
                </p>
                <p className="text-sm text-warm-gray-600">
                  {maker.village}, {maker.province}
                  {craft && (
                    <span className="text-ocean"> · {craft.name}</span>
                  )}
                </p>
              </div>
              <span className="text-sm font-medium text-ocean group-hover:text-ocean-dark transition-colors flex-shrink-0">
                View story →
              </span>
            </div>
          </Link>
        )}

        {/* 3. Description — the story that creates connection */}
        <p className="mt-5 text-warm-gray-600 leading-relaxed">
          {product.description}
        </p>

        {/* 4. Key specs — consolidated, shown once */}
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-sand-light rounded-md p-3">
            <dt className="text-[10px] text-warm-gray-400 uppercase tracking-wide">Material</dt>
            <dd className="text-warm-gray-800 font-medium capitalize text-sm mt-0.5">{product.materialCategory}</dd>
          </div>
          <div className="bg-sand-light rounded-md p-3">
            <dt className="text-[10px] text-warm-gray-400 uppercase tracking-wide">Type</dt>
            <dd className="text-warm-gray-800 font-medium capitalize text-sm mt-0.5">{product.productType}</dd>
          </div>
          {product.dimensions && (
            <div className="bg-sand-light rounded-md p-3">
              <dt className="text-[10px] text-warm-gray-400 uppercase tracking-wide">Dimensions</dt>
              <dd className="text-warm-gray-800 font-medium text-sm mt-0.5">{product.dimensions}</dd>
            </div>
          )}
          {/* 5. Product code — subtle, for reference */}
          <div className="bg-sand-light rounded-md p-3">
            <dt className="text-[10px] text-warm-gray-400 uppercase tracking-wide">Product Code</dt>
            <dd className="flex items-center gap-1.5 mt-0.5">
              <span className="text-warm-gray-800 font-mono font-bold text-sm">{product.productCode}</span>
              <button
                onClick={handleCopy}
                className="tap-target p-1 rounded text-warm-gray-400 hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label="Copy piece code"
              >
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </button>
            </dd>
          </div>
        </dl>

        {/* Add to Order — only for logged-in stockists */}
        {isStockist && (
          <div className="mt-6 p-4 bg-ocean/5 border border-ocean/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-deep-blue">
                {formatPrice(product.wholesalePrice)} <span className="text-xs text-warm-gray-400 font-normal">ex. GST</span>
              </p>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-xs text-ocean hover:text-ocean-dark transition-colors"
              >
                {showNotes ? 'Hide note' : 'Add a note'}
              </button>
            </div>
            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. preferred colour, quantity, matching set..."
                rows={2}
                className="w-full px-3 py-2 mb-3 text-sm rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-none"
              />
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-sand-dark rounded-md">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-warm-gray-600 hover:text-deep-blue transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3 text-sm font-medium text-deep-blue min-w-[2.5rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(999, qty + 1))}
                  className="px-3 py-2 text-warm-gray-600 hover:text-deep-blue transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`tap-target flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                  added
                    ? 'bg-success/10 text-success'
                    : 'bg-ocean hover:bg-ocean-dark text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Order
                  </>
                ) : (
                  'Add to Order'
                )}
              </button>
            </div>
          </div>
        )}

        {/* 6. Accordions — secondary information */}
        <ProductTabs product={product} craftName={craftName} craftSlug={craftSlug} />
      </div>
    </div>
  );
}
