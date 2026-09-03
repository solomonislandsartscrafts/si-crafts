import { Palette } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader, PageCta } from '@/components/layout';
import { getAllCrafts } from '@/services/crafts';
import { getSiteTextSafe } from '@/services/site-text';
import { CraftCard } from '@/components/cards/craft-card';
import { posterGridClasses } from '@/components/cards/poster-card';
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
      <PageHeader
        banner="green"
        eyebrow="How it's made"
        title={text['crafts.title']}
        intro={text['crafts.intro']}
      />

      <div className="site-container pb-section">
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
          /* Shared poster grid — the same import every other listing uses. This
             was a hand-typed copy of the same column ramp (with a redundant
             `sm:grid-cols-2`), which is exactly the drift the shared constant
             exists to prevent. */
          <div role="list" aria-label="Crafts and techniques" className={posterGridClasses}>
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
