import Link from 'next/link';
import { Store, MapPin, ChevronDown, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPublicMakers, getPublicMakerBySlug } from '@/services/makers';
import { getProductsByMaker } from '@/services/products';
import { getCraftById } from '@/services/crafts';
import { getSiteTextSafe } from '@/services/site-text';
import { ProductCard } from '@/components/cards/product-card';
import { pageTitleClasses } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SafeImage } from '@/components/ui/safe-image';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BackLink } from '@/components/shared/back-link';
import type { Product } from '@/types';

export async function generateStaticParams() {
  const makers = await getPublicMakers();
  return makers.map((maker) => ({ slug: maker.slug }));
}

interface MakerPageProps {
  params: Promise<{ slug: string }>;
}

/** Group products by productType and return sorted groups */
function groupProductsByType(products: Product[]): { type: string; items: Product[] }[] {
  const groups: Record<string, Product[]> = {};
  for (const product of products) {
    const type = product.productType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(product);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => ({ type, items }));
}

export default async function MakerPage({ params }: MakerPageProps) {
  const { slug } = await params;
  const maker = await getPublicMakerBySlug(slug);

  if (!maker) {
    notFound();
  }

  const [products, craft, text] = await Promise.all([
    getProductsByMaker(maker.id),
    getCraftById(maker.craftId),
    getSiteTextSafe(),
  ]);

  const productGroups = groupProductsByType(products);
  const ctaPrompt = (text['makerDetail.ctaPrompt'] ?? '').replace(/\{name\}/g, maker.name);

  return (
    <div className="site-container page-y">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: 'Makers', url: '/makers' },
          { name: maker.name },
        ]}
        className="mb-8"
      />

      {/* Maker profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 lg:mb-20">
        {/* Portrait */}
        <div className="aspect-[4/5] relative rounded-lg overflow-hidden">
          <SafeImage
            src={maker.portraitUrl}
            alt={`${maker.name} from ${maker.village}, ${maker.province}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className={`${pageTitleClasses} mb-2`}>{maker.name}</h1>
          <p className="flex items-center gap-1.5 text-lg text-warm-gray-600 mb-3">
            <MapPin className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {maker.village}, {maker.province}
          </p>

          {/* Craft badge */}
          {craft && (
            <Link
              href={`/craft/${craft.slug}`}
              className="inline-block bg-ocean/10 text-ocean px-3 py-1 rounded text-sm font-medium hover:bg-ocean/20 transition-colors w-fit mb-6 focus:outline-none focus:ring-2 focus:ring-ocean"
            >
              {craft.name}
            </Link>
          )}

          {/* Story — first-person voice */}
          {maker.story ? (
            <blockquote className="text-base text-warm-gray-800 leading-relaxed italic border-l-4 border-brand-green pl-4">
              &ldquo;{maker.story}&rdquo;
            </blockquote>
          ) : (
            <p className="text-base text-warm-gray-600 italic">
              {text['makerDetail.storyPendingNotice']}
            </p>
          )}

          {/* Scroll prompt */}
          {products.length > 0 && (
            <a
              href="#pieces"
              className="tap-target inline-flex items-center gap-1.5 mt-8 w-fit text-base font-medium text-ocean hover:text-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
            >
              <span>View pieces by {maker.name}</span>
              <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {/* Products section. Renders even when empty so a maker profile never
          just stops after the story with no explanation. */}
      <section id="pieces" className="border-t border-sand pt-12 mt-12 lg:mt-16 scroll-mt-24">
        {/* Heading with count */}
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-8">
          Pieces by {maker.name}
          {products.length > 0 && (
            <span className="text-base font-normal text-warm-gray-600 ml-2">
              ({products.length})
            </span>
          )}
        </h2>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={`No pieces by ${maker.name} are listed right now.`}
            description={text['makerDetail.piecesEmptyDescription']}
            action={
              <ButtonLink href="/catalogue" variant="secondary" size="sm">
                Browse the catalogue
              </ButtonLink>
            }
          />
        ) : (
          <>

          {/* Products grouped by type */}
          {productGroups.length > 1 ? (
            <div className="space-y-12">
              {productGroups.map((group) => (
                <div key={group.type}>
                  <h3 className="font-heading text-lg font-semibold text-deep-blue mb-4 capitalize">
                    {group.type}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5">
                    {group.items.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        makerName={maker.name}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  makerName={maker.name}
                />
              ))}
            </div>
          )}

          </>
        )}

        {/* Wholesale enquiry CTA. The prompt is admin-editable and can be
            cleared, so it is guarded — reading .replace off a missing key threw
            and took the whole maker page down. */}
        <div className="mt-12 pt-8 border-t border-sand text-center">
          {ctaPrompt && <p className="text-base text-warm-gray-600 mb-4">{ctaPrompt}</p>}
          <ButtonLink href="/wholesale" variant="secondary">
            <Store className="w-4 h-4" aria-hidden="true" />
            {text['makerDetail.ctaButton']}
          </ButtonLink>
        </div>
      </section>

      {/* Bottom back link */}
      <div className="mt-12 pt-8 border-t border-sand text-center">
        <BackLink href="/makers" label="All makers" />
      </div>
    </div>
  );
}
