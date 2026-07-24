import { generatePageMetadata } from '@/lib/metadata';
import { getPublicMakers } from '@/services/makers';
import { getAllCrafts } from '@/services/crafts';
import { MakersPageContent } from './makers-page-content';

export const metadata = generatePageMetadata({
  title: 'Makers',
  description:
    'Meet the people behind the crafts — weavers, carvers, and jewellers from across Solomon Islands.',
  path: '/makers',
});

export default async function MakersPage() {
  const [makers, crafts] = await Promise.all([
    getPublicMakers(),
    getAllCrafts(),
  ]);

  const makersWithCraft = makers.map((m) => ({
    ...m,
    craftName: crafts.find((c) => c.id === m.craftId)?.name || '',
  }));

  return <MakersPageContent makers={makersWithCraft} />;
}
