import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts, getFeaturedProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getPublishedArticles } from '@/services/articles';
import { getSiteContentSafe } from '@/services/site-content';
import { getSiteTextSafe } from '@/services/site-text';
import { getAllCrafts } from '@/services/crafts';
import { getSlideshowSettingsSafe } from '@/services/slideshow';
import {
  getSlideshowProductCandidates,
  getSlideshowMakerCandidates,
} from '@/lib/slideshow-candidates';
import { ProductCard } from '@/components/cards/product-card';
import { MakerCard } from '@/components/cards/maker-card';
import { ArticleCard } from '@/components/cards/article-card';
import {
  posterGridClasses,
  posterGridClassesThreeUp,
  articleGridClasses,
} from '@/components/cards/poster-card';
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroSlideshow, type SlideItem } from '@/components/shared/hero-slideshow';
import { PageCta } from '@/components/layout/page-cta';
import { SponsorBanner } from '@/components/shared/sponsor-banner';
import { ButtonLink } from '@/components/ui/button';
import type { Product, Maker, SlideshowSettings } from '@/types';

interface BuildHeroSlidesArgs {
  products: Product[];
  makers: Maker[];
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
 * Total slides in the hero. Six is the ceiling because every slide gets a 44px
 * dot: past six the control row no longer fits the frame width on a phone.
 */
const MAX_HERO_SLIDES = 6;
/** Per kind, so neither products nor makers can crowd the other out. */
const MAX_PER_KIND = 3;

function itemPosition(settings: SlideshowSettings, id: string, kind: string): string {
  const toggle = settings.items.find((i) => i.id === id && i.kind === kind);
  return toggle?.objectPosition || 'center';
}

/**
 * Builds the homepage hero slideshow: pieces and the people who made them, in
 * one run, alternating product → maker → product → maker.
 *
 * Alternating rather than grouping is the point of the section. "Meet the maker
 * behind every piece" is the promise the page opens with, so a piece followed by
 * a face makes that connection without any copy having to explain it.
 *
 * Eligibility comes from the shared candidate filters, so what appears here is
 * exactly what the admin slideshow page offers as toggles.
 */
function buildHeroSlides({
  products,
  makers,
  adminFeatured,
  craftNameMap,
  slideshowSettings,
}: BuildHeroSlidesArgs): SlideItem[] {
  const { product: productsOn, maker: makersOn } = slideshowSettings.enabledCategories;

  // Admin-featured products win when any are flagged; otherwise fall back to
  // the catalogue so the hero is never empty on a fresh install.
  const sourceProducts = adminFeatured.length > 0 ? adminFeatured : products;

  const productSlides: SlideItem[] = productsOn
    ? getSlideshowProductCandidates(sourceProducts)
        .filter((p) => isItemEnabled(slideshowSettings, p.id, 'product'))
        .slice(0, MAX_PER_KIND)
        .map((product) => {
          const maker = makers.find((m) => m.id === product.makerId);
          return {
            imageUrl: product.imageUrls[0],
            imageAlt: product.imageAlts[0] || product.name,
            kind: 'product' as const,
            eyebrow: craftNameMap[product.craftId] || undefined,
            title: product.name,
            subtitle: maker
              ? `by ${maker.name} · ${maker.village}, ${maker.province}`
              : undefined,
            href: `/piece/${product.productCode}`,
            objectPosition: itemPosition(slideshowSettings, product.id, 'product'),
          };
        })
    : [];

  const makerSlides: SlideItem[] = makersOn
    ? getSlideshowMakerCandidates(makers)
        .filter((m) => isItemEnabled(slideshowSettings, m.id, 'maker'))
        .slice(0, MAX_PER_KIND)
        .map((maker) => ({
          // `getSlideshowMakerCandidates` guarantees a portrait.
          imageUrl: maker.portraitUrl as string,
          imageAlt: maker.portraitAlt || maker.name,
          kind: 'maker' as const,
          eyebrow: 'Meet the maker',
          title: maker.name,
          subtitle: craftNameMap[maker.craftId]
            ? `${craftNameMap[maker.craftId]} · ${maker.village}, ${maker.province}`
            : `${maker.village}, ${maker.province}`,
          href: `/maker/${maker.slug}`,
          objectPosition: itemPosition(slideshowSettings, maker.id, 'maker'),
        }))
    : [];

  const slides: SlideItem[] = [];
  for (let i = 0; i < Math.max(productSlides.length, makerSlides.length); i++) {
    if (productSlides[i]) slides.push(productSlides[i]);
    if (makerSlides[i]) slides.push(makerSlides[i]);
  }
  return slides.slice(0, MAX_HERO_SLIDES);
}

export const metadata = generatePageMetadata({
  title: 'Solomon Islands Arts & Crafts',
  description:
    'Authentic Solomon Islands handicrafts. Meet the makers behind every piece of pandanus weaving, wood carving, and shell-money jewellery.',
  path: '/',
});

export default async function HomePage() {
  const [products, makers, articles, adminFeatured, siteContent, text, crafts, slideshowSettings] = await Promise.all([
    getPublicProducts(),
    getPublicMakers(),
    getPublishedArticles(),
    getFeaturedProducts(),
    getSiteContentSafe(),
    getSiteTextSafe(),
    getAllCrafts(),
    getSlideshowSettingsSafe(),
  ]);

  const featuredProducts = products.slice(0, 4);
  const latestArticles = articles.slice(0, 3);
  const featuredMakers = makers.slice(0, 3);

  // Build craft name lookup
  const craftNameMap: Record<string, string> = {};
  crafts.forEach((c) => { craftNameMap[c.id] = c.name; });

  const heroSlides = buildHeroSlides({ products, makers, adminFeatured, craftNameMap, slideshowSettings });

  return (
    <div className="flex flex-col">
      {/* Hero + stats fill the first viewport on desktop, so nothing below
          is visible until the user scrolls. Offset = header (80px) + flag divider (14px).
          <main>'s own top padding is kept: the hero gallery is a card with a cast
          shadow, not a full-bleed image, so it needs to sit clear of the flag
          divider rather than flush against it. */}
      <div className="lg:flex lg:flex-col lg:min-h-[calc(100vh-94px)]">
        {/* Hero — Flag theme: gold accent + serif heading + split layout */}
        <section className="lg:flex-1 lg:flex lg:items-center">
          <div className="site-container">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center pt-0 pb-10 lg:py-10">
              {/* Text content — below the sponsor banner on mobile, left on desktop.
                  Takes 3 of 5 columns: the gallery card is capped at 380px, so a
                  wider gallery column would only add empty space, while the extra
                  width here pulls the h1 up from three lines to two. */}
              <div className="order-3 lg:order-1 lg:col-span-3">
                {/* Gold accent line + subtitle */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-0.5 bg-ocean" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-widest text-ocean">
                    {siteContent.homepageHeading || 'Meet the Makers Behind Every Piece'}
                  </span>
                </div>

                {/* Capped measure: the heading is CMS-driven, so without a max
                    width a longer line would run the full three columns and
                    flatten out. max-w-xl keeps it to two or three lines. */}
                <h1 className="font-heading text-[1.875rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-medium text-deep-blue leading-tight max-w-xl">
                  {siteContent.homepageMakersHeading || 'Handmade in Solomon Islands'}
                </h1>

                <p className="mt-5 text-base text-warm-gray-600 leading-relaxed max-w-md">
                  {siteContent.homepageIntro || 'Every product is handmade. When you buy from us, you invest directly in Solomon Islands artisans, their communities, their traditions, and their futures.'}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/catalogue">
                    {siteContent.homepageCtaText || 'Browse Catalogue'}
                  </ButtonLink>
                  <ButtonLink href="/about" variant="secondary">
                    {text['homepage.heroSecondaryCta']}
                  </ButtonLink>
                </div>

                <div className="mt-4">
                  <HeroCodeToggle />
                </div>
              </div>

              {/* Hero slideshow — first on mobile, right on desktop */}
              <div className="order-1 lg:order-2 lg:col-span-2 w-full">
                <HeroSlideshow items={heroSlides} interval={5000} />
              </div>

              {/* Sponsor banner — shown right under the slideshow dots on mobile/tablet,
                  hidden here on desktop where it lives at the bottom of the viewport. */}
              <div className="order-2 lg:hidden col-span-1">
                <SponsorBanner contained={false} />
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
        <div className="site-container">
          {/* Heading matters here: this is the first thing below the hero, and
              three unlabelled portraits give a first-time visitor no context. */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['homepage.makersHeading']}
              </h2>
              <p className="text-warm-gray-600 mt-1">
                {text['homepage.makersIntro']}
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
              {text['homepage.makersButton']}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-y">
        <div className="site-container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['homepage.productsHeading']}
              </h2>
              <p className="text-warm-gray-600 mt-1">
                {text['homepage.productsIntro']}
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
              {text['homepage.productsButton']}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <PageCta
        heading={text['homepage.ctaHeading']}
        description={text['homepage.ctaDescription']}
      >
        <ButtonLink href="/wholesale">{text['homepage.ctaButton']}</ButtonLink>
      </PageCta>

      {/* Latest News */}
      {latestArticles.length > 0 && (
        <section className="section-y bg-sand-light">
          <div className="site-container">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['homepage.newsHeading']}
              </h2>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1 text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
              >
                All articles
              </Link>
            </div>
            <div className={articleGridClasses}>
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
