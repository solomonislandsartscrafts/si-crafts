'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { materialLabel, productTypeLabel } from '@/lib/labels';
import type { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
}

const SECTION_IDS = ['details', 'how-its-made', 'authenticity', 'where-to-buy'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_LABELS: Record<SectionId, string> = {
  details: 'Details',
  'how-its-made': 'How it\u2019s made',
  authenticity: 'Authenticity',
  'where-to-buy': 'Where to buy',
};

/**
 * Reference information for a piece, presented as an accordion on all screens.
 *
 * All labels are always visible, content opens directly beneath its trigger,
 * and large tap targets make it comfortable at every screen size.
 */
export function ProductTabs({ product, craftName, craftSlug }: ProductTabsProps) {
  const [active, setActive] = useState<SectionId | null>('details');

  const panels: Record<SectionId, React.ReactNode> = {
    details: <DetailsContent product={product} />,
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
    <div className="border-t border-sand">
      {SECTION_IDS.map((id) => {
        const isOpen = active === id;
        return (
          <div key={id} className="border-b border-sand">
            {/* h2, not h3: these sections are siblings of "Meet the Maker",
                not subsections of it. Nesting them under it told screen
                reader users that "Where to buy" was part of the maker's bio. */}
            <h2>
              <button
                type="button"
                id={`acc-trigger-${id}`}
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${id}`}
                onClick={() => setActive(isOpen ? null : id)}
                className="tap-target w-full flex items-center justify-between gap-3 py-4 text-left font-heading text-base font-semibold text-deep-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
              >
                {SECTION_LABELS[id]}
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-warm-gray-600 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h2>
            <div
              role="region"
              id={`acc-panel-${id}`}
              aria-labelledby={`acc-trigger-${id}`}
              hidden={!isOpen}
              className="pb-5"
            >
              {panels[id]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailsContent({ product }: { product: Product }) {
  return (
    <dl className="grid grid-cols-2 gap-y-5 gap-x-8">
      <div>
        <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Material</dt>
        <dd className="text-base text-warm-gray-800 capitalize">
          {materialLabel(product.materialCategory)}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Type</dt>
        <dd className="text-base text-warm-gray-800 capitalize">
          {productTypeLabel(product.productType)}
        </dd>
      </div>
      {product.dimensions && (
        <div>
          <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Dimensions</dt>
          <dd className="text-base text-warm-gray-800">{product.dimensions}</dd>
        </div>
      )}
      <div>
        <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Reference</dt>
        <dd className="text-base font-mono font-bold text-warm-gray-800">{product.productCode}</dd>
      </div>
    </dl>
  );
}

function AuthenticityContent() {
  return (
    <div className="space-y-3 text-base text-warm-gray-600 leading-relaxed">
      <p>
        Every piece comes with a product tag stating the maker&apos;s name and province in
        Solomon Islands, linking to this provenance page — your guarantee it was handmade by the
        named maker.
      </p>
      <p>
        For more information see{' '}
        <Link href="/our-promise" className="text-ocean hover:text-ocean-dark font-medium">
          Our Promise
        </Link>
        .
      </p>
    </div>
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
    <div className="space-y-3 text-base text-warm-gray-600 leading-relaxed">
      <p>{processText}</p>
      {craftSlug && craftName && (
        <Link
          href={`/craft/${craftSlug}`}
          className="inline-flex text-ocean hover:text-ocean-dark font-medium transition-colors"
        >
          Read more about {craftName} →
        </Link>
      )}
    </div>
  );
}

function WhereToBuyContent() {
  return (
    <div className="space-y-5">
      <p className="text-base text-warm-gray-600 leading-relaxed">
        We supply museum and gallery shops in Australia. Visit a stockist to buy
        a piece in person, or enquire about wholesale for your own shop.
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <ButtonLink href="/stockists">Find a stockist</ButtonLink>
        <ButtonLink href="/wholesale" variant="secondary">
          Wholesale enquiries
        </ButtonLink>
      </div>

      <p className="text-base text-warm-gray-600 leading-relaxed">
        Run a museum or gallery shop?{' '}
        <Link
          href="/stockist/apply"
          className="text-ocean hover:text-ocean-dark font-medium"
        >
          Apply for a stockist account
        </Link>{' '}
        to see wholesale pricing and place orders.
      </p>

      <p className="text-base text-warm-gray-600 border-l-2 border-sand pl-4 leading-relaxed">
        When you buy this piece through a stockist, the maker receives the price
        they set — paid upfront, before the piece reaches Australia. No
        middlemen, no commission.{' '}
        <Link
          href="/our-promise"
          className="text-ocean hover:text-ocean-dark font-medium"
        >
          Learn about our values →
        </Link>
      </p>
    </div>
  );
}
