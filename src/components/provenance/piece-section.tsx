import Image from 'next/image';
import type { Product } from '@/types';

interface PieceSectionProps {
  product: Product;
}

export function PieceSection({ product }: PieceSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-xl font-bold text-deep-blue mb-4">This Piece</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-sand">
          {product.imageUrls.length > 0 ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-warm-gray-400 text-sm">Image coming soon</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-semibold text-deep-blue">{product.name}</h3>
          <div className="inline-flex items-center gap-2 bg-sand-light rounded-md px-3 py-1.5">
            <span className="text-xs text-warm-gray-400 uppercase tracking-wide">Piece Code</span>
            <span className="text-sm font-mono font-bold text-deep-blue">{product.productCode}</span>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-warm-gray-400">Material</dt>
              <dd className="text-warm-gray-800 capitalize">{product.materialCategory}</dd>
            </div>
            <div>
              <dt className="text-warm-gray-400">Type</dt>
              <dd className="text-warm-gray-800 capitalize">{product.productType}</dd>
            </div>
            {product.dimensions && (
              <div>
                <dt className="text-warm-gray-400">Dimensions</dt>
                <dd className="text-warm-gray-800">{product.dimensions}</dd>
              </div>
            )}
            {product.careNotes && (
              <div>
                <dt className="text-warm-gray-400">Care</dt>
                <dd className="text-warm-gray-800">{product.careNotes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
