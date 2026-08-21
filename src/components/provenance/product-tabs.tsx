'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { materialLabel, productTypeLabel } from '@/lib/labels';
import type { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
}

const TAB_IDS = [
  'description',
  'specifications',
  'how-its-made',
  'authenticity',
  'where-to-buy',
] as const;
type TabId = (typeof TAB_IDS)[number];

const TAB_LABELS: Record<TabId, string> = {
  description: 'Description',
  specifications: 'Specifications',
  'how-its-made': 'How it\u2019s made',
  authenticity: 'Authenticity',
  'where-to-buy': 'Where to buy',
};

/**
 * All the reference detail for a piece, gathered into one tabbed panel that
 * sits BELOW the gallery/summary row — the full description, specifications,
 * process, authenticity, and how to buy.
 *
 * The description tab carries the piece's complete text. The summary above the
 * fold shows only a 120-character preview, so without this panel the rest of
 * what the maker told us about the piece was unreadable.
 *
 * The tabs are an underlined row, not folder tabs: the active one is marked by
 * a gold bottom border over the row's own sand rule. The row wraps on narrow
 * screens rather than scrolling, so no tab can be hidden off the edge.
 */
export function ProductTabs({ product, craftName, craftSlug }: ProductTabsProps) {
  // A piece with no description gets no empty tab.
  const tabs = TAB_IDS.filter((id) => id !== 'description' || Boolean(product.description));
  const [active, setActive] = useState<TabId>(tabs[0]);

  const panels: Record<TabId, React.ReactNode> = {
    description: <DescriptionContent description={product.description} />,
    specifications: <SpecificationsContent product={product} />,
    'how-its-made': (
      <ProcessContent
        materialCategory={product.materialCategory}
        craftName={craftName}
        craftSlug={craftSlug}
      />
    ),
    authenticity: <AuthenticityContent />,
    'where-to-buy': <WhereToBuyContent />,
  };

  return (
    <div>
      {/* Tab row — underline style with gold active indicator */}
      <div
        role="tablist"
        aria-label="Piece information"
        className="flex flex-wrap gap-x-1 gap-y-2 border-b-2 border-sand"
      >
        {tabs.map((id) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              id={`tab-${id}`}
              aria-selected={isActive}
              // Only one panel is rendered at a time, so pointing an inactive
              // tab at `panel-<its own id>` would be a dangling reference.
              aria-controls={isActive ? `panel-${id}` : undefined}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(id)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                e.preventDefault();
                const i = tabs.indexOf(id);
                const next =
                  e.key === 'ArrowRight'
                    ? tabs[(i + 1) % tabs.length]
                    : tabs[(i - 1 + tabs.length) % tabs.length];
                setActive(next);
                document.getElementById(`tab-${next}`)?.focus();
              }}
              className={`tap-target relative -mb-[2px] whitespace-nowrap px-4 sm:px-5 py-2.5 text-base font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-t-md ${
                isActive
                  ? 'border-b-[3px] border-accent-gold text-deep-blue bg-ocean/5'
                  : 'border-b-[3px] border-transparent text-warm-gray-600 hover:text-ocean hover:bg-ocean/5'
              }`}
            >
              {TAB_LABELS[id]}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        // Focusable so keyboard users can Tab from the tab row into the panel
        // text, which is otherwise unreachable when it holds no links.
        tabIndex={0}
        className="rounded-b-md border border-t-0 border-sand bg-white p-5 sm:p-6"
      >
        {panels[active]}
      </div>
    </div>
  );
}

/* ─── Panel content ─────────────────────────────────────────────────────── */

/**
 * The full description, untruncated. `whitespace-pre-line` keeps the paragraph
 * breaks the admin typed, since this field is a plain textarea rather than rich
 * text.
 */
function DescriptionContent({ description }: { description: string }) {
  return (
    <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-warm-gray-800">
      {description}
    </p>
  );
}

function SpecificationsContent({ product }: { product: Product }) {
  return (
    <dl className="grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      <div>
        <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-ocean">Material</dt>
        <dd className="text-base capitalize text-warm-gray-800">
          {materialLabel(product.materialCategory)}
        </dd>
      </div>
      <div>
        <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-ocean">Type</dt>
        <dd className="text-base capitalize text-warm-gray-800">
          {productTypeLabel(product.productType)}
        </dd>
      </div>
      {product.dimensions && (
        <div>
          <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-ocean">Dimensions</dt>
          <dd className="text-base text-warm-gray-800">{product.dimensions}</dd>
        </div>
      )}
      <div>
        <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-ocean">Reference</dt>
        <dd className="text-base font-mono font-bold text-warm-gray-800">{product.productCode}</dd>
      </div>
    </dl>
  );
}

