'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/price';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/components/ui/form-field';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
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
    // One panel holding image + caption, matching the public PosterCard so the
    // catalogue does not change shape when a stockist logs in. The panel is a
    // `div`, not a link, because the caption holds buttons (a button cannot nest
    // in a link); the image and title are each their own link inside it.
    <div role="listitem" className="group flex h-full flex-col overflow-hidden rounded-lg bg-card-bg shadow-card transition-all duration-200 hover:-translate-y-1 hover:bg-section-warm hover:shadow-card-hover">
      {/* Shared poster frame — links to the piece page. `bare` so the panel owns
          the surface; same frame, fit, and hover as ProductCard. */}
      <Link
        href={`/piece/${product.productCode}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean"
      >
        <PosterFrame
          src={product.imageUrls[0] ?? null}
          alt={`${product.name}${makerName ? ` by ${makerName}` : ''}`}
          fit="contain"
          pill={materialLabel(product.materialCategory)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          bare
        />
      </Link>

      {/* Caption inside the panel. Kept outside the frame link above because it
          holds buttons, and a button cannot be nested inside a link. */}
      <div className="flex flex-1 flex-col p-sm">
        {/* The title carries its OWN hover, not the `group-hover:text-ocean`
            baked into `posterTitleClasses`: this caption sits outside the frame's
            link, so it is outside that link's `group`. Same end result — the
            title goes ocean when you point at it. */}
        <h3 className={`${posterTitleClasses} line-clamp-2`}>
          <Link
            href={`/piece/${product.productCode}`}
            className="hover:text-ocean transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
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
              className="focus-ring press-sink rounded-sm text-sm text-ocean hover:text-ocean-dark transition-colors duration-200 font-body cursor-pointer"
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
            <QuantityStepper
              value={qty}
              onChange={setQty}
              itemLabel={product.name}
              className="self-start flex-shrink-0"
            />
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
