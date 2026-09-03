import { notFound } from 'next/navigation';
import { Users, Package } from 'lucide-react';
import { getAllCrafts, getCraftBySlug } from '@/services/crafts';
import { getMakersByCraft } from '@/services/makers';
import { getPublicProducts } from '@/services/products';
import { getSiteTextSafe } from '@/services/site-text';
import { MakerCard } from '@/components/cards/maker-card';
import { ProductCard } from '@/components/cards/product-card';
import { DetailPageLayout } from '@/components/layout/detail-page-layout';
import { pageTitleClasses } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SafeImage } from '@/components/ui/safe-image';
import { generatePageMetadata, toPlainDescription } from '@/lib/metadata';
import { resolveImageUrl } from '@/lib/api-client';
import type { Metadata } from 'next';

/** How many products to show before linking through to the full catalogue. */
const PRODUCT_PREVIEW_COUNT = 8;

export async function generateStaticParams() {
  const crafts = await getAllCrafts();
  return crafts.map((craft) => ({ slug: craft.slug }));
}

interface CraftPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-craft metadata.
 *
 * Only `description` is used for the snippet. `culturalContext` is deliberately
 * left out: it may carry unreviewed traditional knowledge (see
 * culturalContextReviewFlag), and a meta description is syndicated into search
 * results and link previews well beyond this site's control.
 */
export async function generateMetadata({ params }: CraftPageProps): Promise<Metadata> {
  const { slug } = await params;
  const craft = await getCraftBySlug(slug);

  if (!craft) return { title: 'Craft not found' };

  return generatePageMetadata({
    title: craft.name,
    description:
      toPlainDescription(craft.description) ||
      `${craft.name} from Solomon Islands — the materials, the process, and the makers who work in it.`,
    path: `/craft/${craft.slug}`,
    imageUrl: resolveImageUrl(craft.processImageUrls[0]) || undefined,
  });
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
    <DetailPageLayout
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Crafts', url: '/crafts-and-techniques' },
        { name: craft.name },
      ]}
      backLink={{ label: 'All crafts & techniques', href: '/crafts-and-techniques' }}
    >
      {/* Header with image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-block items-center mb-block">
        <div>
          <h1 className={`${pageTitleClasses} mb-sm`}>{craft.name}</h1>
          <div className="text-base text-warm-gray-600 leading-relaxed space-y-sm">
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
        <section className="mb-block bg-sand-light rounded-lg p-md md:p-lg">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-2xs">
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
      <section className="mb-block border-t border-sand pt-block">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
          {text['craftDetail.makersHeading']}
        </h2>
        {makers.length > 0 ? (
          <div role="list" aria-label="Makers of this craft" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid">
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
        <div className="flex items-end justify-between gap-sm mb-stack">
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
          <div role="list" aria-label="Pieces in this craft" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid">
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
    </DetailPageLayout>
  );
}
