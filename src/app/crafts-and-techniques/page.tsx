import { Palette } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader, PageCta } from '@/components/layout';
import { getAllCrafts } from '@/services/crafts';
import { CraftCard } from '@/components/cards/craft-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';

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
          <EmptyState
            icon={Palette}
            title="Crafts coming soon."
            description="We're documenting each craft tradition with its makers. Check back soon."
            action={
              <ButtonLink href="/makers" variant="secondary" size="sm">
                Meet the makers
              </ButtonLink>
            }
          />
        ) : (
          /* Shared CraftCard — this page previously hand-rolled its own copy
             with a grey info bar and an h2 where a card title belongs. */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {crafts.map((craft) => (
              <CraftCard key={craft.id} craft={craft} />
            ))}
          </div>
        )}
      </div>

      <PageCta
        heading="Every technique has a maker"
        description="Read the stories of the weavers, carvers, and jewellers who keep these traditions alive."
      >
        <ButtonLink href="/makers">Meet the makers</ButtonLink>
        <ButtonLink href="/catalogue" variant="secondary">
          Browse the catalogue
        </ButtonLink>
      </PageCta>
    </div>
  );
}
