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
  featuredPosterGridClasses,
  articleGridClasses,
  shortArticleGridClasses,
} from '@/components/cards/poster-card';
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroSlideshow, type SlideItem } from '@/components/shared/hero-slideshow';
import { MakersCarousel } from '@/components/shared/makers-carousel';
import { PageCta } from '@/components/layout/page-cta';
import { FlagDivider } from '@/components/layout/flag-divider';
import { SponsorBanner } from '@/components/shared/sponsor-banner';
import { StockedByBand } from '@/components/shared/stocked-by-band';
import { ButtonLink } from '@/components/ui/button';
import { CmsText } from '@/components/ui/cms-text';
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

  // Three, not four: the homepage featured grid is 3-up at desktop (bigger
  // tiles), so three fills exactly one row rather than leaving a lone tile on a
  // second row. The full four-column listing lives on /catalogue.
  const featuredProducts = products.slice(0, 3);
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
        <section className="relative overflow-hidden bg-white">
          <div className="relative site-container">
            {/* Spacing:

                `gap-md` (24) with `lg:gap-x-xl` (48). Below `lg` the slideshow
                is hidden, so this is a single-cell column and the row gap does
                nothing; from `lg` the gap is horizontal, between the text and
                the gallery, where 48px is right.

                `pt-block` / `pb-lg lg:pb-xl` give the hero its own vertical
                rhythm. The bottom pad is deliberately one rung SHORTER than the
                top: what follows is the flag stripe and the supporters band,
                not a new section, so they should sit tight under the hero rather
                than a full section break away.

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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-md lg:gap-x-xl items-center lg:items-start pt-block pb-lg lg:pb-xl">
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

              {/* Hero slideshow — DESKTOP ONLY (`hidden lg:block`), and it is
                  the call site that decides that, not the component (which stays
                  layout-agnostic).

                  Two reasons to keep it off mobile. The gallery plus its caption
                  is the tallest thing in the hero, so on a phone it pushes the
                  flag stripe and the supporters band out of the opening screen;
                  and it is the only part of the hero that requests images, so
                  dropping it saves a phone every hero image before the first
                  paint. Nothing is lost — the pieces and the makers each get
                  their own section directly below.

                  `tone="light"` because the hero is white. */}
              <div className="hidden lg:block order-2 xl:col-span-2 w-full">
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

        {/* Supporters — sits directly under the hero as the closing row of the
            opening block, so a first-time visitor sees who backs SIAC alongside
            the hero rather than at the very bottom of the page. Grouped inside
            this `flex flex-col` block with the hero and flag stripe so the three
            read as one unit. Renders `null` when there are no supporters, in
            which case the block simply ends at the flag stripe. */}
        <SponsorBanner />

      </div>

      {/* Featured Makers — the warm band, so the first move below the white
          hero is a change of surface. With the mission statement removed, the
          page alternates hero (white) → Makers (warm) → Products (white) →
          deep-blue CTA → News (white), keeping the gentle warm/white swap
          rather than running two white sections together. */}
      <section className="section-y section-band">
        <div className="site-container">
          {/* Keeps its heading — unlabelled portraits give a first-time visitor
              no context — but no intro paragraph, because the mission statement
              directly above already introduces the makers and the provenance
              promise. The faces carry the section.

              "Meet the makers" is this section's line alone now. The hero eyebrow
              used to default to "Meet the Makers Behind Every Piece", which said
              the same thing one screen up; it now leads with what the business is
              instead. */}
          <div className="flex items-end justify-between mb-stack">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-medium text-deep-blue">
                {text['homepage.makersHeading']}
              </h2>
              <FlagDivider variant="mark" className="mt-xs" />
            </div>
            {/* Text comes from the CMS (`homepage.makersButton`). It used to be
                hardcoded "View all" while the CMS field sat unused, so an editor
                could change the string and nothing happened. */}
            <Link
              href="/makers"
              className="inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              {text['homepage.makersButton']}
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

      {/* Featured Products — white, between the warm Makers band above and the
          deep-blue CTA below, so the body alternates
          warm → white → deep-blue → white instead of running two warm sections
          together. */}
      <section className="section-y">
        <div className="site-container">
          {/* Light label, not a full titled section. The products speak for
              themselves, so instead of a big heading + flag-mark + intro
              paragraph this is a quiet eyebrow with the "View all" link beside
              it. The heading text still comes from the CMS so it stays editable.

              It stays a real <h2>, only styled small: the section needs a
              landmark in the heading outline or a screen-reader user paging by
              heading gets h1 → "Meet the makers" → nothing → the CTA, with the
              featured products invisible to that navigation. The grid's
              aria-label only helps once you are already inside it. Visually
              identical to a span — semantics and appearance are separate
              decisions here. */}
          <div className="flex items-center justify-between mb-stack">
            <h2 className="text-xs font-bold uppercase tracking-widest text-warm-gray-400">
              {text['homepage.productsHeading']}
            </h2>
            <Link
              href="/catalogue"
              className="hidden sm:inline-flex items-center gap-3xs text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div role="list" aria-label="Featured products" className={featuredPosterGridClasses}>
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
          {/* Why there are no prices. A visitor who has just scrolled a grid of
              unpriced products has no way to tell whether the site is broken,
              sold out, or not selling to them — the wholesale-only rule is a
              business decision, but until now the page never said so anywhere
              above the CTA band. Sits directly under the grid, where the question
              occurs. Clearing the CMS field hides it. */}
          {text['homepage.productsPricingNote'] && (
            <CmsText
              value={text['homepage.productsPricingNote']}
              className="mt-stack max-w-2xl"
              paragraphClassName="text-base leading-body text-warm-gray-600"
            />
          )}
          <div className="sm:hidden mt-stack text-center">
            <ButtonLink href="/catalogue" variant="secondary">
              {text['homepage.productsButton']}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Stocked by — a wholesale trust band naming the shops that stock SIAC,
          flowing straight into the "stock us too" CTA below it. Renders nothing
          until an admin fills in real, confirmed stockist names, so today (no
          names stored) the page runs Products → CTA unchanged. Warm surface to
          keep the warm/white alternation between the white Products section
          above and the deep-blue CTA below. */}
      <StockedByBand />

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
