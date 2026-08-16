import Link from 'next/link';
import { getAllProducts, getProductByCode } from '@/services/products';
import { getMakerById } from '@/services/makers';
import { getCraftById } from '@/services/crafts';
import { getAllMakers } from '@/services/makers';
import { PiecePageClient } from './piece-page-client';
import { ProductCard } from '@/components/cards/product-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ productCode: p.productCode }));
}

interface PiecePageProps {
  params: Promise<{ productCode: string }>;
}

export default async function PiecePage({ params }: PiecePageProps) {
  const { productCode } = await params;
  const product = await getProductByCode(productCode);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 page-y text-center">
        <h1 className="font-heading text-2xl font-medium text-deep-blue mb-4">
          Piece not found
        </h1>
        <p className="text-warm-gray-600 mb-6">
          We couldn&apos;t find a piece with the code &ldquo;{productCode}&rdquo;.
          It may have been removed or the code might be incorrect.
        </p>
        <Link
          href="/catalogue"
          className="tap-target inline-flex items-center gap-2 px-5 py-3 btn-primary"
        >
          Browse the catalogue
        </Link>
      </div>
    );
  }

  const [maker, craft, allProducts, allMakers] = await Promise.all([
    getMakerById(product.makerId),
    getCraftById(product.craftId),
    getAllProducts(),
    getAllMakers(),
  ]);

  const publishedMaker = maker?.publishedFlag ? maker : null;

  // Get related products: same craft or same maker, excluding current product
  const relatedProducts = allProducts
    .filter((p) =>
      p.id !== product.id &&
      p.publishedFlag &&
      (p.craftId === product.craftId || p.makerId === product.makerId)
    )
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16">
      {/* Breadcrumb + Back link */}
      <div className="mb-6 flex flex-col gap-2">
        <Breadcrumb
          items={[
            { name: 'Home', url: '/' },
            { name: 'Catalogue', url: '/catalogue' },
            { name: product.name },
          ]}
        />
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors w-fit"
        >
          ← Back to Catalogue
        </Link>
      </div>

      {/* Top section: Gallery + Product Info + Maker */}
      <PiecePageClient product={product} craftName={craft?.name} craftSlug={craft?.slug} maker={publishedMaker} craft={craft} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 pt-10 border-t border-sand">
          <h2 className="font-heading text-2xl font-medium text-deep-blue mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {relatedProducts.map((relatedProduct) => {
              const relatedMaker = allMakers.find((m) => m.id === relatedProduct.makerId);
              return (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  makerName={relatedMaker?.name}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
