import { getAllProducts, getProductByCode } from '@/services/products';
import { getMakerById } from '@/services/makers';
import { getCraftById } from '@/services/crafts';
import { getAllMakers } from '@/services/makers';
import { getSiteTextSafe } from '@/services/site-text';
import { PiecePageClient } from './piece-page-client';
import { ProductCard } from '@/components/cards/product-card';
import { DetailPageLayout } from '@/components/layout/detail-page-layout';
import { PageHeader } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { resolveImageUrl } from '@/lib/api-client';
import { materialLabel, productTypeLabel } from '@/lib/labels';
import {
  SITE_URL,
  generatePageMetadata,
  toPlainDescription,
} from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ productCode: p.productCode }));
}

interface PiecePageProps {
  params: Promise<{ productCode: string }>;
}

/**
 * Per-piece metadata for the provenance page.
 *
 * `robots: noindex` on unpublished pieces is the important part. This page reads
 * through the ungated getProductByCode (and generateStaticParams uses
 * getAllProducts), so an unpublished piece is still reachable by direct link —
 * which is what makes the QR code work for a piece being previewed before
 * release. Reachable is fine; indexed is not. This keeps the preview behaviour
 * while making sure nothing unpublished can turn up in a search result.
 */
export async function generateMetadata({ params }: PiecePageProps): Promise<Metadata> {
  const { productCode } = await params;
  const product = await getProductByCode(productCode);

  if (!product) return { title: 'Piece not found', robots: { index: false, follow: false } };

  const maker = product.makerId ? await getMakerById(product.makerId) : null;
  const publishedMaker = maker?.publishedFlag ? maker : null;

  const base = generatePageMetadata({
    // The product code is the thing a buyer holding the piece has in hand, so
    // it belongs in the title alongside the name.
    title: `${product.name} (${product.productCode})`,
    // No price. Wholesale pricing is stockist-only and a meta description is
    // about as public as a string can get.
    description:
      toPlainDescription(product.description) ||
      `${product.name}, handmade in Solomon Islands${publishedMaker ? ` by ${publishedMaker.name}` : ''}. Provenance and maker story.`,
    path: `/piece/${product.productCode}`,
    imageUrl: resolveImageUrl(product.imageUrls[0]) || undefined,
  });

  return product.publishedFlag ? base : { ...base, robots: { index: false, follow: false } };
}

/**
 * Picks the "how it's made" copy for a piece's material.
 *
 * Material categories are a managed list, so the mapping is by convention:
 * `provenance.process<Material>` in camelCase, falling back to the generic
 * description when a material has no entry of its own.
 */
function processTextFor(text: Record<string, string>, materialCategory: string): string {
  const suffix = materialCategory
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return text[`provenance.process${suffix}`] || text['provenance.processFallback'];
}

export default async function PiecePage({ params }: PiecePageProps) {
  const { productCode } = await params;
  const [product, text] = await Promise.all([
    getProductByCode(productCode),
    getSiteTextSafe(),
  ]);

  if (!product) {
    return (
      <PageHeader
        title={text['provenance.notFoundTitle']}
        align="center"
        width="narrow"
        intro={`We couldn't find a piece with the code "${productCode}". It may have been removed, or the code might be incorrect.`}
      >
        <div className="mt-lg flex justify-center">
          <ButtonLink href="/catalogue">Browse the catalogue</ButtonLink>
        </div>
      </PageHeader>
    );
  }

  const [maker, craft, allProducts, allMakers] = await Promise.all([
    getMakerById(product.makerId),
    getCraftById(product.craftId),
    getAllProducts(),
    getAllMakers(),
  ]);

  const publishedMaker = maker?.publishedFlag ? maker : null;

  // Structured data. The point of this page is the link between a piece and the
  // person who made it, so the maker is emitted as a real `Person` in the
  // `creator` slot rather than being left as body text. No `offers` node —
  // wholesale pricing is stockist-only and must not leak into markup.
  // Consent gating applies here too: an unpublished maker is omitted entirely.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.productCode,
    url: `${SITE_URL}/piece/${product.productCode}`,
    // Absolute URLs only — a consumer of this markup has no base to resolve
    // "/uploads/..." against.
    ...(product.imageUrls.length > 0 && {
      image: product.imageUrls.map(resolveImageUrl).filter(Boolean),
    }),
    material: materialLabel(product.materialCategory),
    category: productTypeLabel(product.productType),
    brand: {
      '@type': 'Organization',
      name: 'Solomon Islands Arts & Crafts',
      url: SITE_URL,
    },
    ...(publishedMaker && {
      creator: {
        '@type': 'Person',
        name: publishedMaker.name,
        url: `${SITE_URL}/maker/${publishedMaker.slug}`,
        ...(resolveImageUrl(publishedMaker.portraitUrl) && {
          image: resolveImageUrl(publishedMaker.portraitUrl),
        }),
        homeLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: publishedMaker.village,
            addressRegion: publishedMaker.province,
            addressCountry: 'SB',
          },
        },
      },
    }),
    ...(craft && {
      isBasedOn: {
        '@type': 'CreativeWork',
        name: craft.name,
        url: `${SITE_URL}/craft/${craft.slug}`,
      },
    }),
  };

  // Get related products: same craft or same maker, excluding current product
  const relatedProducts = allProducts
    .filter((p) =>
      p.id !== product.id &&
      p.publishedFlag &&
      (p.craftId === product.craftId || p.makerId === product.makerId)
    )
    .slice(0, 4);

  return (
    <DetailPageLayout
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Catalogue', url: '/catalogue' },
        { name: product.name },
      ]}
      backLink={{ label: 'Browse all pieces', href: '/catalogue' }}
    >
      <JsonLd data={jsonLd} />

      {/* Top section: Gallery + Product Info + Maker */}
      <PiecePageClient
        product={product}
        craftName={craft?.name}
        craftSlug={craft?.slug}
        maker={publishedMaker}
        craft={craft}
        copy={{
          processText: processTextFor(text, product.materialCategory),
          authenticityBody: text['provenance.authenticityBody'],
          whereToBuyIntro: text['provenance.whereToBuyIntro'],
          whereToBuyShopPrompt: text['provenance.whereToBuyShopPrompt'],
          whereToBuyQuote: text['provenance.whereToBuyQuote'],
        }}
        tradeOnlyNotice={text['provenance.tradeOnlyNotice']}
        makerStoryFallback={text['provenance.makerStoryFallback']}
      />

      {/* Related Products. Needs at least two to read as a set — a single card
          in a four-column grid looks like a rendering fault. */}
      {relatedProducts.length > 1 && (
        <section className="mt-xl pt-block border-t border-sand">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-stack">
            {text['provenance.relatedHeading']}
          </h2>
          <div role="list" aria-label="Related pieces" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-grid">
            {relatedProducts.map((relatedProduct) => {
              const relatedMaker = allMakers.find((m) => m.id === relatedProduct.makerId);
              return (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  makerName={relatedMaker?.name}
                />
              );
            })}
          </div>
        </section>
      )}
    </DetailPageLayout>
  );
}
