import { getAllProducts, getProductByCode } from '@/services/products';
import { getMakerById } from '@/services/makers';
import { getCraftById } from '@/services/crafts';
import { getAllMakers } from '@/services/makers';
import { PiecePageClient } from './piece-page-client';
import { ProductCard } from '@/components/cards/product-card';
import { PageHeader } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BackLink } from '@/components/shared/back-link';
import { resolveImageUrl } from '@/lib/api-client';
import { materialLabel, productTypeLabel } from '@/lib/labels';
import { SITE_URL } from '@/lib/metadata';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ productCode: p.productCode }));
}

interface PiecePageProps {
  params: Promise<{ productCode: string }>;
}

export default async function PiecePage({ params }: PiecePageProps) {
  const { productCode } = await params;
  const product = await getProductByCode(productCode);

  if (!product) {
    return (
      <PageHeader
        title="Piece not found"
        align="center"
        width="narrow"
        intro={`We couldn't find a piece with the code "${productCode}". It may have been removed, or the code might be incorrect.`}
      >
        <div className="mt-8 flex justify-center">
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
      name: 'Solomon Islands Arts Crafts',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: 'Catalogue', url: '/catalogue' },
          { name: product.name },
        ]}
        className="mb-6"
      />

      {/* Top section: Gallery + Product Info + Maker */}
      <PiecePageClient product={product} craftName={craft?.name} craftSlug={craft?.slug} maker={publishedMaker} craft={craft} />

      {/* Related Products. Needs at least two to read as a set — a single card
          in a four-column grid looks like a rendering fault. */}
      {relatedProducts.length > 1 && (
        <section className="mt-12 pt-10 border-t border-sand">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Bottom back link — useful for QR-scan users with no browsing history */}
      <div className="mt-12 pt-8 border-t border-sand text-center">
        <BackLink href="/catalogue" label="Browse all pieces" />
      </div>
    </div>
  );
}
