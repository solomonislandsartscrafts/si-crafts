import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllProducts, getProductByCode } from '@/services/products';
import { getMakerById } from '@/services/makers';
import { getCraftById } from '@/services/crafts';
import { PiecePageClient } from './piece-page-client';

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

  const [maker, craft, allProducts] = await Promise.all([
    getMakerById(product.makerId),
    getCraftById(product.craftId),
    getAllProducts(),
  ]);

  const publishedMaker = maker?.publishedFlag ? maker : null;

  // Find prev/next products for navigation
  const currentIndex = allProducts.findIndex((p) => p.productCode === productCode);
  const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex >= 0 && currentIndex < allProducts.length - 1
    ? allProducts[currentIndex + 1]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to catalogue
        </Link>
        <div className="flex items-center gap-4">
          {prevProduct && (
            <Link
              href={`/piece/${prevProduct.productCode}`}
              className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Prev
            </Link>
          )}
          {nextProduct && (
            <Link
              href={`/piece/${nextProduct.productCode}`}
              className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark transition-colors"
            >
              Next item
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Top section: Gallery + Product Info + Maker */}
      <PiecePageClient product={product} craftName={craft?.name} craftSlug={craft?.slug} maker={publishedMaker} craft={craft} />
    </div>
  );
}
