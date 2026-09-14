'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/button';
import { AccordionItem } from '@/components/ui/accordion';
import type { Product, Maker, Craft } from '@/types';
import { ImageGallery } from '@/components/provenance/image-gallery';
import { MakerSection } from '@/components/provenance/maker-section';
import { CmsInline, CmsText } from '@/components/ui/cms-text';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { ShieldCheck } from 'lucide-react';
import { ShareButtons } from '@/components/shared/share-buttons';
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
}

export function PiecePageClient({
  product,
  craftName,
  craftSlug,
  maker,
  craft,
  copy,
  tradeOnlyNotice,
}: PiecePageClientProps) {
  const [isStockist, setIsStockist] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Single-open accordion group covering "Product details" and "How it's made".
  // One shared value means opening either panel closes the other. Both start
  // closed (null), so the info column opens on collapsed rows the visitor
  // chooses to expand.
  const [openPanel, setOpenPanel] = useState<'details' | 'process' | null>(null);
  const togglePanel = (panel: 'details' | 'process') =>
    setOpenPanel((current) => (current === panel ? null : panel));

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
      {/* ─── Top section: Gallery (left) + Product Info (right). The image is
              the object; on desktop it takes the larger share (~55%) so it
              anchors the record rather than sitting small beside a long
              column. ─── */}
      <div className="grid grid-cols-1 gap-block lg:grid-cols-[1.2fr_1fr]">
        {/* Left column — Image gallery with thumbnails */}
        <div className="w-full">
          <ImageGallery images={product.imageUrls} alt={product.name} />
        </div>

        {/* Right column — Product info, museum-catalogue style: an object label
            (type + title) over a flat attributes table, the way a collection
            record presents a piece. The narrative sections still live below. */}
        <div className="flex flex-col">
          {/* Object-type eyebrow — "OBJECT | PART OF … COLLECTION" on a museum
              record. Here it names what the piece is and which craft collection
              it belongs to. */}
          <p className="mb-xs text-xs font-semibold uppercase tracking-widest text-ocean">
            <span className="capitalize">{productTypeLabel(product.productType)}</span>
            {craftName && (
              <>
                <span className="mx-2xs text-warm-gray-400" aria-hidden="true">|</span>
                {craftName && craftSlug ? (
                  <Link
                    href={`/craft/${craftSlug}`}
                    className="text-ocean transition-colors hover:text-ocean-dark"
                  >
                    {craftName} collection
                  </Link>
                ) : (
                  <span>{craftName} collection</span>
                )}
              </>
            )}
          </p>

          {/* Object title */}
          <h1 className="font-heading text-2xl sm:text-3xl font-medium text-deep-blue mb-xs">
            {product.name}
          </h1>

          {/* Gold accent bar under title */}
          <div className="w-16 h-1 bg-accent-gold rounded-full mb-sm" />

          {/* Wholesale price — stockists only, and kept quiet and inline
              directly under the title rather than boxed at the foot of the
              column. The figure still dominates (it is the one commercial fact
              a buyer scans for), but it reads as a line in the record, not a
              separate panel competing with the details below. The Add to Order
              action lives lower, in the flow, once the buyer has read the
              piece. Public pricing is a business rule — this whole block is
              gated behind `isStockist`. */}
          {isStockist && (
            <div className="mb-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray-600">
                Wholesale price
              </p>
              <p className="mt-3xs flex items-baseline gap-2xs">
                <span className="font-heading text-3xl font-semibold leading-heading text-deep-blue">
                  {formatPrice(product.wholesalePrice)}
                </span>
                <span className="text-sm text-warm-gray-600">excl. GST</span>
              </p>
            </div>
          )}

          {/* Full description, inline. This is the story of the piece and the
              reason someone scanned the code. `whitespace-pre-line` keeps the
              paragraph breaks the admin typed (plain textarea field). */}
          {product.description && (
            <p className="max-w-2xl text-base leading-body text-warm-gray-800 whitespace-pre-line mb-md">
              {product.description}
            </p>
          )}

          {/* Provenance strip — the human, trust-building facts, kept prominent
              because provenance is the point of this site. Maker, technique and
              origin sit in a light warm well as three equal facts a buyer reads
              before deciding, distinct from the drier reference specs (materials,
              dimensions, code, credit line), which are collapsed below. Each
              fact only renders when it has a value. */}
          <dl className="mb-md grid grid-cols-1 gap-xs rounded-lg bg-sand-light p-sm sm:grid-cols-3">
            {maker && (
              <ProvenanceFact
                label="Maker"
                value={
                  <Link
                    href={`/maker/${maker.slug}`}
                    className="text-ocean transition-colors hover:text-ocean-dark"
                  >
                    {maker.name}
                  </Link>
                }
              />
            )}
            {craftName && (
              <ProvenanceFact
                label="Technique"
                value={
                  craftSlug ? (
                    <Link
                      href={`/craft/${craftSlug}`}
                      className="text-ocean transition-colors hover:text-ocean-dark"
                    >
                      {craftName}
                    </Link>
                  ) : (
                    craftName
                  )
                }
              />
            )}
            <ProvenanceFact
              label="Origin"
              value={
                maker
                  ? `${maker.village}, ${maker.province}, Solomon Islands`
                  : 'Solomon Islands'
              }
            />
          </dl>

          {/* Trade action — stockists only. One clean full-width action in the
              flow of the column (not a floating card): quantity + Add to Order,
              stacked on a phone and inline from `sm` up. `ctaRef` still marks it
              for the mobile sticky bar's intersection observer. */}
          {isStockist && (
            <div ref={ctaRef} className="mb-md flex flex-col gap-xs sm:flex-row sm:items-center">
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
                fullWidth
                className={`sm:w-auto sm:flex-1 ${added ? 'bg-success/10 text-success' : ''}`}
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
          )}

          {/* Trade-only notice — public visitors. States the wholesale rule and
              links to next steps inline; the action buttons live once, in the
              "Where to buy" section below. */}
          {!isStockist && tradeOnlyNotice && (
            <div className="mb-md px-sm py-sm bg-ocean/5 border border-ocean/20 rounded-lg">
              <p className="text-sm text-warm-gray-600">
                <CmsInline
                  value={tradeOnlyNotice}
                  linkClassName="text-ocean hover:text-ocean-dark font-medium"
                />
              </p>
            </div>
          )}

          {/* Product details — the drier reference facts, collapsed so they
              don't compete with the description, provenance and buy action
              above. Part of a single-open accordion group with "How it's made"
              below (see `openPanel`): opening one closes the other. Materials,
              dimensions, the reference code and the credit line live here; rows
              only render when they have a value. */}
          <AccordionItem
            as="h2"
            title="Product details"
            isOpen={openPanel === 'details'}
            onToggle={() => togglePanel('details')}
          >
            <dl className="border-t border-sand text-base">
              <AttributeRow
                label="Materials"
                value={<span className="capitalize">{materialLabel(product.materialCategory)}</span>}
              />
              {product.dimensions && (
                <AttributeRow label="Dimensions" value={product.dimensions} />
              )}
              <AttributeRow
                label="Reference number"
                value={<span className="font-mono font-bold">{product.productCode}</span>}
              />
              <AttributeRow
                label="Credit line"
                value="Solomon Islands Arts & Crafts, on behalf of the maker"
              />
            </dl>
          </AccordionItem>

          {/* How it's made — the second panel of the single-open accordion
              group, stacked directly under "Product details" so the two read as
              one control. Shares `openPanel`, so opening this closes that (and
              vice versa). The copy is generic per material (the same for every
              pandanus piece), so it stays brief and links out to the craft page
              where the real depth lives. */}
          {copy.processText && (
            <AccordionItem
              as="h2"
              title="How it's made"
              isOpen={openPanel === 'process'}
              onToggle={() => togglePanel('process')}
            >
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
            </AccordionItem>
          )}

          {/* Where to buy — the closing call to action (not "information"),
              now stacked directly under "How it's made" so all three panels
              read as one accordion in the info column. Only shown to public
              visitors; a logged-in stockist already has the Add to Order
              control above. It is its own uncontrolled accordion (not part of
              the `openPanel` group), so it opens independently of the
              details/process panels. */}
          {!isStockist && (
            <AccordionItem as="h2" title="Where to buy">
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
            </AccordionItem>
          )}
        </div>
      </div>

      {/* ─── Authenticity — a single quiet trust line, not a bordered panel.
              The statement is the same boilerplate on every piece, so it reads
              as a reassurance in passing (icon + text) rather than a heading and
              a framed box competing with the piece's own content. ─── */}
      {copy.authenticityBody && (
        <div className="mt-lg flex items-start gap-xs text-warm-gray-600">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-ocean" aria-hidden="true" />
          <CmsText
            value={copy.authenticityBody}
            className="max-w-3xl space-y-xs"
            paragraphClassName="text-base leading-relaxed"
          />
        </div>
      )}

      {/* ─── Meet the Maker — now the closing content section. The "how" and
              the "where to buy" come first; the person behind the piece is the
              note the page ends on, in their own words. Renders nothing unless
              the maker is published (consent gate lives in MakerSection). ─── */}
      <MakerSection maker={maker} craft={craft} />

      {/* Share — moved to the foot of the page as the closing action, once the
          visitor has read the piece and met the maker. A thin rule above marks
          it off as its own line rather than crowding the maker section. */}
      <div className="flex items-center border-t border-sand pt-sm">
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
            {/* Same shared <Button> as the desktop Add-to-Order above, so the
                sticky bar can't drift from it. `fullWidth` fills the bar's
                flex-1 slot; the added state reuses the desktop success class. */}
            <Button
              onClick={handleAddToCart}
              disabled={added}
              fullWidth
              className={added ? 'flex-1 bg-success/10 text-success' : 'flex-1'}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                  Add to Order
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One provenance fact in the strip under the description: a small label over a
 * prominent value, stacked as one unit. These are the human, trust-building
 * facts (maker, technique, origin) — kept visible and equal-weight, distinct
 * from the collapsed reference specs. Only rendered by call sites that have a
 * value, so the strip never shows an empty field.
 */
function ProvenanceFact({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-warm-gray-600">
        {label}
      </dt>
      <dd className="mt-3xs text-base text-warm-gray-800">{value}</dd>
    </div>
  );
}

/**
 * One row of the collapsed "Product details" table: a fixed-width label on the
 * left, the value on the right, separated by a hairline. Only rendered by call
 * sites that have a value, so the table never shows an empty field.
 */
function AttributeRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-sm border-b border-sand py-xs sm:grid-cols-[9rem_1fr]">
      <dt className="text-sm font-semibold text-warm-gray-600">{label}</dt>
      <dd className="text-base text-warm-gray-800">{value}</dd>
    </div>
  );
}
