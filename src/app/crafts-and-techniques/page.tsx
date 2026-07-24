import Link from 'next/link';
import Image from 'next/image';
import { generatePageMetadata } from '@/lib/metadata';
import { getAllCrafts } from '@/services/crafts';

export const metadata = generatePageMetadata({
  title: 'Crafts & Techniques',
  description: 'How shell money, pandanus weaving, and wood carving are made in Solomon Islands.',
  path: '/crafts-and-techniques',
});

export default async function CraftsAndTechniquesPage() {
  const crafts = await getAllCrafts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-section-lg">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-deep-blue mb-4">
        Crafts & Techniques
      </h1>
      <p className="text-lg text-warm-gray-600 max-w-2xl mb-12 leading-relaxed">
        Living craft traditions from Solomon Islands — each with its own materials, tools, and stories.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {crafts.map((craft) => (
          <div key={craft.id} className="bg-card-bg rounded-lg shadow-card p-6">
            <div className="aspect-[16/9] relative rounded-md overflow-hidden bg-sand mb-4">
              {craft.processImageUrls.length > 0 ? (
                <Image
                  src={craft.processImageUrls[0]}
                  alt={craft.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-warm-gray-400 text-sm">Image coming soon</span>
                </div>
              )}
            </div>
            <h2 className="font-heading text-lg font-bold text-deep-blue mb-2">{craft.name}</h2>
            <p className="text-sm text-warm-gray-600 mb-4 line-clamp-2">{craft.description.slice(0, 120)}...</p>
            <Link href={`/craft/${craft.slug}`} className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors">
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
