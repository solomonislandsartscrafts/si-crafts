'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/button';
import type { Product, Maker, Craft } from '@/types';
import { ImageGallery } from '@/components/provenance/image-gallery';
import { MakerSection } from '@/components/provenance/maker-section';
import { CmsInline, CmsText } from '@/components/ui/cms-text';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { ShieldCheck } from 'lucide-react';
import { ShareButtons } from '@/components/shared/share-buttons';
import { FlagDivider } from '@/components/layout/flag-divider';
import { addToCart } from '@/lib/cart';
import { materialLabel, productTypeLabel } from '@/lib/labels';
import { formatPrice } from '@/lib/price';
import { validateStockistSession } from '@/lib/auth-client';

/**
 * Admin-editable provenance copy, resolved on the server. `processText` is
 * already resolved for the piece's material.
 */
export interface ProvenanceCopy {
  processText: string;
  authenticityBody: string;
  whereToBuyIntro: string;
  whereToBuyShopPrompt: string;
  whereToBuyQuote: string;
}

interface PiecePageClientProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
  maker?: Maker | null;
  craft?: Craft | null;
  /** Admin-editable provenance copy, resolved on the server. */
  copy: ProvenanceCopy;
  tradeOnlyNotice: string;
  makerStoryFallback: string;
}

