import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts, getFeaturedProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getPublishedArticles } from '@/services/articles';
import { getSiteContentSafe } from '@/services/site-content';
import { getAllCrafts } from '@/services/crafts';
import { getSlideshowSettingsSafe } from '@/services/slideshow';
import { ProductCard } from '@/components/cards/product-card';
import { MakerCard } from '@/components/cards/maker-card';
import { ArticleCard } from '@/components/cards/article-card';
import { posterGridClasses, posterGridClassesThreeUp } from '@/components/cards/poster-card';
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroSlideshow, type SlideItem } from '@/components/shared/hero-slideshow';
import { PageCta } from '@/components/layout/page-cta';
import { SponsorBanner } from '@/components/shared/sponsor-banner';
import { ButtonLink } from '@/components/ui/button';
import type { Product, Maker, Craft, SlideshowSettings } from '@/types';

interface BuildHeroSlidesArgs {
  products: Product[];
  makers: Maker[];
  crafts: Craft[];
  adminFeatured: Product[];
  craftNameMap: Record<string, string>;
  slideshowSettings: SlideshowSettings;
}

/**
 * Checks if a specific item is enabled in slideshow settings.
 * Items not listed in settings.items are enabled by default.
 */
function isItemEnabled(settings: SlideshowSettings, id: string, kind: string): boolean {
  const toggle = settings.items.find((i) => i.id === id && i.kind === kind);
  return toggle ? toggle.enabled : true;
}

/**
 * Builds the homepage hero gallery showing product images only.
 * Displays up to 5 products, preferring admin-featured items when available.
 */
function buildHeroSlides({
  products,
  makers,
  adminFeatured,
  slideshowSettings,
}: BuildHeroSlidesArgs): SlideItem[] {
  const sourceProducts = adminFeatured.length > 0 ? adminFeatured : products;

  // Filter to enabled items with images
  const enabledProducts = sourceProducts
    .filter((p) => isItemEnabled(slideshowSettings, p.id, 'product'))
    .filter((p) => p.imageUrls[0]);

  // Take up to 5 products
  const heroProducts = enabledProducts.slice(0, 5);

  return heroProducts.map((product) => {
    const maker = makers.find((m) => m.id === product.makerId);
    const toggle = slideshowSettings.items.find((i) => i.id === product.id && i.kind === 'product');
    return {
      imageUrl: product.imageUrls[0],
      imageAlt: product.imageAlts[0] || product.name,
      title: product.name,
      subtitle: maker ? `by ${maker.name} · ${maker.village}, ${maker.province}` : undefined,
      href: `/piece/${product.productCode}`,
      objectPosition: toggle?.objectPosition || 'center',
    };
  });
}

export const metadata = generatePageMetadata({
  title: 'Solomon Islands Arts Crafts',
  description:
    'Authentic Solomon Islands handicrafts. Meet the makers behind every piece of pandanus weaving, wood carving, and shell-money jewellery.',
  path: '/',
});

