'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/price';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/components/ui/form-field';
import { SafeImage } from '@/components/ui/safe-image';

/**
 * Product card for logged-in stockists — adds price and an Add to Order
 * control. Chrome deliberately matches ProductCard so the catalogue does not
 * change appearance when a stockist logs in.
 */
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
      note: notes.trim() || undefined,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setShowNotes(false);
    setNotes('');
    setQty(1);
  }

  const noteFieldId = `note-${product.id}`;

  return (
    <div className="flex h-full flex-col rounded-lg overflow-hidden bg-card-bg shadow-card hover:shadow-md transition-shadow duration-200">
      {/* Image — links to piece page */}
      <Link
        href={`/piece/${product.productCode}`}
        className="group block focus:outline-none focus:ring-2 focus:ring-ocean rounded-t-lg"
      >
        <div className="aspect-square relative bg-sand-light overflow-hidden">
          <SafeImage
            src={product.imageUrls[0] || null}
            alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-semibold text-deep-blue leading-tight line-clamp-2">
          <Link
            href={`/piece/${product.productCode}`}
            className="hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-warm-gray-600">
          <span className="capitalize">{product.materialCategory}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{product.productType}</span>
        </div>
        {makerName && (
          <p className="text-sm text-warm-gray-600 mt-1">by {makerName}</p>
        )}

        {/* Price */}
        <p className="font-heading text-lg font-semibold text-deep-blue mt-auto pt-3">
          {formatPrice(product.wholesalePrice)}
          <span className="text-xs font-body font-normal text-warm-gray-600 ml-1">
            ex. GST
          </span>
        </p>

        {/* Add to order + notes */}
        <div className="mt-3 space-y-3">
          {!showNotes ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowNotes(true)}
            >
              Add a note
            </Button>
          ) : (
            <div>
              <label htmlFor={noteFieldId} className="sr-only">
                Note for {product.name}
              </label>
              <textarea
                id={noteFieldId}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. preferred colour, quantity notes..."
                rows={2}
                className={`${inputClasses} text-sm resize-none`}
              />
            </div>
          )}

          {/* Quantity + Add button. Controls are tap-target sized — these were
              roughly 24x26px and are the primary interaction in this grid. */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-sand-dark rounded-md flex-shrink-0">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="tap-target flex items-center justify-center text-warm-gray-800 hover:bg-sand-light rounded-l-md focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="px-2 text-base font-medium text-warm-gray-800 min-w-[2.5rem] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(999, qty + 1))}
                className="tap-target flex items-center justify-center text-warm-gray-800 hover:bg-sand-light rounded-r-md focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={added}
              size="sm"
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
      </div>
    </div>
  );
}