function ProcessContent({
  materialCategory,
  craftName,
  craftSlug,
}: {
  materialCategory: string;
  craftName?: string;
  craftSlug?: string;
}) {
  const PROCESS_TEXT: Record<string, string> = {
    pandanus:
      'The leaves of the pandanus tree are soaked in water with coconut husks for about a week to make them soft and pliable, then hung up to dry in the sun for several weeks and cut into strips using a special tool. The handles are made from the bark of the Wa\u2018ai tree. Black pandanus is made by boiling with leaves of the Talisay (Indian almond) tree for 2\u20133 hours before drying. The fine diagonal weaving takes days or weeks to complete.',
    wood: 'Each piece is hand-carved from a single block of \u2018kerosene wood\u2019 (Cordia subcordata) or Pacific Rosewood (Thespesia populnea). The carver shapes the wood with hand tools, then inlays pearl shell and/or contrasting wood into the design. The finished piece is polished and sealed with lacquer.',
    shells:
      'Shells are collected and fashioned by hand into very small discs about 3\u20135mm in diameter. A hole is drilled in the centre and the discs are threaded on nylon (traditionally bush twine) to form strands. Different coloured shells have different values \u2014 red-orange shells are the most expensive because they need to be baked to achieve their colour. A single necklace can take weeks to produce.',
    'bush-twine':
      '\u2018Bush-twine\u2019 is made by combining the strands and fibres of two locally-grown vines (including the Asa vine) into a single cord that is very strong. It has traditionally been used to make shields, baskets and trays. The Kusa bag is knotted from bush twine with a wide shoulder strap that has no joins \u2014 made entirely from natural resources, it is eco-friendly and very durable.',
  };

  const processText =
    PROCESS_TEXT[materialCategory] ||
    'This piece is made using traditional techniques passed down through generations.';

  return (
    <div className="max-w-3xl space-y-3 text-base leading-relaxed text-warm-gray-800">
      <p>{processText}</p>
      {craftSlug && craftName && (
        <Link
          href={`/craft/${craftSlug}`}
          className="inline-flex font-medium text-ocean transition-colors hover:text-ocean-dark"
        >
          Read more about {craftName} →
        </Link>
      )}
    </div>
  );
}

function AuthenticityContent() {
  return (
    <div className="max-w-3xl space-y-3 text-base leading-relaxed text-warm-gray-800">
      <p>
        Every piece comes with a product tag stating the maker&apos;s name and province in
        Solomon Islands, linking to this provenance page — your guarantee it was handmade by the
        named maker.
      </p>
      <p>
        For more information see{' '}
        <Link href="/our-promise" className="font-medium text-ocean hover:text-ocean-dark">
          Our Promise
        </Link>
        .
      </p>
    </div>
  );
}

function WhereToBuyContent() {
  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-base leading-relaxed text-warm-gray-800">
        We supply museum and gallery shops in Australia. Visit a stockist to buy
        a piece in person, or enquire about wholesale for your own shop.
      </p>

      <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
        <ButtonLink href="/stockists">Find a stockist</ButtonLink>
        <ButtonLink href="/wholesale" variant="secondary">
          Wholesale enquiries
        </ButtonLink>
      </div>

      <p className="text-base leading-relaxed text-warm-gray-800">
        Run a museum or gallery shop?{' '}
        <Link href="/stockist/apply" className="font-medium text-ocean hover:text-ocean-dark">
          Apply for a stockist account
        </Link>{' '}
        to see wholesale pricing and place orders.
      </p>

      <p className="border-l-[3px] border-accent-gold pl-4 text-base leading-relaxed text-warm-gray-600">
        When you buy this piece through a stockist, the maker receives the price
        they set — paid upfront, before the piece reaches Australia. No
        middlemen, no commission.{' '}
        <Link href="/our-promise" className="font-medium text-ocean hover:text-ocean-dark">
          Learn about our values →
        </Link>
      </p>
    </div>
  );
}
