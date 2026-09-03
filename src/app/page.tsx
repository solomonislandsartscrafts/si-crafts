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
import { ArticleCard } from '@/components/cards/article-card';
import {
  posterGridClasses,
  articleGridClasses,
} from '@/components/cards/poster-card';
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroGradientSwitcher } from '@/components/shared/hero-gradient-switcher';
import { HeroSlideshow, type SlideItem } from '@/components/shared/hero-slideshow';
import { MakersCarousel } from '@/components/shared/makers-carousel';
import { PageCta } from '@/components/layout/page-cta';
import { FlagDivider } from '@/components/layout/flag-divider';
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
  // Up to eight makers feed the carousel — enough that there is always
  // somewhere to swipe/page to beyond the first screen of cards.
  const featuredMakers = makers.slice(0, 8);

  // Build craft name lookup
  const craftNameMap: Record<string, string> = {};
  crafts.forEach((c) => { craftNameMap[c.id] = c.name; });

  const heroSlides = buildHeroSlides({ products, makers, adminFeatured, craftNameMap, slideshowSettings });

  return (
    <div className="flex flex-col">
      {/* First viewport: header + hero + flag stripe + "Supported by" row aim
          to fit the first screen on EVERY device, so the sponsor row is visible
          before the user scrolls. `flex flex-col`, hero is `flex-1` to absorb
          the slack, and the stripe + sponsor row sit at the bottom.

          Height uses `min-h` (a floor, not a fixed height), and `100svh` (small
          viewport height) rather than `100vh`: `svh` is measured with the
          mobile browser's URL bar SHOWING, so the sponsor row lands inside the
          visible area on a phone instead of behind the chrome. `min-h-screen`
          (100vh) is kept first as the fallback for browsers without `svh`.

          Because it is a MINIMUM, a short/landscape viewport whose hero content
          is taller than the screen simply grows the block and scrolls — the
          hero text is never clipped to force-fit the sponsor row. The hero owns
          the 80px header offset (see the -mt-20 in LayoutShell + pt-20 below). */}
      <div className="flex flex-col min-h-screen min-h-[100svh]">
        {/* Hero — artistic multi-stop gradient blending the full flag palette
            (deep-blue → ocean → brand-green → gold), the ONE place the design
            system sanctions a background gradient (see "subtle overlays on hero
            images"). A flat brand-green band read heavy and clashed with the
            green `.btn-primary`; the gradient instead merges every brand colour
            into one crafted, painterly field. All stops are the locked palette
            hex values (deep-blue #1B3A4B, ocean #1E5AA8, brand-green #1E7A3D,
            accent-gold #F4B728) — no new colours introduced.

            This version puts all three flag colours in DISTINCT diagonal zones
            so each stands out rather than blending: blue owns the left third
            (dark navy → deep-blue, under the text), a vivid green owns the
            middle (brand-green lifting to a brighter green), and a bold gold
            owns the right third behind the gallery. Tight linear stops at the
            two colour changes keep each zone crisp, and a radial bloom deepens
            each — ocean top-left, green centre, gold lower-right. The dark navy
            left holds the heading/intro on a reliably dark blue: white text is
            ~12:1 over the darkest text region and stays 8:1+ even where the
            green bloom bleeds toward it, comfortably AA. The bright green/gold
            zones sit under the gallery and motif, never the text.
            `bg-brand-green` stays as the solid fallback for any renderer that
            drops the gradient. */}
        {/* `flex-1` so the band absorbs the slack in the `100svh` block and
            pushes the flag stripe + sponsor row to the bottom of the first
            viewport. `items-start` on mobile keeps the hero content at the top
            of that band (no centring slack), `items-center` from `lg` centres
            the two-column desktop layout. */}
        <section
          className="relative overflow-hidden bg-brand-green flex-1 flex items-start lg:items-center"
        >
          {/* TEMPORARY gradient A/B switcher. Renders the chosen gradient as the
              backmost layer of this section and a small control to flip between
              the design variations, so reviewers can pick a favourite. The
              corner vignette, wave motif and content below all sit ABOVE it and
              are unchanged. Once a design is chosen: delete
              <HeroGradientSwitcher/>, put the winning gradient back inline as
              `style={{ backgroundImage }}` on this section, and remove the
              component file. Option 1 is the current design. */}
          <HeroGradientSwitcher />

          {/* Corner vignette — a soft dark navy pool in the top-left under the
              content column, giving the field depth (like a lit scene) and
              holding the heading/intro on a reliably dark blue so white text
              stays AA even where the green/gold blooms lift the rest of the
              band. aria-hidden, purely tonal. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(120% 120% at 8% 0%, rgba(11, 26, 38, 0.55) 0%, rgba(11, 26, 38, 0.12) 42%, rgba(11, 26, 38, 0) 62%)',
            }}
          />
          {/* Wave motif — the same CSS-only device the interior `<PageHeader
              banner>` uses for its `waves` variant (see BannerMotif in
              page-header.tsx). Right-anchored, low opacity, white strokes,
              aria-hidden and decorative. It sits over the gradient + scrim but
              under the content column, so it reads across the whole band the
              way it does on the "Meet the makers" / catalogue banners. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-[0.12]"
            preserveAspectRatio="xMaxYMid slice"
            viewBox="0 0 600 400"
            fill="none"
          >
            {[40, 100, 160, 220, 280, 340].map((y) => (
              <path
                key={y}
                d={`M300 ${y} C 380 ${y - 26}, 460 ${y + 26}, 600 ${y}`}
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="relative site-container">
            {/* Spacing notes, because this grid carries the two spacing bugs
                that were most visible on a phone:

                `gap-md` (24) not `gap-10` (40). On mobile the three cells stack
                as gallery → supporters → text, so a 40px row gap opened two
                40px voids either side of a single logo — one continuous ~160px
                of empty page under the gallery caption, larger than any real
                section break on the homepage. 24px is the standard within-block
                gap and closes it. `lg:gap-x-xl` restores a wide 48px column gap
                on desktop, where the gap is horizontal and does no harm.

                `pb-lg` (32) on mobile, not `pb-section` (48): the mobile first
                viewport has to hold this grid PLUS the flag stripe and the
                sponsor row below it without scrolling, and a tighter bottom gap
                buys that headroom. The seam to "Meet the makers" is the flag
                stripe + the sponsor band anyway, so the gap can be shorter than
                a full section break. `lg:pb-xl` restores the roomier desktop
                gap, where the sponsor row is not fighting for the same viewport.

                `lg:items-start` not `items-center`: the gallery column is
                roughly twice the height of the text column, so centring left
                the heading floating ~160px below the top of the frame. Aligning
                to a shared top edge is what "same baseline" means here. The
                trade-off is quiet space below the buttons on a wide screen,
                which the flex-centred viewport above absorbs. */}
            {/* `pt-20`+ clears the 80px (h-20) header the band now runs behind
                — LayoutShell pulls this hero up under the transparent header
                with `-mt-20`, so the content needs that height back on top or
                it would sit under the nav. */}
            {/* Columns: an even split at `lg`, 3/2 from `xl`. The gallery is a
                centre frame with a peek either side, so it needs real width —
                at `lg` a 2-of-5 column is ~330px, and 2-of-5 of that again
                leaves a centre frame smaller than the one it replaced. An even
                split at `lg` costs the h1 one extra line and buys the gallery
                ~95px. From `xl` there is room for both. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-md lg:gap-x-xl items-center lg:items-start pt-20 tabtop:pt-24 pb-lg lg:pb-xl">
              {/* Text content — leads on mobile (order-1) so the primary hero
                  copy comes before the gallery, left on desktop. Half the row
                  at `lg`, then 3 of 5 columns from `xl` where the extra width
                  pulls the h1 up from three lines to two. */}
              <div className="order-1 lg:order-1 xl:col-span-3">
                {/* Eyebrow with leading rule — matches the banner treatment on
                    the interior pages, in light on the gradient band. */}
                <div className="flex items-center gap-xs mb-sm">
                  <span className="w-8 h-px bg-white/60" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                    {siteContent.homepageHeading || 'Meet the Makers Behind Every Piece'}
                  </span>
                </div>

                {/* Flag-mark echo — the same navy/white/gold/green stub used
                    under every section heading below (Featured Makers,
                    Featured Products, News). Repeating it here ties the hero
                    back to that rhythm and picks up the same flag colours the
                    gradient band blends. */}
                <FlagDivider variant="mark" className="mb-sm" />

                {/* Capped measure: the heading is CMS-driven, so without a max
                    width a longer line would run the full three columns and
                    flatten out. max-w-xl keeps it to two or three lines. */}
                <h1 className="font-heading text-3xl sm:text-4xl xl:text-5xl font-medium text-white leading-heading max-w-xl">
                  {siteContent.homepageMakersHeading || 'Handmade in Solomon Islands'}
                </h1>

                <p className="mt-2xs text-base text-white/85 leading-body max-w-md">
                  {siteContent.homepageIntro || 'Every product is handmade. When you buy from us, you invest directly in Solomon Islands artisans, their communities, their traditions, and their futures.'}
                </p>

                <div className="mt-md flex flex-wrap items-center gap-xs">
                  {/* Primary CTA overridden to the gold fill (dark text) instead
                      of the site-wide green `.btn-primary`. The content column
                      sits over the gradient's deep-blue corner, so gold gives
                      the strongest, warmest focal action there — the flag's own
                      green/gold pairing — and never risks the green-on-green
                      wash-out the flat band caused. One unmistakable primary
                      action for the hero. */}
                  <ButtonLink
                    href="/catalogue"
                    className="!bg-accent-gold !text-deep-blue hover:!bg-accent-gold-dark focus-visible:!outline-deep-blue"
                  >
                    {siteContent.homepageCtaText || 'Browse Catalogue'}
                  </ButtonLink>
                  <ButtonLink
                    href="/about"
                    variant="secondary"
                    className="!text-white !border-white/70 hover:!bg-white/10 hover:!border-white hover:!text-white"
                  >
                    {text['homepage.heroSecondaryCta']}
                  </ButtonLink>
                </div>

                <div className="mt-sm">
                  <HeroCodeToggle tone="dark" />
                </div>
              </div>

              {/* Hero slideshow — now shown on mobile too so phone visitors can
                  swipe the cover gallery (velocity-based: a fast flick jumps
                  several pieces, a slow drag moves one). On mobile it sits
                  BELOW the heading/intro/buttons/code lookup (order-2) rather
                  than above them, so the primary hero copy still leads and the
                  sponsor row stays close to the first viewport. It splits to the
                  right column from `lg`. */}
              <div className="order-2 lg:order-2 xl:col-span-2 w-full">
                <HeroSlideshow items={heroSlides} interval={5000} tone="dark" />
              </div>

            </div>
          </div>
        </section>

        {/* Flag stripe — caps the bottom edge of the gradient hero cover, the
            seam between the hero and the page body. `.flag-divider` keeps its
            own blue base (the flag motif's fixed colour), so it reads as a
            deliberate motif transition rather than a mismatched edge. */}
        <FlagDivider />

        {/* Sponsor logos — the last thing in the first viewport, so the
            "Supported by" row is always visible before the user scrolls, on
            every device. On white below the stripe: the grey label + ink logos
            need the light background. One copy, shown at every breakpoint. */}
        <SponsorBanner />
      </div>

      {/* Featured Makers — white. It sits directly under the hero and above the
          warm Products band, so keeping it white starts the white → warm →
          deep-blue → white alternation. */}
      <section className="section-y">
        <div className="site-container">
          {/* Heading matters here: this is the first thing below the hero, and
              three unlabelled portraits give a first-time visitor no context. */}
          <div className="flex items-end justify-between mb-stack">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['homepage.makersHeading']}
              </h2>
              <FlagDivider variant="mark" className="mt-xs" />
              <p className="text-warm-gray-600 mt-sm">
                {text['homepage.makersIntro']}
              </p>
            </div>
            <Link
              href="/makers"
              className="inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          {/* Makers as a single swipeable track rather than a static grid: on
              a phone the visitor swipes through faces; on desktop the prev/next
              arrows (top-right of the section heading) page through them. Shows
              a partial next card at every width so the "there's more" cue is
              always present. The full-list link is the "View all" beside the
              heading, shown at every width, so there is no second button below. */}
          <MakersCarousel makers={featuredMakers} craftNameMap={craftNameMap} />
        </div>
      </section>

      {/* Featured Products — on the subtle warm band (`.section-band`) so it
          reads as a distinct surface between the white Makers section above and
          the deep-blue CTA below. White → warm → deep-blue → white gives the
          body a gentle alternation instead of one flat white column. */}
      <section className="section-y section-band">
        <div className="site-container">
          <div className="flex items-end justify-between mb-stack">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['homepage.productsHeading']}
              </h2>
              <FlagDivider variant="mark" className="mt-xs" />
              <p className="text-warm-gray-600 mt-sm">
                {text['homepage.productsIntro']}
              </p>
            </div>
            <Link
              href="/catalogue"
              className="hidden sm:inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div role="list" aria-label="Featured products" className={posterGridClasses}>
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
          <div className="sm:hidden mt-stack text-center">
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
        <section className="section-y">
          <div className="site-container">
            <div className="flex items-end justify-between mb-stack">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                  {text['homepage.newsHeading']}
                </h2>
                <FlagDivider variant="mark" className="mt-xs" />
              </div>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
              >
                All articles
              </Link>
            </div>
            <div role="list" aria-label="Latest news" className={articleGridClasses}>
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {/* The header link above is hidden below sm, so without this the
                news section was a dead end on a phone — no route to /news. */}
            <div className="sm:hidden mt-stack text-center">
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
