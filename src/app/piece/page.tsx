import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { PieceLookup } from '@/components/shared/piece-lookup';

export const metadata = generatePageMetadata({
  title: 'Find Your Piece',
  description: 'Enter the product code from your tag to meet the maker behind your piece.',
  path: '/piece',
});

export default function PieceLookupPage() {
  return (
    <PageHeader
      title="Find your piece"
      align="center"
      width="narrow"
      intro="Enter the code from your product tag to meet the maker and discover the story behind your piece."
    >
      <div className="max-w-xs mx-auto mt-8">
        <PieceLookup />
      </div>
      <p className="text-sm text-warm-gray-600 mt-4">
        The code is printed on the tag attached to your product (e.g. P-J-1).
      </p>
    </PageHeader>
  );
}
