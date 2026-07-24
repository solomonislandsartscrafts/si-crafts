import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Store } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPublicMakers, getPublicMakerBySlug } from '@/services/makers';
import { getProductsByMaker } from '@/services/products';
import { getCraftById } from '@/services/crafts';
import { ProductCard } from '@/components/cards/product-card';
import type { Product } from '@/types';

export async function generateStaticParams() {
  const makers = await getPublicMakers();
  return makers.map((maker) => ({ slug: maker.slug }));
}

interface MakerPageProps {
  params: Promise<{ slug: string }>;
}

/** Group products by productType and return sorted groups */
function groupProductsByType(products: Product[]): { type: string; items: Product[] }[] {
  const groups: Record<string, Product[]> = {};
  for (const product of products) {
    const type = product.productType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(product);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => ({ type, items }));
}

export default async function MakerPage({ params }: MakerPageProps) {
  const { slug } = await params;
  const maker = await getPublicMakerBySlug(slug);

  if (!maker) {
    notFound();
  }

  const [products, craft] = await Promise.all([
    getProductsByMaker(maker.id),
    getCraftById(maker.craftId),
  ]);

  const productGroups = groupProductsByType(products);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Back link */}
      <Link
        href="/makers"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all makers
      </Link>

      {/* Maker profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        {/* Portrait — shorter on mobile so name/story stays visible */}
        <div className="aspect-square md:aspect-[3/4] relative rounded-lg overflow-hidden bg-sand">
          {maker.portraitUrl ? (
            <Image
              src={maker.portraitUrl}
              alt={`${maker.name} from ${maker.village}, ${maker.province}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-warm-gray-400 text-sm">Photo coming soon</span>
            </div>
          )}
        </div>

        {/* Info — wrapped in subtle card for visual grouping */}
        <div className="flex flex-col justify-center bg-sand-light rounded-xl p-6 md:p-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-2">
            {maker.name}
          </h1>
          <p className="text-lg text-warm-gray-600 mb-3">
            {maker.village}, {maker.province}
          </p>

          {/* Craft badge */}
          {craft && (
            <Link
              href={`/craft/${craft.slug}`}
              className="inline-block bg-ocean/10 text-ocean px-3 py-1 rounded-full text-sm font-medium hover:bg-ocean/20 transition-colors w-fit mb-6"
            >
              {craft.name}
            </Link>
          )}

          {/* Story — first-person voice */}
          {maker.story ? (
            <blockquote className="text-warm-gray-600 leading-relaxed italic border-l-4 border-terracotta pl-4">
              &ldquo;{maker.story}&rdquo;
            </blockquote>
          ) : (
            <p className="text-warm-gray-400 italic">
              Story pending cultural review.
            </p>
          )}

          {/* Scroll prompt */}
          {products.length > 0 && (
            <a href="#pieces" className="inline-flex items-center gap-1.5 mt-8 text-sm text-ocean hover:text-ocean-dark transition-colors">
              <span>View pieces by {maker.name}</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Products section */}
      {products.length > 0 && (
        <section id="pieces" className="border-t border-sand pt-12 mt-16 scroll-mt-24">
          {/* Heading with count */}
          <h2 className="font-heading text-2xl font-bold text-deep-blue mb-8">
            Pieces by {maker.name}
            <span className="text-base font-normal text-warm-gray-600 ml-2">
              ({products.length})
            </span>
          </h2>

          {/* Products grouped by type */}
          {productGroups.length > 1 ? (
            <div className="space-y-12">
              {productGroups.map((group) => (
                <div key={group.type}>
                  <h3 className="font-heading text-lg font-semibold text-deep-blue mb-4 capitalize">
                    {group.type}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        makerName={maker.name}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  makerName={maker.name}
                />
              ))}
            </div>
          )}

          {/* Wholesale enquiry CTA */}
          <div className="mt-12 pt-8 border-t border-sand text-center">
            <p className="text-warm-gray-600 mb-4">
              Interested in stocking {maker.name}&apos;s pieces?
            </p>
            <Link
              href="/wholesale"
              className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              <Store className="w-4 h-4" />
              Wholesale Enquiry
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
