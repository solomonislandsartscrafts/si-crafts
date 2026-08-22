import { Palette } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader, PageCta } from '@/components/layout';
import { getAllCrafts } from '@/services/crafts';
import { getSiteTextSafe } from '@/services/site-text';
import { CraftCard } from '@/components/cards/craft-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';

export const metadata = generatePageMetadata({
  title: 'Crafts & Techniques',
  description: 'How shell money, pandanus weaving, and wood carving are made in Solomon Islands.',
  path: '/crafts-and-techniques',
});

export default async function CraftsAndTechniquesPage() {
  const [crafts, text] = await Promise.all([getAllCrafts(), getSiteTextSafe()]);

  return (
    <div>
      <PageHeader title={text['crafts.title']} intro={text['crafts.intro']} />

      <div className="site-container pb-10 lg:pb-20">
        {crafts.length === 0 ? (
          <EmptyState
            icon={Palette}
            title={text['crafts.emptyTitle']}
            description={text['crafts.emptyDescription']}
            action={
              <ButtonLink href="/makers" variant="secondary" size="sm">
                Meet the makers
              </ButtonLink>
            }
          />
        ) : (
          /* Shared CraftCard — this page previously hand-rolled its own copy
             with a grey info bar and an h2 where a card title belongs. */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 tabtop:gap-x-8">
            {crafts.map((craft) => (
              <CraftCard key={craft.id} craft={craft} />
            ))}
          </div>
        )}
      </div>

      <PageCta
        heading={text['crafts.ctaHeading']}
        description={text['crafts.ctaDescription']}
      >
        <ButtonLink href="/makers">Meet the makers</ButtonLink>
        <ButtonLink href="/catalogue" variant="secondary">
          Browse the catalogue
        </ButtonLink>
      </PageCta>
    </div>
  );
}
