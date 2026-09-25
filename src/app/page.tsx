import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
import { ArticleCard } from '@/components/cards/article-card';
import {
  articleGridClasses,
  shortArticleGridClasses,
} from '@/components/cards/poster-card';
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroSlideshow, type SlideItem } from '@/components/shared/hero-slideshow';
import { MakersCarousel } from '@/components/shared/makers-carousel';
import { ProductsCarousel } from '@/components/shared/products-carousel';
import { PageCta } from '@/components/layout/page-cta';
import { FlagDivider } from '@/components/layout/flag-divider';
import { SponsorBanner } from '@/components/shared/sponsor-banner';
import { StockedByBand } from '@/components/shared/stocked-by-band';
import { ButtonLink } from '@/components/ui/button';
import { CmsText } from '@/components/ui/cms-text';
import { Callout } from '@/components/ui/callout';
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

/**
 * A "view all" text link — an `ocean` link with a trailing arrow (the site's
 * interactive-accent colour), not a button, so it reads as secondary
 * navigation rather than competing with the page's primary CTAs. Underlines on
 * hover and nudges the arrow, so it is unmistakably a link and not static text.
 *
 * Used in two positions on each homepage showcase (see the discoverability
 * note on <SectionHeading>): pinned top-right of the heading for the visitor
 * scanning section titles, and centred below the row for the visitor who has
 * just worked through the cards and wants more — the moment intent actually
 * forms.
 */
