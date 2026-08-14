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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {crafts.map((craft) => (
          <Link
            key={craft.id}
            href={`/craft/${craft.slug}`}
            className="group relative block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ocean"
          >
            <div className="aspect-[4/5] relative bg-sand-light overflow-hidden">
              <SafeImage
                src={craft.processImageUrls[0] || null}
                alt={craft.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h2 className="font-heading text-sm sm:text-base font-semibold text-white leading-tight">
                  {craft.name}
                </h2>
                <p className="text-xs text-white/80 mt-0.5 line-clamp-2">
                  {craft.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
