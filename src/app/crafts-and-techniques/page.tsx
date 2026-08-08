import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { getAllCrafts } from '@/services/crafts';
import { SafeImage } from '@/components/ui/safe-image';

export const metadata = generatePageMetadata({
  title: 'Crafts & Techniques',
  description: 'How shell money, pandanus weaving, and wood carving are made in Solomon Islands.',
  path: '/crafts-and-techniques',
});

export default async function CraftsAndTechniquesPage() {
  const crafts = await getAllCrafts();

  return (
    <div>
      <PageHeader
        title="Crafts & Techniques"
        intro="Living craft traditions from Solomon Islands — each with its own materials, tools, and stories."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {crafts.map((craft) => (
          <Link
            key={craft.id}
            href={`/craft/${craft.slug}`}
            className="group flex h-full flex-col rounded-lg overflow-hidden border border-sand hover:border-ocean/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            {/* Image area — white background */}
            <div className="aspect-square relative bg-white overflow-hidden">
              <SafeImage
                src={craft.processImageUrls[0] || null}
                alt={craft.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            {/* Info area — grey background */}
            <div className="flex flex-1 flex-col p-4 bg-warm-gray-100">
              <h2 className="font-heading text-sm font-semibold text-deep-blue group-hover:text-ocean transition-colors">
                {craft.name}
              </h2>
              <p className="text-xs text-warm-gray-600 leading-relaxed mt-1 line-clamp-2">
                {craft.description}
              </p>
              <span className="mt-auto pt-3 text-xs font-medium text-ocean group-hover:text-ocean-dark transition-colors">
                Learn more →
              </span>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
