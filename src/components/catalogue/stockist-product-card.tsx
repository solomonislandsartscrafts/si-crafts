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
  posterBodyClasses,
  posterTitleClasses,
} from '@/components/cards/poster-card';

/**
 * Product card for logged-in stockists — the same image-forward poster tile as
 * the public ProductCard, plus wholesale price and an Add to Order control.
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
    <div role="listitem" className="flex h-full flex-col">
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
      <div className="flex flex-1 flex-col pt-xs">
        {/* The title carries its OWN hover, not the `group-hover:text-ocean`
            baked into `posterTitleClasses`: this caption sits outside the frame's
            link, so it is outside that link's `group`. Same end result — the
            title goes ocean when you point at it. */}
        <h3 className={`${posterTitleClasses} line-clamp-2`}>
          <Link
            href={`/piece/${product.productCode}`}
            className="hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
          >
            {product.name}
          </Link>
        </h3>
        {/* Body size, matching the public ProductCard — the whole point of this
            component is that the catalogue does not change when a stockist logs
            in, and that includes the type sizes, not just the frame. */}
        {makerName && <p className={`mt-2xs ${posterBodyClasses}`}>by {makerName}</p>}

        {/* Price */}
        <p className="font-heading text-lg font-semibold text-deep-blue mt-auto pt-xs">
          {formatPrice(product.wholesalePrice)}
          <span className="text-xs font-body font-normal text-warm-gray-600 ml-3xs">
            ex. GST
          </span>
        </p>

        {/* Add to order + notes */}
        <div className="mt-xs space-y-xs">
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

          {/* Quantity + Add button, side by side. The button label is a short
              "Add" (not "Add to Order") so it fits on one line next to the 48px
              stepper even at the narrow 4-column card width. */}
          <div className="flex items-center gap-2xs">
            <div className="flex items-center self-start border border-sand-dark rounded-md flex-shrink-0">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="tap-target flex items-center justify-center text-warm-gray-800 hover:bg-sand-light rounded-l-md focus:outline-none focus:ring-2 focus:ring-ocean"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="px-2xs text-base font-medium text-warm-gray-800 min-w-[2.5rem] text-center">
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
              aria-label={
                added
                  ? `${product.name} added to order`
                  : `Add ${product.name} to order`
              }
              className={added ? 'bg-success/10 text-success' : ''}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Added
                </>
              ) : (
                'Add'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
