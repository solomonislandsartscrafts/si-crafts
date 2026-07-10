import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAllCrafts, getCraftBySlug } from '@/services/crafts';
import { getMakersByCraft } from '@/services/makers';
import { getPublicProducts } from '@/services/products';
import { MakerCard } from '@/components/cards/maker-card';
import { ProductCard } from '@/components/cards/product-card';

export const dynamicParams = false;

export async function generateStaticParams() {
  const crafts = await getAllCrafts();
  return crafts.map((craft) => ({ slug: craft.slug }));
}

interface CraftPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CraftPage({ params }: CraftPageProps) {
  const { slug } = await params;
  const craft = await getCraftBySlug(slug);

  if (!craft) {
    notFound();
  }

  const [makers, products] = await Promise.all([
    getMakersByCraft(craft.id),
    getPublicProducts({ materialCategory: craft.materialCategory }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Back link */}
      <Link
        href="/crafts-and-techniques"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All crafts & techniques
      </Link>

      {/* Header with image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-6">
            {craft.name}
          </h1>
          <div className="text-warm-gray-600 leading-relaxed space-y-4">
            <p>{craft.description}</p>
          </div>
        </div>
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-sand">
          {craft.processImageUrls.length > 0 ? (
            <Image
              src={craft.processImageUrls[0]}
              alt={`${craft.name} process`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-warm-gray-400 text-sm">Process image coming soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Cultural context — only show if reviewed */}
      {craft.culturalContext && craft.culturalContextReviewFlag === 'reviewed' && (
        <section className="mb-16 bg-sand-light rounded-lg p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-deep-blue mb-3">
            Cultural Context
          </h2>
          <p className="text-warm-gray-600 leading-relaxed">{craft.culturalContext}</p>
        </section>
      )}

      {craft.culturalContext && craft.culturalContextReviewFlag === 'unreviewed' && (
        <section className="mb-16 bg-sand-light rounded-lg p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-deep-blue mb-3">
            Cultural Context
          </h2>
          <p className="text-warm-gray-400 italic">
            Cultural context pending review by a Solomon Islands cultural partner.
          </p>
        </section>
      )}

      {/* Makers who practise this craft */}
      <section className="mb-16">
        <h2 className="font-heading text-2xl font-bold text-deep-blue mb-6">
          Makers
        </h2>
        {makers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {makers.map((maker) => (
              <MakerCard key={maker.id} maker={maker} craftName={craft.name} />
            ))}
          </div>
        ) : (
          <p className="text-warm-gray-600">
            No makers currently available for this craft. Check back soon.
          </p>
        )}
      </section>

      {/* Products in this material category */}
      <section>
        <h2 className="font-heading text-2xl font-bold text-deep-blue mb-6">
          Products
        </h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => {
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
        ) : (
          <p className="text-warm-gray-600">
            No products currently available in this category. Check back soon.
          </p>
        )}
      </section>
    </div>
  );
}