export function PiecePageClient({
  product,
  craftName,
  craftSlug,
  maker,
  craft,
  copy,
  tradeOnlyNotice,
  makerStoryFallback,
}: PiecePageClientProps) {
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
    <div className="space-y-block">
      {/* ─── Top section: Gallery (left) + Product Info (right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-block">
        {/* Left column — Image gallery with thumbnails */}
        <div className="w-full">
          <ImageGallery images={product.imageUrls} alt={product.name} />
        </div>

        {/* Right column — Product info */}
        <div className="flex flex-col">
          {/* Category pill */}
          <p className="mb-xs">
            {craftName && craftSlug ? (
              <Link
                href={`/craft/${craftSlug}`}
                className="inline-block text-sm font-medium text-ocean bg-ocean/10 px-xs py-3xs rounded-full hover:bg-ocean/20 transition-colors"
              >
                {craftName}
              </Link>
            ) : (
              <span className="inline-block text-sm font-medium text-ocean bg-ocean/10 px-xs py-3xs rounded-full">
                {materialLabel(product.materialCategory)}
              </span>
            )}
          </p>

          {/* Product name */}
          <h1 className="font-heading text-2xl sm:text-3xl font-medium text-deep-blue mb-xs">
            {product.name}
          </h1>

          {/* Gold accent bar under title */}
          <div className="w-16 h-1 bg-accent-gold rounded-full mb-sm" />

          {/* Full description, inline. This is the story of the piece and the
              reason someone scanned the code — shown in full here rather than
              teased and hidden behind a tab. Set as a lead paragraph (larger,
              looser) so the eye has a clear entry point, and capped to a
              comfortable reading measure so the line length stays readable on a
              wide right column. `whitespace-pre-line` keeps the paragraph breaks
              the admin typed (plain textarea field). */}
          {product.description && (
            <p className="max-w-2xl text-lg leading-body-lg text-warm-gray-800 whitespace-pre-line mb-sm">
              {product.description}
            </p>
          )}

          {/* Price — stockists only */}
          {isStockist && (
            <p className="font-heading text-2xl font-semibold text-deep-blue mb-sm">
              {formatPrice(product.wholesalePrice)}
              <span className="text-sm text-warm-gray-400 font-body font-normal ml-2xs">ex. GST</span>
            </p>
          )}

          {/* Add to order — stockists only */}
          {isStockist && (
            <div ref={ctaRef} className="mb-md">
              <div className="flex items-center gap-xs">
                <QuantityStepper
                  value={qty}
                  onChange={setQty}
                  itemLabel={product.name}
                  className="bg-white"
                  valueClassName="px-xs text-base font-medium text-deep-blue border-x border-sand-dark min-w-[3rem] text-center"
                />
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

          {/* Key facts — the former Specifications tab, now inline so nothing is
              hidden. Dimensions only render when the piece has them. */}
          <dl className="grid grid-cols-2 gap-sm py-sm border-y border-sand">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ocean mb-3xs">Category</dt>
              <dd className="text-base capitalize text-warm-gray-800">
                {materialLabel(product.materialCategory)}, {productTypeLabel(product.productType)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-ocean mb-3xs">Reference</dt>
              <dd className="font-mono font-bold text-warm-gray-800">{product.productCode}</dd>
            </div>
            {product.dimensions && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ocean mb-3xs">Dimensions</dt>
                <dd className="text-base text-warm-gray-800">{product.dimensions}</dd>
              </div>
            )}
          </dl>

          {/* Trade-only badge */}
          {!isStockist && tradeOnlyNotice && (
            <div className="mt-md px-sm py-xs bg-ocean/5 border border-ocean/20 rounded-lg">
              <p className="text-sm text-warm-gray-600">
                <CmsInline
                  value={tradeOnlyNotice}
                  linkClassName="text-ocean hover:text-ocean-dark font-medium"
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── How it's made — promoted directly under the piece, where "Meet the
              Maker" used to lead. The copy is generic per material (the same for
              every pandanus piece), so it stays brief and links out to the craft
              page where the real depth lives, rather than filling a prominent
              panel. ─── */}
      {copy.processText && (
        <section className="mt-lg border-t border-sand pt-md">
          <h2 className="font-heading text-2xl font-medium text-deep-blue">
            How it&apos;s made
          </h2>
          <FlagDivider variant="mark" className="mt-xs mb-sm" />
          <CmsText
            value={copy.processText}
            className="max-w-2xl space-y-xs"
            paragraphClassName="text-base leading-relaxed text-warm-gray-800"
          />
          {craftSlug && craftName && (
            <Link
              href={`/craft/${craftSlug}`}
              className="mt-sm inline-flex font-medium text-ocean transition-colors hover:text-ocean-dark"
            >
              Read more about {craftName} →
            </Link>
          )}
        </section>
      )}

      {/* ─── Authenticity — a quiet trust line, not a panel of boilerplate.
              The full statement, if the admin has written one, sits below it. ─── */}
      {copy.authenticityBody && (
        <section className="mt-lg">
          <div className="flex items-start gap-xs rounded-lg bg-ocean/5 border border-ocean/20 p-md">
            <ShieldCheck className="w-6 h-6 flex-shrink-0 text-ocean" aria-hidden="true" />
            <div className="max-w-3xl">
              <h2 className="font-heading text-lg font-semibold text-deep-blue mb-2xs">
                Authenticity &amp; provenance
              </h2>
              <CmsText
                value={copy.authenticityBody}
                className="space-y-xs"
                paragraphClassName="text-base leading-relaxed text-warm-gray-800"
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Where to buy — the closing call to action (not "information").
              Only shown to public visitors; a logged-in stockist already has
              the Add to Order control above. ─── */}
      {!isStockist && (
        <section className="mt-lg border-t border-sand pt-md">
          <h2 className="font-heading text-2xl font-medium text-deep-blue">
            Where to buy
          </h2>
          <FlagDivider variant="mark" className="mt-xs mb-sm" />
          <div className="max-w-2xl space-y-md">
            <CmsText
              value={copy.whereToBuyIntro}
              className="space-y-xs"
              paragraphClassName="text-base leading-relaxed text-warm-gray-800"
            />
            <div className="flex flex-col flex-wrap gap-xs sm:flex-row">
              <ButtonLink href="/stockists">Find a stockist</ButtonLink>
              <ButtonLink href="/wholesale" variant="secondary">
                Wholesale enquiries
              </ButtonLink>
            </div>
            {copy.whereToBuyShopPrompt && (
              <CmsText
                value={copy.whereToBuyShopPrompt}
                className="space-y-xs"
                paragraphClassName="text-base leading-relaxed text-warm-gray-800"
              />
            )}
            {copy.whereToBuyQuote && (
              <CmsText
                value={copy.whereToBuyQuote}
                className="border-l-[3px] border-accent-gold pl-sm space-y-xs"
                paragraphClassName="text-base leading-relaxed text-warm-gray-600"
              />
            )}
          </div>
        </section>
      )}

      {/* ─── Meet the Maker — now the closing content section. The "how" and
              the "where to buy" come first; the person behind the piece is the
              note the page ends on, in their own words. Renders nothing unless
              the maker is published (consent gate lives in MakerSection). ─── */}
      <MakerSection maker={maker} craft={craft} storyFallback={makerStoryFallback} />

      {/* ─── Share — at the bottom after content ─── */}
      <div className="flex items-center justify-center py-sm border-t border-sand">
        <ShareButtons title={product.name} />
      </div>

      {/* Sticky bottom bar — mobile only, stockists only */}
      {isStockist && showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-20 lg:hidden p-xs bg-white border-t border-sand shadow-md">
          <div className="max-w-site mx-auto flex items-center gap-xs">
            <div className="flex-shrink-0">
              <p className="text-sm font-bold text-deep-blue">{formatPrice(product.wholesalePrice)}</p>
              <p className="text-xs text-warm-gray-600 truncate max-w-[120px]">{product.name}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`tap-target flex-1 px-sm py-xs rounded-md font-medium transition-colors ${
                added
                  ? 'inline-flex items-center justify-center gap-2xs bg-success/10 text-success'
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
                  <ShoppingCart className="w-4 h-4 inline mr-3xs" />
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
