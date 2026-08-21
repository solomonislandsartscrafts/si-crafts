'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/price';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/components/ui/form-field';
import { materialLabel } from '@/lib/labels';
import {
  PosterFrame,
  posterMetaClasses,
  posterTitleClasses,
} from '@/components/cards/poster-card';

/**
 * Product card for logged-in stockists — adds price and an Add to Order
 * control.
 *
 * Uses `PosterFrame` rather than `PosterCard` because the caption contains
 * buttons, and a button cannot be nested inside a link. The frame and caption
 * typography come from the same shared source as ProductCard, so the catalogue
 * does not change appearance when a stockist logs in.
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
    <div className="flex h-full flex-col">
      {/* Shared poster frame — links to the piece page. Same frame, fit, and
          hover as ProductCard, so the catalogue does not change shape when a
          stockist logs in. */}
      <Link
        href={`/piece/${product.productCode}`}
        className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean"
      >
        <PosterFrame
          src={product.imageUrls[0] ?? null}
          alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
          fit="contain"
          pill={materialLabel(product.materialCategory)}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </Link>

      {/* Caption below the frame. Kept outside the link above because it holds
          buttons, and a button cannot be nested inside a link. */}
      <div className="flex flex-1 flex-col pt-3">
        <h3 className={`${posterTitleClasses} line-clamp-2`}>
          <Link
            href={`/piece/${product.productCode}`}
            className="hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
          >
            {product.name}
          </Link>
        </h3>
        {makerName && <p className={`mt-1 ${posterMetaClasses}`}>by {makerName}</p>}

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
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-sm text-ocean hover:text-ocean-dark transition-colors duration-200 font-body cursor-pointer"
            >
              Add a note
            </button>
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
              roughly 24x26px and are the primary interaction in this grid.
              They stack on a phone because the grid is two columns there, and a
              48px stepper alongside a button does not fit one column wide. */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center self-start border border-sand-dark rounded-md flex-shrink-0">
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
