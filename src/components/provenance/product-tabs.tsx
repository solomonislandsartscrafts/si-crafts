'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
}

const TAB_IDS = ['specifications', 'authenticity', 'how-its-made', 'how-to-buy'] as const;
type TabId = (typeof TAB_IDS)[number];

const TAB_LABELS: Record<TabId, string> = {
  specifications: 'Specifications',
  authenticity: 'Authenticity',
  'how-its-made': 'How it\u2019s made',
  'how-to-buy': 'How to buy',
};

export function ProductTabs({ product, craftName, craftSlug }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('specifications');
  const tabListRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // Check overflow for scroll gradient indicators
  const checkOverflow = useCallback(() => {
    const el = tabListRef.current;
    if (!el) return;
    setShowLeftGradient(el.scrollLeft > 4);
    setShowRightGradient(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkOverflow();
    const el = tabListRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow, { passive: true });
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  // Keyboard navigation — left/right arrows move between tabs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = TAB_IDS.indexOf(activeTab);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TAB_IDS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = TAB_IDS[nextIndex];
    setActiveTab(nextTab);

    // Focus the new tab button
    const btn = document.getElementById(`tab-${nextTab}`);
    btn?.focus();
  };

  return (
    <div>
      {/* Tab list with scroll container */}
      <div className="relative">
        {/* Left overflow gradient */}
        {showLeftGradient && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        )}

        {/* Tab bar — horizontally scrollable, single line */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Product information"
          onKeyDown={handleKeyDown}
          className="flex overflow-x-auto scrollbar-hide border-b border-sand-dark -mb-px"
        >
          {TAB_IDS.map((id) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(id)}
                className={`tap-target relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2 ${
                  isActive
                    ? 'text-deep-blue'
                    : 'text-warm-gray-400 hover:text-warm-gray-800'
                }`}
              >
                {TAB_LABELS[id]}
                {/* Active underline indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-deep-blue rounded-t-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right overflow gradient */}
        {showRightGradient && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        )}
      </div>

      {/* Tab panels */}
      <div className="pt-5">
        <div
          role="tabpanel"
          id="panel-specifications"
          aria-labelledby="tab-specifications"
          hidden={activeTab !== 'specifications'}
          tabIndex={0}
        >
          <SpecificationsContent product={product} />
        </div>

        <div
          role="tabpanel"
          id="panel-authenticity"
          aria-labelledby="tab-authenticity"
          hidden={activeTab !== 'authenticity'}
          tabIndex={0}
        >
          <AuthenticityContent />
        </div>

        <div
          role="tabpanel"
          id="panel-how-its-made"
          aria-labelledby="tab-how-its-made"
          hidden={activeTab !== 'how-its-made'}
          tabIndex={0}
        >
          <ProcessContent
            materialCategory={product.materialCategory}
            craftName={craftName}
            craftSlug={craftSlug}
          />
        </div>

        <div
          role="tabpanel"
          id="panel-how-to-buy"
          aria-labelledby="tab-how-to-buy"
          hidden={activeTab !== 'how-to-buy'}
          tabIndex={0}
        >
          <HowToBuyContent />
        </div>
      </div>
    </div>
  );
}

function SpecificationsContent({ product }: { product: Product }) {
  return (
    <dl className="grid grid-cols-2 gap-y-5 gap-x-8">
      <div>
        <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Material</dt>
        <dd className="text-sm text-warm-gray-800 capitalize">{product.materialCategory}</dd>
      </div>
      <div>
        <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Type</dt>
        <dd className="text-sm text-warm-gray-800 capitalize">{product.productType}</dd>
      </div>
      {product.dimensions && (
        <div>
          <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Dimensions</dt>
          <dd className="text-sm text-warm-gray-800">{product.dimensions}</dd>
        </div>
      )}
      <div>
        <dt className="text-xs text-ocean uppercase tracking-wider font-semibold mb-1">Reference</dt>
        <dd className="text-sm font-mono font-bold text-warm-gray-800">{product.productCode}</dd>
      </div>
    </dl>
  );
}

function AuthenticityContent() {
  return (
    <div className="space-y-3 text-sm text-warm-gray-600 leading-relaxed">
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
    <div className="space-y-3 text-sm text-warm-gray-600 leading-relaxed">
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

function HowToBuyContent() {
  return (
    <div className="space-y-4 text-sm text-warm-gray-600 leading-relaxed">
      <p>
        Available exclusively to approved wholesale stockists. Apply for an account
        to place orders. This piece is sold to approved stockists only. Retail
        customers can find it through one of our stores.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/stockist/apply"
          className="tap-target inline-flex items-center px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white text-sm font-medium rounded-md transition-colors"
        >
          Apply for stockist account
        </Link>
        <Link
          href="/stockists"
          className="tap-target inline-flex items-center px-5 py-2.5 border border-sand-dark text-warm-gray-800 text-sm font-medium rounded-md hover:border-deep-blue hover:text-deep-blue transition-colors"
        >
          Find a stockist
        </Link>
      </div>
    </div>
  );
}
