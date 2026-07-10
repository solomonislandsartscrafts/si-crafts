import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProductByCode } from '@/services/products';
import { getMakerById } from '@/services/makers';
import { getCraftById } from '@/services/crafts';
import {
  MakerSection,
  WhereToBuy,
} from '@/components/provenance';
import { PiecePageClient } from './piece-page-client';

interface PiecePageProps {
  params: Promise<{ productCode: string }>;
}

export default async function PiecePage({ params }: PiecePageProps) {
  const { productCode } = await params;
  const product = await getProductByCode(productCode);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-section-lg text-center">
        <h1 className="font-heading text-2xl font-bold text-deep-blue mb-4">
          Piece not found
        </h1>
        <p className="text-warm-gray-600 mb-6">
          We couldn&apos;t find a piece with the code &ldquo;{productCode}&rdquo;.
          It may have been removed or the code might be incorrect.
        </p>
        <Link
          href="/catalogue"
          className="tap-target inline-flex items-center gap-2 px-5 py-3 bg-ocean hover:bg-ocean-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
        >
          Browse the catalogue
        </Link>
      </div>
    );
  }

  const [maker, craft] = await Promise.all([
    getMakerById(product.makerId),
    getCraftById(product.craftId),
  ]);

  const publishedMaker = maker?.publishedFlag ? maker : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      {/* Back link */}
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to catalogue
      </Link>

      {/* Top section: Gallery + Product Info + Tabs */}
      <PiecePageClient product={product} />

      {/* Maker + Where to Buy */}
      <div className="mt-12 max-w-2xl">
        <MakerSection maker={publishedMaker} craft={craft} />
        <WhereToBuy />
      </div>
    </div>
  );
}