function ViewAllLink({
  href,
  label,
  className = '',
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`tap-target group inline-flex flex-shrink-0 items-center gap-3xs whitespace-nowrap text-base font-semibold text-ocean transition-colors hover:text-ocean-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm ${className}`}
    >
      <span className="group-hover:underline underline-offset-4">{label}</span>
      <ArrowRight
        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

/**
 * Homepage section heading — the h2 + flag-mark, with the section's single
 * "view all" affordance sitting inline immediately AFTER the title, on the same
 * baseline. The three homepage showcases (Products, Makers, News) share it.
 *
 * Inline-after-title (rather than the far-right corner or the row below) keeps
 * the link in the visitor's scan path: the eye reads the heading and the link
 * is right there, one word later, rather than ~1000px away in the corner. The
 * link wraps below the title on a narrow phone (the row is `flex-wrap`), so it
 * never crushes the heading.
 *
 * The row is `items-center`, so the small link sits vertically centred against
 * the tall heading type rather than riding its baseline or foot. `gap-x-md`
 * (24) gives it clear breathing room from the title so the two read as
 * heading + separate affordance, not one run of text. The flag-mark stays
 * under the title alone, so the whole block is heading + link on one row, mark
 * beneath.
 */
function SectionHeading({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  return (
    <div className="mb-stack">
      <div className="flex flex-wrap items-center gap-x-md gap-y-3xs">
        <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
          {title}
        </h2>
        <ViewAllLink href={viewAllHref} label={viewAllLabel} />
      </div>
      <FlagDivider variant="mark" className="mt-xs" />
    </div>
  );
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

  // Four featured pieces: on desktop they fill the 4-column grid exactly, so
  // there is no horizontal overflow and no next/prev arrow. On mobile the same
  // four are a swipeable row. The full listing lives on /catalogue.
  const featuredProducts = products.slice(0, 4);
  const latestArticles = articles.slice(0, 3);
  // Four makers: on desktop they fill the 4-column grid exactly (no overflow,
  // no arrows), and on mobile the same four are a swipeable row. The full list
  // lives on /makers.
  const featuredMakers = makers.slice(0, 4);

  // Build craft name lookup
  const craftNameMap: Record<string, string> = {};
  crafts.forEach((c) => { craftNameMap[c.id] = c.name; });

  const heroSlides = buildHeroSlides({ products, makers, adminFeatured, craftNameMap, slideshowSettings });

  return (
    <div className="flex flex-col">
      {/* Hero + flag stripe + "Supported by" row, grouped so they read as one
          opening block.

          The group sizes to its CONTENT and does NOT stretch to fill the
          viewport. An earlier version made the hero `flex-1` inside a
          `min-h-[100svh]` block to "push the sponsor row to the bottom", but the
          hero content is far shorter than a desktop viewport, so filling 100vh
          pushed the sponsor row to the very bottom edge — below the fold, the
          exact bug it was meant to prevent. Taking only the height it needs
          keeps all three visible on load. */}
      <div className="flex flex-col">
        {/* Hero — WHITE, not a coloured band.
            
            This is deliberate and it is the current design: the hero is an
            editorial, ink-on-white opening rather than a full-strength colour
            field. Note that it therefore makes the homepage the least-branded
            page on the site, since every interior page opens with a coloured
            `<PageHeader banner>`. The brand cues here are the flag-mark under
            the eyebrow and the `<FlagDivider>` capping the bottom of the block.

            Because the surface is light, everything on it takes its light-
            background treatment: `text-deep-blue` heading and eyebrow,
            `<HeroSlideshow tone="light">`, `<HeroCodeToggle tone="light">`, and
            a plain `.btn-primary` (green on white has no fill collision, so it
            needs no override).

            HISTORY, so the old rationale is not reintroduced by accident: this
            used to be a multi-stop gradient blending the flag palette, with
            white text, a dark scrim behind the heading, a wave motif, a gold-
            fill CTA override to avoid green-on-green, and a `transparentOverHero`
            header that flipped to solid on scroll. None of that is here any
            more. If a coloured hero is ever restored, all of those pieces have
            to come back together — a white heading on this white section, or a
            `tone="dark"` slideshow on it, is a contrast failure on its own. */}
        <section className="relative overflow-hidden">
          <div className="relative site-container">
            {/* Spacing:

                `gap-md` (24) with `lg:gap-x-xl` (48). Below `lg` the slideshow
                is hidden, so this is a single-cell column and the row gap does
                nothing; from `lg` the gap is horizontal, between the text and
                the gallery, where 48px is right.

                `py-section` (48 → 96) gives the hero generous, balanced top and
                bottom padding so the cover has room to breathe above the flag
                stripe and below the header.

                `lg:items-start` not `items-center`: the gallery column is
                roughly twice the height of the text column, so centring left
                the heading floating well below the top of the frame. A shared
                top edge is what lines the two columns up. */}
            {/* Columns: an even split at `lg`, 3/2 from `xl`. The gallery is a
                centre frame with a peek either side, so it needs real width —
                at `lg` a 2-of-5 column is ~330px, and 2-of-5 of that again
                leaves a centre frame smaller than the one it replaced. An even
                split at `lg` costs the h1 one extra line and buys the gallery
                ~95px. From `xl` there is room for both. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-md lg:gap-x-xl items-center lg:items-start py-section">
              {/* Text content — leads on mobile (order-1) so the primary hero
                  copy comes before the gallery, left on desktop. Half the row
                  at `lg`, then 3 of 5 columns from `xl` where the extra width
                  pulls the h1 up from three lines to two. */}
              <div className="order-1 lg:order-1 xl:col-span-3">
                {/* Eyebrow with leading rule — matches the banner treatment on
                    the interior pages, in light on the gradient band. */}
                <div className="flex items-center gap-xs mb-sm">
                  <span className="w-8 h-px bg-deep-blue/40" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-widest text-deep-blue/80">
                    {siteContent.homepageHeading || 'Wholesale Solomon Islands handicrafts'}
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
                <h1 className="font-heading text-3xl sm:text-4xl xl:text-5xl font-medium text-deep-blue leading-heading max-w-xl">
                  {siteContent.homepageMakersHeading || 'Handmade in Solomon Islands'}
                </h1>

                <p className="mt-2xs text-base text-warm-gray-600 leading-body max-w-md">
                  {siteContent.homepageIntro || 'Every product is handmade. When you buy from us, you invest directly in Solomon Islands artisans, their communities, their traditions, and their futures.'}
                </p>

                <div className="mt-md flex flex-wrap items-center gap-xs">
                  {/* Plain `.btn-primary` (green fill), no override. The gold
                      override this used to carry existed only because the hero
                      was a green gradient band and a green button vanished into
                      it. On white there is no collision, so the hero uses the
                      same primary button as the rest of the site. */}
                  <ButtonLink
                    href="/catalogue"
                  >
                    {siteContent.homepageCtaText || 'Browse Catalogue'}
                  </ButtonLink>
                  <ButtonLink
                    href="/about"
                    variant="secondary"
                  >
                    {text['homepage.heroSecondaryCta']}
                  </ButtonLink>
                </div>

                <div className="mt-sm">
                  <HeroCodeToggle tone="light" />
                </div>
              </div>

              {/* Hero slideshow — shown at EVERY breakpoint now (by request),
                  so the phone hero gets the same auto-advancing carousel as the
                  desktop rather than a single still image. The component is
                  layout-agnostic: its track is `w-full max-w-[620px]`, so it
                  fills the phone width and caps on desktop, and it already
                  handles swipe, autoplay, the pause control and reduced motion.

                  On mobile it renders as `order-2`, below the hero text, so the
                  heading/intro/CTAs still lead; on desktop it sits in the right
                  column. `tone="light"` because the hero is white. */}
              <div className="order-2 xl:col-span-2 w-full">
                <HeroSlideshow items={heroSlides} interval={5000} tone="light" />
              </div>

            </div>
          </div>
        </section>

        {/* Flag stripe — the seam closing the hero. On a white hero this is the
            main piece of brand colour in the opening block, so it is doing more
            work than it did when it capped a coloured band. It is the one flag
            stripe on the site that is not under a `<PageHeader>`. */}
        <FlagDivider />

      </div>

      {/* Supporters — sits directly below the cover (the hero opening block),
          so a first-time visitor sees who backs SIAC right after the hero.
          Renders `null` when there are no supporters, in which case the page
          moves straight to the featured products. */}
      <SponsorBanner />

      {/* Featured Products — the warm band, so the first move below the white
          hero is a change of surface. Sits above Meet the makers now, so the
          page alternates hero (white) → Products (warm) → Makers (white) →
          deep-blue CTA → News (white), keeping the gentle warm/white swap
          rather than running two same-coloured sections together. */}
      <section className="section-y">
        <div className="site-container">
          {/* Visible heading, matching "Meet the makers" below so the two
              homepage showcases read as siblings. The heading
              also gives the section a landmark in the heading outline — a
              screen-reader user paging by heading would otherwise jump straight
              from the hero to "Meet the makers". Both strings come from the CMS
              (`homepage.productsHeading` / `homepage.productsButton`). */}
          <SectionHeading
            title={text['homepage.productsHeading']}
            viewAllHref="/catalogue"
            viewAllLabel={text['homepage.productsButton']}
          />
          {/* Featured crafts as a swipeable carousel — the SAME interaction and
              layout as "Meet the makers" below (swipe on mobile, prev/next
              arrows on desktop), so the two homepage showcases read as one
              family. */}
          <ProductsCarousel products={featuredProducts} makers={makers} />
          {/* Why there are no prices. Each card carries only a quiet "Trade
              pricing" status in the spot a price would sit; this note gives the
              rule ONCE below the row rather than repeating it on every card. The
              CMS copy already carries the "Approved stockists" sign-in link
              inline, so there is no separate "Sign in to see pricing" button.
              An `info` Callout marks it as an important notice by colour + icon,
              not text alone. Clearing the CMS field hides it. */}
          {text['homepage.productsPricingNote'] && (
            <Callout variant="info" title="Wholesale only" className="mt-stack max-w-2xl">
              <CmsText
                value={text['homepage.productsPricingNote']}
                paragraphClassName="text-base leading-body"
              />
            </Callout>
          )}
        </div>
      </section>

      {/* Featured Makers — white, between the warm Products band above and the
          deep-blue CTA below, so the body alternates
          warm → white → deep-blue → white instead of running two warm sections
          together. */}
      <section className="section-y">
        <div className="site-container">
          {/* Keeps its heading — unlabelled portraits give a first-time visitor
              no context. The faces carry the section.

              "Meet the makers" is this section's line alone now. The hero eyebrow
              used to default to "Meet the Makers Behind Every Piece", which said
              the same thing one screen up; it now leads with what the business is
              instead. */}
          <SectionHeading
            title={text['homepage.makersHeading']}
            viewAllHref="/makers"
            viewAllLabel={text['homepage.makersButton']}
          />
          {/* Makers as a single swipeable track rather than a static grid: on
              a phone the visitor swipes through faces; on desktop the prev/next
              arrows page through them. Shows a partial next card at every width
              so the "there's more" cue is always present. The full-list route is
              the "view all" text link inline after the section heading (see
              <SectionHeading>), matching Products and News. */}
          <MakersCarousel makers={featuredMakers} craftNameMap={craftNameMap} />
        </div>
      </section>

      {/* Stocked by — a wholesale trust band naming the shops that stock SIAC,
          flowing straight into the "stock us too" CTA below it. Renders nothing
          until an admin fills in real, confirmed stockist names, so today (no
          names stored) the page runs Products → CTA unchanged. Warm surface to
          keep the warm/white alternation between the white Products section
          above and the deep-blue CTA below. */}
      <StockedByBand />

      {/* Wholesale CTA — a primary "learn about wholesale" plus an optional
          secondary "browse the catalogue" for a visitor not ready to apply.
          PageCta auto-flips the secondary outline to white on the deep-blue
          band. The secondary is hidden if its CMS label is cleared. */}
      <PageCta
        contained
        heading={text['homepage.ctaHeading']}
        description={text['homepage.ctaDescription']}
      >
        <ButtonLink href="/wholesale">{text['homepage.ctaButton']}</ButtonLink>
        {text['homepage.ctaSecondaryButton'] && (
          <ButtonLink href="/catalogue" variant="secondary">
            {text['homepage.ctaSecondaryButton']}
          </ButtonLink>
        )}
      </PageCta>

      {/* Latest News */}
      {latestArticles.length > 0 && (
        <section className="section-y">
          <div className="site-container">
            <SectionHeading
              title={text['homepage.newsHeading']}
              viewAllHref="/news"
              viewAllLabel="View all news"
            />
            {/* A 3-up grid holding only one or two cards leaves an empty third
                column, so below three articles it caps at two. Left-aligned
                (not centred) so the cards line up under the left-aligned
                "Latest news" heading and flag mark above them, rather than
                floating in the middle of the page. */}
            <div
              role="list"
              aria-label="Latest news"
              className={
                latestArticles.length < 3
                  ? shortArticleGridClasses
                  : articleGridClasses
              }
            >
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
