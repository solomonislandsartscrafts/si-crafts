import { generatePageMetadata } from '@/lib/metadata';
import { PieceLookup } from '@/components/shared/piece-lookup';

export const metadata = generatePageMetadata({
  title: 'Find Your Piece',
  description: 'Enter the product code from your tag to meet the maker behind your piece.',
  path: '/piece',
});

export default function PieceLookupPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 page-y text-center">
      <h1 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-3">
        Find your piece
      </h1>
      <p className="text-warm-gray-600 mb-8">
        Enter the code from your product tag to meet the maker and discover the story behind your piece.
      </p>
      <div className="max-w-xs mx-auto">
        <PieceLookup />
      </div>
      <p className="text-xs text-warm-gray-400 mt-4">
        The code is printed on the tag attached to your product (e.g. P-J-1).
      </p>
    </div>
  );
}
