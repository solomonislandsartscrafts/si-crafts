'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, Truck, ShieldCheck, Info } from 'lucide-react';
import type { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
}

type TabId = 'details' | 'ordering' | 'care';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'details', label: 'Details', icon: Info },
  { id: 'ordering', label: 'How to Buy', icon: Store },
  { id: 'care', label: 'Care & Shipping', icon: Truck },
];

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('details');

  return (
    <div className="mt-8">
      {/* Tab headers */}
      <div className="flex border-b-2 border-sand" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`tap-target flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${
                isActive
                  ? 'border-terracotta text-deep-blue bg-sand-light rounded-t-md'
                  : 'border-transparent text-warm-gray-400 hover:text-deep-blue hover:border-sand-dark'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="py-6">
        {activeTab === 'details' && (
          <div id="panel-details" role="tabpanel">
            <DetailsPanel product={product} />
          </div>
        )}
        {activeTab === 'ordering' && (
          <div id="panel-ordering" role="tabpanel">
            <OrderingPanel />
          </div>
        )}
        {activeTab === 'care' && (
          <div id="panel-care" role="tabpanel">
            <CarePanel product={product} />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailsPanel({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      <p className="text-warm-gray-600 leading-relaxed">{product.description}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-sand-light rounded-lg p-4">
          <dt className="text-xs text-warm-gray-400 uppercase tracking-wide">Material</dt>
          <dd className="text-warm-gray-800 font-medium capitalize mt-1">{product.materialCategory}</dd>
        </div>
        <div className="bg-sand-light rounded-lg p-4">
          <dt className="text-xs text-warm-gray-400 uppercase tracking-wide">Type</dt>
          <dd className="text-warm-gray-800 font-medium capitalize mt-1">{product.productType}</dd>
        </div>
        {product.dimensions && (
          <div className="bg-sand-light rounded-lg p-4">
            <dt className="text-xs text-warm-gray-400 uppercase tracking-wide">Dimensions</dt>
            <dd className="text-warm-gray-800 font-medium mt-1">{product.dimensions}</dd>
          </div>
        )}
        <div className="bg-sand-light rounded-lg p-4">
          <dt className="text-xs text-warm-gray-400 uppercase tracking-wide">Piece Code</dt>
          <dd className="text-warm-gray-800 font-mono font-bold mt-1">{product.productCode}</dd>
        </div>
      </dl>
    </div>
  );
}

function OrderingPanel() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-ocean" />
        </div>
        <div>
          <h4 className="font-medium text-deep-blue text-sm">Wholesale Only</h4>
          <p className="text-sm text-warm-gray-600 mt-0.5">
            This piece is available to approved wholesale stockists — museum shops, galleries, and retail stores across Australia.
          </p>
        </div>
      </div>
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center flex-shrink-0">
          <Store className="w-4 h-4 text-ocean" />
        </div>
        <div>
          <h4 className="font-medium text-deep-blue text-sm">How to Order</h4>
          <p className="text-sm text-warm-gray-600 mt-0.5">
            Apply for a stockist account, browse wholesale pricing, and submit an order request. Payment is by bank transfer.
          </p>
        </div>
      </div>
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center flex-shrink-0">
          <Truck className="w-4 h-4 text-ocean" />
        </div>
        <div>
          <h4 className="font-medium text-deep-blue text-sm">Availability</h4>
          <p className="text-sm text-warm-gray-600 mt-0.5">
            Each piece is handmade — stock is limited. We confirm availability after you submit your order request.
          </p>
        </div>
      </div>
      <div className="pt-2 flex flex-wrap gap-3">
        <Link
          href="/wholesale"
          className="tap-target inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
        >
          Learn about wholesale
        </Link>
        <Link
          href="/stockist/login"
          className="tap-target inline-flex items-center gap-2 px-5 py-2.5 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          Stockist login
        </Link>
      </div>
    </div>
  );
}

function CarePanel({ product }: { product: Product }) {
  return (
    <div className="space-y-5">
      {product.careNotes && (
        <div>
          <h4 className="font-medium text-deep-blue text-sm mb-2">Care Instructions</h4>
          <p className="text-sm text-warm-gray-600 leading-relaxed">{product.careNotes}</p>
        </div>
      )}
      <div>
        <h4 className="font-medium text-deep-blue text-sm mb-2">Shipping</h4>
        <p className="text-sm text-warm-gray-600 leading-relaxed">
          We ship from our Melbourne warehouse within 3–5 business days of receiving payment. All pieces are carefully wrapped to prevent damage in transit.
        </p>
      </div>
      <div>
        <h4 className="font-medium text-deep-blue text-sm mb-2">Returns</h4>
        <p className="text-sm text-warm-gray-600 leading-relaxed">
          We accept returns for damage in transit within 7 days of delivery. Because each piece is handmade, no two are identical — we cannot accept returns for change of mind.
        </p>
      </div>
      <div>
        <h4 className="font-medium text-deep-blue text-sm mb-2">Authenticity</h4>
        <p className="text-sm text-warm-gray-600 leading-relaxed">
          Every piece comes with a product tag linking to this provenance page — your guarantee that it was handmade by the named maker in Solomon Islands.
        </p>
      </div>
    </div>
  );
}
