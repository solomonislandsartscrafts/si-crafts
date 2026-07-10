'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Product } from '@/types';
import { ImageGallery } from '@/components/provenance/image-gallery';
import { ProductTabs } from '@/components/provenance/product-tabs';

interface PiecePageClientProps {
  product: Product;
}

export function PiecePageClient({ product }: PiecePageClientProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(product.productCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Image Gallery */}
      <ImageGallery images={product.imageUrls} alt={product.name} />

      {/* Right: Product Info + Tabs */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
          {product.name}
        </h1>

        {/* Piece Code — prominent with copy button */}
        <div className="mt-4 inline-flex items-center gap-3 bg-deep-blue text-white rounded-lg px-4 py-3">
          <div>
            <span className="text-[10px] text-white/60 uppercase tracking-widest block">
              Piece Code
            </span>
            <span className="text-lg font-mono font-bold tracking-wide">
              {product.productCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="tap-target flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            aria-label="Copy piece code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-warm-gray-600">
          <span className="capitalize">{product.materialCategory}</span>
          <span>·</span>
          <span className="capitalize">{product.productType}</span>
          {product.dimensions && (
            <>
              <span>·</span>
              <span>{product.dimensions}</span>
            </>
          )}
        </div>

        {/* Tabs: Details, How to Buy, Care & Shipping */}
        <ProductTabs product={product} />
      </div>
    </div>
  );
}
