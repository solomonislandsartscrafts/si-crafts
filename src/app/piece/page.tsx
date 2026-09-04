import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout/page-header';
import { PieceLookup } from '@/components/shared/piece-lookup';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Find Your Piece',
  description: 'Enter the product code from your tag to meet the maker behind your piece.',
  path: '/piece',
});

export default async function PieceLookupPage() {
  const text = await getSiteTextSafe();

  return (
    <PageHeader
      title={text['provenance.lookupTitle']}
      align="center"
      width="narrow"
      intro={text['provenance.lookupIntro']}
    >
      <div className="max-w-xs mx-auto mt-lg">
        <PieceLookup />
      </div>
      {text['provenance.lookupHint'] && (
        <p className="text-sm text-warm-gray-600 mt-sm">{text['provenance.lookupHint']}</p>
      )}
    </PageHeader>
  );
}
