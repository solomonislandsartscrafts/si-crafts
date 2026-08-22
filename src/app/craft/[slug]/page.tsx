import { notFound } from 'next/navigation';
import { Users, Package } from 'lucide-react';
import { getAllCrafts, getCraftBySlug } from '@/services/crafts';
import { getMakersByCraft } from '@/services/makers';
import { getPublicProducts } from '@/services/products';
import { getSiteTextSafe } from '@/services/site-text';
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

  const [makers, products, text] = await Promise.all([
    getMakersByCraft(craft.id),
    getPublicProducts({ materialCategory: craft.materialCategory }),
    getSiteTextSafe(),
  ]);

  const previewProducts = products.slice(0, PRODUCT_PREVIEW_COUNT);
  const hasMoreProducts = products.length > PRODUCT_PREVIEW_COUNT;

  return (
    <div className="site-container page-y">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-10 lg:mb-20">
        <div>
          <h1 className={`${pageTitleClasses} mb-4`}>{craft.name}</h1>
          <div className="text-base text-warm-gray-600 leading-relaxed space-y-4">
            <p>{craft.description}</p>
          </div>
        </div>
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-card-bg">
          <SafeImage
            src={craft.processImageUrls[0] || null}
            alt={craft.processImageAlt || `${craft.name} process`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Cultural context. Unreviewed context is never shown as fact — see the
          cultural guardrails: if it has not been checked by a Solomon Islands
          cultural partner, we say so rather than publishing it. */}
      {craft.culturalContext && (
        <section className="mb-10 lg:mb-20 bg-sand-light rounded-lg p-5 md:p-8">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-3">
            {text['craftDetail.culturalHeading']}
          </h2>
          {craft.culturalContextReviewFlag === 'reviewed' ? (
            <p className="text-base text-warm-gray-600 leading-relaxed">
              {craft.culturalContext}
            </p>
          ) : (
            <p className="text-base text-warm-gray-600 italic">
              {text['craftDetail.culturalPendingNotice']}
            </p>
          )}
        </section>
      )}

      {/* Makers who practise this craft */}
      <section className="mb-10 lg:mb-20 border-t border-sand pt-10">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-6">
          {text['craftDetail.makersHeading']}
        </h2>
        {makers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5">
            {makers.map((maker) => (
              <MakerCard key={maker.id} maker={maker} craftName={craft.name} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={text['craftDetail.makersEmptyTitle']}
            description={text['craftDetail.makersEmptyDescription']}
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
            {text['craftDetail.piecesHeading']}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 tabtop:gap-x-8">
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
            title={text['craftDetail.piecesEmptyTitle']}
            description={text['craftDetail.piecesEmptyDescription']}
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
