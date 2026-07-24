'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { IconAuthenticity, IconWovenBasket, IconCanoe } from '@/components/icons/craft-icons';
import type { Product } from '@/types';
import { ShareButtons } from '@/components/shared/share-buttons';

interface ProductInfoProps {
  product: Product;
  craftName?: string;
  craftSlug?: string;
}

export function ProductTabs({ product, craftName, craftSlug }: ProductInfoProps) {
  return (
    <div className="mt-8">
      {/* Accordion sections */}
      <div className="space-y-3">
        <AccordionItem title="How to Buy">
          <OrderingContent />
        </AccordionItem>
        <AccordionItem title="Authenticity">
          <AuthenticityContent />
        </AccordionItem>
        <AccordionItem title="How is this made?">
          <ProcessContent materialCategory={product.materialCategory} craftName={craftName} craftSlug={craftSlug} />
        </AccordionItem>
      </div>

      {/* Share */}
      <div className="pt-6">
        <ShareButtons title={product.name} />
      </div>
    </div>
  );
}

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = `accordion-panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className={`transition-colors duration-200 ${open ? 'bg-white rounded-lg -mx-3 px-3 shadow-sm border border-sand' : 'border-b border-sand'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="tap-target w-full flex items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm transition-colors"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className={`font-heading text-sm font-semibold transition-colors duration-200 ${open ? 'text-ocean' : 'text-deep-blue'}`}>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180 text-ocean' : 'text-warm-gray-400'}`} />
      </button>
      {open && (
        <div id={panelId} className="pb-5 px-4 text-sm text-warm-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function OrderingContent() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <IconAuthenticity className="w-4 h-4 text-ocean mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-deep-blue">Wholesale Only</p>
          <p className="mt-0.5">This piece is available to approved wholesale stockists — museum shops, gallery shops, and retail stores in Australia.</p>
        </div>
      </div>
      <div className="flex gap-3 items-start">
        <IconWovenBasket className="w-4 h-4 text-ocean mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-deep-blue">How to Order</p>
          <p className="mt-0.5">Apply for a stockist account, browse wholesale pricing, and submit an order request. Payment is by bank transfer after we confirm availability and provide an invoice.</p>
        </div>
      </div>
      <div className="flex gap-3 items-start">
        <IconCanoe className="w-4 h-4 text-ocean mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-deep-blue">Availability</p>
          <p className="mt-0.5">Each piece is handmade — stock is limited. We confirm availability after you submit your order request. You will only be charged for the items that we can supply from the makers.</p>
        </div>
      </div>
      <div className="border-t border-sand pt-3 mt-3">
        <p>
          <strong className="text-deep-blue">Retail customer?</strong> Find this piece at one of our{' '}
          <Link href="/stockists" className="text-ocean hover:underline">stocking retailers</Link>.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/wholesale"
          className="tap-target inline-flex items-center px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
        >
          Learn about wholesale
        </Link>
      </div>
    </div>
  );
}

function AuthenticityContent() {
  return (
    <div className="space-y-3">
      <p>
        Every piece comes with a product tag stating the name and province (in Solomon Islands) of the maker
        and linking to this provenance page — your guarantee that it was handmade by the named maker in Solomon Islands.
      </p>
      <p>
        For more information see{' '}
        <Link href="/our-promise" className="text-ocean hover:text-ocean-dark font-medium">Our Promise</Link>.
      </p>
    </div>
  );
}

function ProcessContent({ materialCategory, craftName, craftSlug }: { materialCategory: string; craftName?: string; craftSlug?: string }) {
  const PROCESS_TEXT: Record<string, string> = {
    pandanus: 'The leaves of the pandanus tree are soaked in water with coconut husks for about a week to make them soft and pliable, then hung up to dry in the sun for several weeks and cut into strips using a special tool. The handles are made from the bark of the Wa\'ai tree. Black pandanus is made by boiling with leaves of the Talisay (Indian almond) tree for 2–3 hours before drying. The fine diagonal weaving takes days or weeks to complete.',
    wood: 'Each piece is hand-carved from a single block of \'kerosene wood\' (Cordia subcordata) or Pacific Rosewood (Thespesia populnea). The carver shapes the wood with hand tools, then inlays pearl shell and/or contrasting wood into the design. The finished piece is polished and sealed with lacquer. Kerosene wood is termite resistant, making it ideal for long-lasting functional items.',
    shells: 'Shells are collected and fashioned by hand into very small discs about 3–5mm in diameter. A hole is drilled in the centre and the discs are threaded on nylon (traditionally bush twine) to form strands. Different coloured shells have different values — red-orange shells are the most expensive because they need to be baked to achieve their colour. A single necklace can take weeks to produce.',
    'bush-twine': '\'Bush-twine\' is made by combining the strands and fibres of two locally-grown vines (including the Asa vine) into a single cord that is very strong. It has traditionally been used to make shields, baskets and trays. The Kusa bag is knotted from bush twine with a wide shoulder strap that has no joins — made entirely from natural resources, it is eco-friendly and very durable.',
  };

  const processText = PROCESS_TEXT[materialCategory] || 'This piece is made using traditional techniques passed down through generations.';

  return (
    <div className="space-y-3">
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

const TRUNCATE_LENGTH = 120;

function TruncatedDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > TRUNCATE_LENGTH;

  if (!needsTruncation) {
    return <p className="text-warm-gray-600 leading-relaxed mb-6">{text}</p>;
  }

  return (
    <div className="mb-6">
      <p className="text-warm-gray-600 leading-relaxed">
        {expanded ? text : `${text.slice(0, TRUNCATE_LENGTH).trim()}...`}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}
