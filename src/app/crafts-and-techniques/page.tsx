import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { CraftsGrid } from './crafts-grid';

export const metadata = generatePageMetadata({
  title: 'Crafts & Techniques',
  description: 'How shell money, pandanus weaving, and wood carving are made in Solomon Islands.',
  path: '/crafts-and-techniques',
});

export default function CraftsAndTechniquesPage() {
  return (
    <div>
      <PageHeader
        title="Crafts & Techniques"
        intro="Living craft traditions from Solomon Islands — each with its own materials, tools, and stories."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <CraftsGrid />
      </div>
    </div>
  );
}
