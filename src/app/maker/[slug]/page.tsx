import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPublicMakers, getPublicMakerBySlug } from '@/services/makers';
import { getProductsByMaker } from '@/services/products';
import { getCraftById } from '@/services/crafts';
import { ProductCard } from '@/components/cards/product-card';

export const dynamicParams = false;

export async function generateStaticParams() {
  const makers = await getPublicMakers();
  return makers.map((maker) => ({ slug: maker.slug }));
}

interface MakerPageProps {
  params: Promise<{ slug: string }>;
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
        {/* Portrait */}
        <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-sand">
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

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-2">
            {maker.name}
          </h1>
          <p className="text-lg text-warm-gray-600 mb-1">
            {maker.village}, {maker.province}
          </p>
          {craft && (
            <Link
              href={`/craft/${craft.slug}`}
              className="text-ocean hover:text-ocean-dark font-medium transition-colors mb-8"
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
        </div>
      </div>

      {/* Products grid */}
      {products.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-bold text-deep-blue mb-6">
            Pieces by {maker.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                makerName={maker.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
