import { notFound } from 'next/navigation';
import { Users, Package } from 'lucide-react';
import { getAllCrafts, getCraftBySlug } from '@/services/crafts';
import { getMakersByCraft } from '@/services/makers';
import { getPublicProducts } from '@/services/products';
import { MakerCard } from '@/components/cards/maker-card';
import { ProductCard } from '@/components/cards/product-card';
import { pageTitleClasses } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SafeImage } from '@/components/ui/safe-image';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BackLink } from '@/components/shared/back-link';

/** How many products to show before linking through to the full catalogue. */
const PRODUCT_PREVIEW_COUNT = 8;

export async function generateStaticParams() {
  const crafts = await getAllCrafts();
  return crafts.map((craft) => ({ slug: craft.slug }));
}

interface CraftPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CraftPage({ params }: CraftPageProps) {
  const { slug } = await params;
  const craft = await getCraftBySlug(slug);

  if (!craft) {
    notFound();
  }

  const [makers, products] = await Promise.all([
    getMakersByCraft(craft.id),
    getPublicProducts({ materialCategory: craft.materialCategory }),
  ]);

  const previewProducts = products.slice(0, PRODUCT_PREVIEW_COUNT);
  const hasMoreProducts = products.length > PRODUCT_PREVIEW_COUNT;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: 'Crafts', url: '/crafts-and-techniques' },
          { name: craft.name },
        ]}
        className="mb-8"
      />

      {/* Header with image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 lg:mb-16">
        <div>
          <h1 className={`${pageTitleClasses} mb-4`}>{craft.name}</h1>
          <div className="text-base text-warm-gray-600 leading-relaxed space-y-4">
            <p>{craft.description}</p>
          </div>
        </div>
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-sand-light">
          <SafeImage
            src={craft.processImageUrls[0] || null}
            alt={craft.processImageAlt || `${craft.name} process`}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Cultural context. Unreviewed context is never shown as fact — see the
          cultural guardrails: if it has not been checked by a Solomon Islands
          cultural partner, we say so rather than publishing it. */}
      {craft.culturalContext && (
        <section className="mb-12 lg:mb-16 bg-sand-light rounded-lg p-6 md:p-8">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-3">
            Cultural Context
          </h2>
          {craft.culturalContextReviewFlag === 'reviewed' ? (
            <p className="text-base text-warm-gray-600 leading-relaxed">
              {craft.culturalContext}
            </p>
          ) : (
            <p className="text-base text-warm-gray-600 italic">
              Cultural context pending review by a Solomon Islands cultural
              partner.
            </p>
          )}
        </section>
      )}

      {/* Makers who practise this craft */}
      <section className="mb-12 lg:mb-16 border-t border-sand pt-10 lg:pt-12">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-6">
          Makers
        </h2>
        {makers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {makers.map((maker) => (
              <MakerCard key={maker.id} maker={maker} craftName={craft.name} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No makers listed for this craft yet."
            description="We're still documenting makers across Solomon Islands. Meet the makers we have published so far."
            action={
              <ButtonLink href="/makers" variant="secondary" size="sm">
                Meet all makers
              </ButtonLink>
            }
          />
        )}
      </section>

      {/* Products in this material category */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
            Pieces
          </h2>
          {/* The grid is capped, so always offer the way to see the rest.
              Deliberately not "View all N": N counts only this craft's material
              category, but /catalogue opens unfiltered — its material filter is
              client state with no URL parameter, so the link cannot carry the
              filter through. Don't promise a filtered view we can't deliver. */}
          {hasMoreProducts && (
            <ButtonLink href="/catalogue" variant="secondary" size="sm">
              Browse the catalogue
            </ButtonLink>
          )}
        </div>
        {previewProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {previewProducts.map((product) => {
              const maker = makers.find((m) => m.id === product.makerId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  makerName={maker?.name}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No pieces available in this category right now."
            description="Stock is handmade and limited. Browse the full catalogue to see what else is available."
            action={
              <ButtonLink href="/catalogue" variant="secondary" size="sm">
                Browse the catalogue
              </ButtonLink>
            }
          />
        )}
      </section>

      {/* Bottom back link */}
      <div className="mt-12 pt-8 border-t border-sand text-center">
        <BackLink href="/crafts-and-techniques" label="All crafts & techniques" />
      </div>
    </div>
  );
}
