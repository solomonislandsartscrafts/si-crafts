import { generatePageMetadata } from '@/lib/metadata';
import { getPublicMakers } from '@/services/makers';
import { getAllCrafts } from '@/services/crafts';
import { getSiteTextSafe } from '@/services/site-text';
import { MakersPageContent } from './makers-page-content';

export const metadata = generatePageMetadata({
  title: 'Makers',
  description:
    'Meet the people behind the crafts — weavers, carvers, and jewellers from across Solomon Islands.',
  path: '/makers',
});

export default async function MakersPage() {
  const [makers, crafts, text] = await Promise.all([
    getPublicMakers(),
    getAllCrafts(),
    getSiteTextSafe(),
  ]);

  const makersWithCraft = makers.map((m) => ({
    ...m,
    craftName: crafts.find((c) => c.id === m.craftId)?.name || '',
  }));

  return (
    <MakersPageContent
      makers={makersWithCraft}
      title={text['makers.title']}
      intro={text['makers.intro']}
      filterHeading={text['makers.filterHeading']}
      filterHint={text['makers.filterHint']}
      emptyTitle={text['makers.emptyTitle']}
      emptyDescription={text['makers.emptyDescription']}
    />
  );
}
