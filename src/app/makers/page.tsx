import { generatePageMetadata } from '@/lib/metadata';
import { getPublicMakers } from '@/services/makers';
import { getAllCrafts } from '@/services/crafts';
import { MakerCard } from '@/components/cards/maker-card';
import { MakersWithMap } from './makers-with-map';

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

  // Enrich makers with craft names for the client component
  const makersWithCraft = makers.map((m) => ({
    ...m,
    craftName: crafts.find((c) => c.id === m.craftId)?.name || '',
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">
        Makers
      </h1>
      <p className="text-lg text-warm-gray-600 max-w-2xl leading-relaxed mb-12">
        The people behind every piece — their stories, villages, and craft.
      </p>

      <MakersWithMap makers={makersWithCraft} />
    </div>
  );
}
