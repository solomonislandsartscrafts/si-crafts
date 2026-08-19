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
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroSlideshow, type SlideItem } from '@/components/shared/hero-slideshow';
import { SafeImage } from '@/components/ui/safe-image';
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
    return {
      kind: 'product' as const,
      imageUrl: product.imageUrls[0],
      imageAlt: product.imageAlts[0] || product.name,
      kicker: 'Handmade Piece',
      title: product.name,
      subtitle: maker ? `by ${maker.name} · ${maker.village}, ${maker.province}` : undefined,
      tag: product.materialCategory,
      href: `/piece/${product.productCode}`,
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-10 items-center pt-0 pb-12 lg:py-10">
              {/* Left: Text content */}
              <div className="order-2 lg:order-1 lg:col-span-2 px-4 sm:px-0">
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
                  <Link
                    href="/catalogue"
                    className="tap-target inline-flex items-center px-6 py-3 btn-primary"
                  >
                    {siteContent.homepageCtaText || 'Browse Catalogue'}
                  </Link>
                  <Link
                    href="/about"
                    className="tap-target inline-flex items-center px-6 py-3 border-2 border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                  >
                    Our Story
                  </Link>
                </div>

                <div className="mt-4">
                  <HeroCodeToggle />
                </div>
              </div>

              {/* Right: Hero gallery — full-width on mobile */}
              <div className="order-1 lg:order-2 lg:col-span-3 w-full">
                <HeroSlideshow items={heroSlides} interval={5000} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Featured Makers */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredMakers.map((maker, index) => (
              <div key={maker.id} className={index === 2 ? 'hidden lg:block' : ''}>
                <MakerCard maker={maker} craftName={craftNameMap[maker.craftId] || undefined} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/makers"
              className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              Meet all makers
            </Link>
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
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <Link href="/catalogue" className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light">
              View all products
            </Link>
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="section-y bg-ocean/5 border-t border-ocean/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue mb-3">
            Stock SI Crafts in your shop
          </h2>
          <p className="text-warm-gray-600 leading-relaxed mb-6 max-w-xl mx-auto">
            We supply museum shops and galleries in Australia with authentic
            Solomon Islands handicrafts at wholesale prices.
          </p>
          <Link
            href="/wholesale"
            className="tap-target inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
          >
            Learn about wholesale →
          </Link>
        </div>
      </section>

      {/* Latest News */}
      {latestArticles.length > 0 && (
        <section className="section-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                Latest news
              </h2>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
              >
                All articles
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                  <div className="aspect-[3/2] relative overflow-hidden rounded-lg mb-3">
                    <SafeImage
                      src={article.coverImageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <p className="text-xs text-warm-gray-400 mb-1">
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  <h3 className="font-heading text-lg font-semibold text-deep-blue group-hover:text-ocean transition-colors mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-warm-gray-600 line-clamp-2 leading-relaxed mb-2">
                    {article.excerpt}
                  </p>
                  <span className="text-sm font-medium text-ocean group-hover:text-ocean-dark transition-colors">
                    Read more
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
