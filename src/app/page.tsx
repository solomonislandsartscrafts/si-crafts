import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { ProductCard } from '@/components/cards/product-card';
import { PieceLookup } from '@/components/shared/piece-lookup';

export const metadata = generatePageMetadata({
  title: 'Solomon Islands Arts and Crafts',
  description:
    'Authentic Solomon Islands handicrafts. Meet the makers behind every piece of pandanus weaving, wood carving, and shell-money jewellery.',
  path: '/',
});

export default async function HomePage() {
  const [products, makers] = await Promise.all([
    getPublicProducts(),
    getPublicMakers(),
  ]);

  const featuredProducts = products.slice(0, 6);
  const sampleProductCode = products[0]?.productCode;

  return (
    <div className="flex flex-col">
      {/* Hero Section — split layout: text left, image right */}
      <section className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 md:py-20 lg:py-28">
            {/* Left: Text + CTA */}
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-deep-blue leading-heading">
                Solomon Islands<br />Arts &amp; Crafts
              </h1>

              <p className="mt-6 text-lg md:text-xl text-warm-gray-800 font-medium uppercase tracking-wide">
                Behind every piece, a story. Find yours.
              </p>

              {/* Code input — the distinctive feature */}
              <div className="mt-6 max-w-xs">
                <PieceLookup />
              </div>

              {/* Buttons below */}
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href="/catalogue"
                  className="tap-target inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
                >
                  Browse Catalogue
                </Link>
                <Link
                  href="/makers"
                  className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                >
                  Meet the Makers
                </Link>
              </div>
            </div>

            {/* Right: Cover image — circular mask */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-[450px] h-[450px] rounded-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Cover.png"
                  alt="Solomon Islands handcraft"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products — full width background */}
      <section className="w-full py-section-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
                Featured Crafts
              </h2>
              <p className="text-warm-gray-600 mt-2">
                Handmade pieces from across Solomon Islands.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {featuredProducts.map((product) => {
              const maker = makers.find((m) => m.id === product.makerId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  makerName={maker?.name}
                />
              );
            })}
          </div>
        </div>
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-sm font-medium text-ocean"
          >
            View all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Provenance Teaser + Wholesale CTA */}
      <section className="border-t border-ocean/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Provenance teaser */}
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
                Every tag tells a story
              </h2>
              <p className="text-warm-gray-600 leading-relaxed mb-6">
                Scan the QR code on any product tag to meet the maker — see who made your piece, 
                how it was made, and where it comes from. No app needed, no login required.
              </p>
              {sampleProductCode && (
                <Link
                  href={`/piece/${sampleProductCode}`}
                  className="tap-target inline-flex items-center gap-2 px-5 py-3 bg-ocean hover:bg-ocean-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                >
                  See an example tag
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Wholesale CTA */}
            <div className="bg-card-bg rounded-lg p-8 shadow-card">
              <h3 className="font-heading text-xl font-bold text-deep-blue mb-3">
                Stock SI Crafts in your shop
              </h3>
              <p className="text-warm-gray-600 mb-6">
                We supply museum shops and galleries across Australia with authentic 
                Solomon Islands handicrafts at wholesale prices.
              </p>
              <Link
                href="/wholesale"
                className="tap-target inline-flex items-center gap-2 px-5 py-3 border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
              >
                Learn about wholesale
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
