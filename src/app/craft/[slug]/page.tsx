import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCrafts, getCraftBySlug } from '@/services/crafts';
import { getMakersByCraft } from '@/services/makers';
import { getPublicProducts } from '@/services/products';
import { MakerCard } from '@/components/cards/maker-card';
import { ProductCard } from '@/components/cards/product-card';
import { SafeImage } from '@/components/ui/safe-image';
import { Breadcrumb } from '@/components/ui/breadcrumb';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: 'Crafts', url: '/crafts-and-techniques' },
          { name: craft.name },
        ]}
        className="mb-8"
      />

      {/* Header with image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 lg:mb-16">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-medium text-deep-blue mb-6">
            {craft.name}
          </h1>
          <div className="text-warm-gray-600 leading-relaxed space-y-4">
            <p>{craft.description}</p>
          </div>
        </div>
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-sand-light">
          <SafeImage
            src={craft.processImageUrls[0] || null}
            alt={`${craft.name} process`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Cultural context — only show if reviewed */}
      {craft.culturalContext && craft.culturalContextReviewFlag === 'reviewed' && (
        <section className="mb-12 lg:mb-16 bg-sand-light rounded-lg p-6 md:p-8">
          <h2 className="font-heading text-xl font-medium text-deep-blue mb-3">
            Cultural Context
          </h2>
          <p className="text-warm-gray-600 leading-relaxed">{craft.culturalContext}</p>
        </section>
      )}

      {craft.culturalContext && craft.culturalContextReviewFlag === 'unreviewed' && (
        <section className="mb-12 lg:mb-16 bg-sand-light rounded-lg p-6 md:p-8">
          <h2 className="font-heading text-xl font-medium text-deep-blue mb-3">
            Cultural Context
          </h2>
          <p className="text-warm-gray-400 italic">
            Cultural context pending review by a Solomon Islands cultural partner.
          </p>
        </section>
      )}

      {/* Makers who practise this craft */}
      <section className="mb-12 lg:mb-16 border-t border-sand pt-10 lg:pt-12">
        <h2 className="font-heading text-2xl font-medium text-deep-blue mb-6">
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
        <h2 className="font-heading text-2xl font-medium text-deep-blue mb-6">
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
