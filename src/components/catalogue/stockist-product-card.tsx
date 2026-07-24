'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/price';

interface StockistProductCardProps {
  product: Product;
  makerName?: string;
}

export function StockistProductCard({ product, makerName }: StockistProductCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

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
    <div className="rounded-lg overflow-hidden bg-white shadow-card hover:shadow-md transition-shadow">
      {/* Image — links to piece page */}
      <Link href={`/piece/${product.productCode}`} className="block">
        <div className="aspect-square relative bg-sand-light">
          {product.imageUrls.length > 0 ? (
            <Image
              src={product.imageUrls[0]}
              alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
              fill
              className="object-contain p-3"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-warm-gray-400 text-sm">Image coming soon</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/piece/${product.productCode}`}>
          <h3 className="font-heading text-sm font-semibold text-deep-blue hover:text-ocean transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1 text-xs text-warm-gray-600">
          <span className="capitalize">{product.materialCategory}</span>
          <span>·</span>
          <span className="capitalize">{product.productType}</span>
        </div>
        {makerName && (
          <p className="text-xs text-ocean mt-1">by {makerName}</p>
        )}

        {/* Price */}
        <p className="text-base font-bold text-deep-blue mt-2">
          {formatPrice(product.wholesalePrice)}
        </p>

        {/* Add to cart + notes */}
        <div className="mt-3 space-y-2">
          {/* Notes toggle */}
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-ocean hover:text-ocean-dark transition-colors"
            >
              Add a note for this item
            </button>
          ) : (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. preferred colour, quantity notes..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-md border border-sand-dark bg-white text-warm-gray-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent resize-none"
            />
          )}

          {/* Quantity + Add button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-sand-dark rounded-md">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-2 py-1.5 text-warm-gray-600 hover:text-deep-blue transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-2 text-sm font-medium text-deep-blue min-w-[2rem] text-center">{qty}</span>
              <button
                onClick={() => setQty(Math.min(999, qty + 1))}
                className="px-2 py-1.5 text-warm-gray-600 hover:text-deep-blue transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`tap-target flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                added
                  ? 'bg-success/10 text-success'
                  : 'bg-ocean hover:bg-ocean-dark text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added
                </>
              ) : (
                'Add to Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
