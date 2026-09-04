import Link from 'next/link';
import { Store, MapPin, Package } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPublicMakers, getPublicMakerBySlug } from '@/services/makers';
import { getProductsByMaker } from '@/services/products';
import { getCraftById } from '@/services/crafts';
import { getSiteTextSafe } from '@/services/site-text';
import { ProductCard } from '@/components/cards/product-card';
import { posterGridClasses } from '@/components/cards/poster-card';
import { DetailPageLayout } from '@/components/layout/detail-page-layout';
import { pageTitleClasses } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SafeImage } from '@/components/ui/safe-image';
import { generatePageMetadata, toPlainDescription } from '@/lib/metadata';
import { resolveImageUrl } from '@/lib/api-client';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const makers = await getPublicMakers();
  return makers.map((maker) => ({ slug: maker.slug }));
}

interface MakerPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-maker metadata.
 *
 * The maker's real name, village and province go in the title because those are
 * the specific terms a curator or researcher actually searches for, and they
 * are the provenance claim this site exists to make. Sourced from
 * getPublicMakerBySlug, so the consent gate applies here as it does to the page
 * body — an unsigned maker resolves to null and gets no metadata.
 */
export async function generateMetadata({ params }: MakerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const maker = await getPublicMakerBySlug(slug);

  if (!maker) return { title: 'Maker not found' };

  const place = [maker.village, maker.province].filter(Boolean).join(', ');

  return generatePageMetadata({
    title: place ? `${maker.name} — ${place}` : maker.name,
    description:
      toPlainDescription(maker.story) ||
      `Meet ${maker.name}${place ? `, a maker from ${place}` : ''}, Solomon Islands. See their work and the story behind it.`,
    path: `/maker/${maker.slug}`,
    imageUrl: resolveImageUrl(maker.portraitUrl) || undefined,
  });
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

  const ctaPrompt = (text['makerDetail.ctaPrompt'] ?? '').replace(/\{name\}/g, maker.name);

  // Guard against placeholder / not-yet-written stories. A maker's story is
  // their own voice and provenance is the point of the site, so a stub like
  // "Test" or a single word must NOT render as a quote — that both looks broken
  // and breaks the cultural rule against inventing/placeholder narrative. Treat
  // anything under ~15 characters (after trimming) as not written yet, so it
  // falls through to the admin-editable "story pending" notice instead.
  const hasStory = (maker.story ?? '').trim().length >= 15;

  return (
    <DetailPageLayout
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Makers', url: '/makers' },
        { name: maker.name },
      ]}
    >
      {/* Maker profile. Portrait column is capped at 360px rather than a full
          50/50 split: at half the container width the 4/5 portrait rendered
          ~700px wide, which dwarfed the info beside it and left a large empty
          column. A tidy profile-sized image + a wider info column reads as a
          balanced header. */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,360px)_1fr] gap-block mb-block items-start">
        {/* Portrait */}
        <div className="aspect-[4/5] relative rounded-lg overflow-hidden">
          <SafeImage
            src={maker.portraitUrl}
            alt={`${maker.name} from ${maker.village}, ${maker.province}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
            priority
          />
        </div>

        {/* Info — top-aligned (not centred) so a short profile sits at the top
            of the column rather than floating in the middle of the portrait's
            empty space. */}
        <div className="flex flex-col">
          <h1 className={`${pageTitleClasses} mb-xs`}>{maker.name}</h1>

          {/* One identity line: place, then the craft as a link. Grouping them
              reads as the maker's header rather than a stack of a place line and
              a separate pill. */}
          <p className="flex flex-wrap items-center gap-x-2xs gap-y-3xs text-lg text-warm-gray-600 mb-md">
            <MapPin className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>{maker.village}, {maker.province}</span>
            {craft && (
              <>
                <span aria-hidden="true">·</span>
                <Link
                  href={`/craft/${craft.slug}`}
                  className="font-medium text-ocean hover:text-ocean-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
                >
                  {craft.name}
                </Link>
              </>
            )}
          </p>

          {/* Story — first-person voice. A too-short/placeholder story falls
              back to the pending notice (see hasStory). */}
          {hasStory ? (
            <blockquote className="text-base text-warm-gray-800 leading-relaxed italic border-l-4 border-brand-green pl-sm">
              &ldquo;{maker.story}&rdquo;
            </blockquote>
          ) : (
            <p className="text-base text-warm-gray-600 italic">
              {text['makerDetail.storyPendingNotice']}
            </p>
          )}
        </div>
      </div>

      {/* Products section. Renders even when empty so a maker profile never
          just stops after the story with no explanation. */}
      <section id="pieces" className="border-t border-sand pt-block mt-block scroll-mt-24">
        {/* Heading with count */}
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
          Pieces by {maker.name}
          {products.length > 0 && (
            <span className="text-base font-normal text-warm-gray-600 ml-2xs">
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
          /* A single flat grid, matching the catalogue view — cards sit side
             by side rather than being split into a stacked section per product
             type. */
          <div role="list" aria-label="Pieces" className={posterGridClasses}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                makerName={maker.name}
              />
            ))}
          </div>
        )}

      </section>

      {/* Wholesale enquiry — the primary conversion on a maker page, so it gets
          a proper contained deep-blue CTA panel at the end of the content
          (matching the site-wide PageCta band, scaled to fit inside the detail
          container) rather than the thin centred link it used to be. The prompt
          is admin-editable and can be cleared, so both it and the panel copy are
          guarded. */}
      <div className="mt-block rounded-lg bg-deep-blue px-md py-lg sm:px-lg text-center">
        <p className="font-heading text-xl sm:text-2xl font-medium !text-white mb-2xs">
          {ctaPrompt || `Interested in stocking ${maker.name}'s pieces?`}
        </p>
        <p className="text-white/80 leading-relaxed mb-md max-w-xl mx-auto">
          {text['makerDetail.ctaSubtext'] ||
            'Log in or apply as a stockist to see wholesale pricing and place an order request.'}
        </p>
        <ButtonLink href="/wholesale">
          <Store className="w-4 h-4" aria-hidden="true" />
          {text['makerDetail.ctaButton']}
        </ButtonLink>
      </div>
    </DetailPageLayout>
  );
}