export default async function HomePage() {
  const [products, makers, articles, adminFeatured, siteContent, crafts, slideshowSettings] = await Promise.all([
    getPublicProducts(),
    getPublicMakers(),
    getPublishedArticles(),
    getFeaturedProducts(),
    getSiteContentSafe(),
    getAllCrafts(),
    getSlideshowSettingsSafe(),
  ]);

  const featuredProducts = products.slice(0, 4);
  const latestArticles = articles.slice(0, 3);
  const featuredMakers = makers.slice(0, 3);

  // Build craft name lookup
  const craftNameMap: Record<string, string> = {};
  crafts.forEach((c) => { craftNameMap[c.id] = c.name; });

  const heroSlides = buildHeroSlides({ products, makers, crafts, adminFeatured, craftNameMap, slideshowSettings });

  return (
    <div className="flex flex-col">
      {/* Hero + stats fill the first viewport on desktop, so nothing below
          is visible until the user scrolls. Offset = header (80px) + flag divider (14px).
          Negative top margin cancels out <main>'s top padding (pt-3/sm:pt-4) so the
          hero gallery sits flush against the flag divider on mobile/tablet — desktop
          spacing (lg:pt-6) is left untouched via lg:mt-0. */}
      <div className="-mt-3 sm:-mt-4 lg:mt-0 lg:flex lg:flex-col lg:min-h-[calc(100vh-94px)]">
        {/* Hero — Flag theme: gold accent + serif heading + split layout */}
        <section className="lg:flex-1 lg:flex lg:items-center">
          <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-center pt-0 pb-12 lg:py-10">
              {/* Text content — below the sponsor banner on mobile, left on desktop */}
              <div className="order-3 lg:order-1 lg:col-span-2 px-4 sm:px-0">
                {/* Gold accent line + subtitle */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-0.5 bg-ocean" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-widest text-ocean">
                    Handmade in Solomon Islands
                  </span>
                </div>

                <h1 className="font-heading text-[1.875rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-medium text-deep-blue leading-tight">
                  {siteContent.homepageHeading || 'Meet the Makers Behind Every Piece'}
                </h1>

                <p className="mt-5 text-base text-warm-gray-600 leading-relaxed max-w-md">
                  {siteContent.homepageIntro || 'Every product is handmade. When you buy from us, you invest directly in Solomon Islands artisans, their communities, their traditions, and their futures.'}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/catalogue">
                    {siteContent.homepageCtaText || 'Browse Catalogue'}
                  </ButtonLink>
                  <ButtonLink href="/about" variant="secondary">
                    Our Story
                  </ButtonLink>
                </div>

                <div className="mt-4">
                  <HeroCodeToggle />
                </div>
              </div>

              {/* Hero gallery — first on mobile, right on desktop */}
              <div className="order-1 lg:order-2 lg:col-span-3 w-full">
                <HeroSlideshow items={heroSlides} interval={5000} />
              </div>

              {/* Sponsor banner — shown right under the slideshow dots on mobile/tablet,
                  hidden here on desktop where it lives at the bottom of the viewport. */}
              <div className="order-2 lg:hidden col-span-1">
                <SponsorBanner />
              </div>
            </div>
          </div>
        </section>

        {/* Sponsor logos — pinned to the bottom of the first viewport on desktop only */}
        <div className="hidden lg:block">
          <SponsorBanner />
        </div>
      </div>

      {/* Featured Makers */}
      <section className="section-y bg-sand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading matters here: this is the first thing below the hero, and
              three unlabelled portraits give a first-time visitor no context. */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Meet the makers
              </h2>
              <p className="text-warm-gray-600 mt-1">
                The weavers, carvers, and jewellers behind every piece.
              </p>
            </div>
            <Link
              href="/makers"
              className="hidden sm:inline-flex items-center gap-1 text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          {/* All three show on every breakpoint. Previously the third was
              hidden below lg, which read as a loading fault on phones. */}
          <div className={posterGridClassesThreeUp}>
            {featuredMakers.map((maker) => (
              <MakerCard
                key={maker.id}
                maker={maker}
                craftName={craftNameMap[maker.craftId] || undefined}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <ButtonLink href="/makers" variant="secondary">
              Meet all makers
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Featured Crafts
              </h2>
              <p className="text-warm-gray-600 mt-1">
                Handmade pieces from across Solomon Islands.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="hidden sm:inline-flex items-center gap-1 text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className={posterGridClasses}>
            {featuredProducts.map((product) => {
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
          <div className="sm:hidden mt-6 text-center">
            <ButtonLink href="/catalogue" variant="secondary">
              View all products
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <PageCta
        heading="Stock Solomon Islands Arts Crafts in your shop"
        description="We supply museum shops and galleries in Australia with authentic Solomon Islands handicrafts at wholesale prices."
      >
        <ButtonLink href="/wholesale">Learn about wholesale</ButtonLink>
      </PageCta>

      {/* Latest News */}
      {latestArticles.length > 0 && (
        <section className="section-y bg-sand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Latest news
              </h2>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1 text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
              >
                All articles
              </Link>
            </div>
            <div className={posterGridClassesThreeUp}>
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {/* The header link above is hidden below sm, so without this the
                news section was a dead end on a phone — no route to /news. */}
            <div className="sm:hidden mt-6 text-center">
              <ButtonLink href="/news" variant="secondary">
                All articles
              </ButtonLink>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
