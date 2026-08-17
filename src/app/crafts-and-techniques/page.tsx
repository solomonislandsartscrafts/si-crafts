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
        {crafts.length === 0 ? (
          <p className="text-warm-gray-400 italic">Crafts coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {crafts.map((craft) => (
              <Link
                key={craft.id}
                href={`/craft/${craft.slug}`}
                className="group block w-full overflow-hidden rounded-lg shadow-card hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-ocean"
              >
                {/* Image area */}
                <div className="aspect-square relative bg-sand-light overflow-hidden rounded-t-lg">
                  <SafeImage
                    src={craft.processImageUrls[0] || null}
                    alt={craft.processImageAlt || craft.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                {/* Info bar — subtle grey background */}
                <div className="bg-warm-gray-100 p-3 sm:p-4">
                  <h2 className="font-heading text-sm sm:text-base font-semibold text-deep-blue leading-tight line-clamp-2">
                    {craft.name}
                  </h2>
                  <p className="text-xs text-warm-gray-600 mt-1 line-clamp-2">
                    {craft.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
