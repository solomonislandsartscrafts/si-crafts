import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';

/**
 * The poster card — the one card shape used for every piece of public content:
 * products, makers, crafts, and articles.
 *
 * A fixed-ratio frame carries the image full bleed, and the caption sits BELOW
 * the frame on the page background. There is no panel around the pair: on a
 * white page a border round the caption added weight without adding separation.
 *
 * Every card in `components/cards` composes this, so the chrome cannot drift
 * between them. If you need to change card appearance, change it here.
 */

/*
 * FRAME RATIOS.
 *
 * All three are currently `aspect-square`. That is deliberate, not an oversight:
 * a single shape across products, makers and news means every card grid on the
 * site shares one rhythm, and a mixed page (say a listing above a news strip)
 * does not change card language halfway down. An earlier version used three
 * different ratios — 3/4 for products and crafts, 4/5 for makers, 3/2 for news —
 * and the comments below used to argue for each of them; if you are reading this
 * because you want to reintroduce a distinct shape for one subject, that history
 * is why the three names still exist.
 *
 * The names are kept even though the values are identical, for two reasons: a
 * call site reads as `aspect={MAKER_ASPECT}` so the intent is visible, and one
 * subject can be given its own shape later by editing one line here rather than
 * hunting call sites. Do NOT pass a free-form ratio at a call site — that is how
 * a grid loses its rhythm.
 */

/**
 * The house frame — products and crafts.
 *
 * Exported because the homepage hero gallery uses the same frame shape. It
 * cannot compose `PosterFrame` itself (it needs a tinted well and stacked
 * cross-fading images), so it imports the ratio instead — one definition means
 * the hero and the grid below it cannot drift apart.
 */
export const FRAME_ASPECT = 'aspect-square';

/**
 * Maker frame — same square as the rest.
 *
 * A maker photograph is a person with their work, framed expecting a crop, so it
 * takes `object-cover`. Square suits it well: the tall portrait this used to be
 * put the face and the piece in a narrow band at the top of the frame with shirt
 * and lap filling the rest. A square crop lands the subject nearer the centre.
 */
export const MAKER_ASPECT = 'aspect-square';

/**
 * News frame — 16:9 landscape.
 *
 * News is the one subject that reads as itself through its FRAME as well as its
 * caption. Products, makers and crafts share the square; a landscape thumbnail
 * over a date + headline + standfirst is the shape every news list uses (BBC,
 * Guardian, Medium), so a row of these reads as an article list rather than a
 * product grid. This is the divergence the three aspect names were kept for.
 *
 * A story's cover photograph is a scene, so it takes `object-cover` like a maker
 * portrait. When there is no cover, `ArticleCard`/`FeaturedArticleCard` pass a
 * branded `fallback` to `PosterFrame` rather than showing the generic grey well.
 */
export const ARTICLE_ASPECT = 'aspect-video';

/**
 * The grid every poster-card listing uses — products, makers, crafts, news.
 *
 * One definition so column counts cannot drift page to page. TWO columns on a
 * phone: a compact-storefront look modelled on the reference gallery
 * (galleryaustralia.com.au), where two pieces per row let a browsing visitor
 * scan more of the collection at once. It steps to 3 at `lg` and 4 at `xl` —
 * density returns as the screen widens. (This was single-column for a while,
 * for a "one card, one row" health.nz feel; it is 2-up again by request, to
 * match the reference storefront. Every listing that uses it — catalogue,
 * crafts, makers, news — spans the full `.site-container` width so the grid
 * lines up with the page banner and any CTA band rather than sitting narrower.)
 *
 * The gutter is `gap-grid` — 16px, stepping to 24px at 920px — and it is the
 * SAME value horizontally and vertically. It used to be tighter across than
 * down (16/24) on the theory that closer columns compare better at 2-up; in
 * practice it was one of three different gutter recipes in use across the site's
 * card grids, and an uneven gutter is visible as soon as two grids sit on one
 * page. One token, both axes, every grid.
 *
 * It is deliberately TIGHT — the smallest structural gap in the system, and a
 * clear rung below `stack` (the section-heading-to-content gap). It was 24 → 32,
 * which happened to be exactly `stack`, so the space under a heading was the
 * same as the space between two cards and nothing marked where the heading
 * ended and the grid began. A tight gutter under a wide heading gap is what
 * makes the row read as one block of imagery rather than a scatter of tiles.
 * Change it in `globals.css` (`--grid-gap`), never here.
 */
export const posterGridClasses =
  'grid grid-cols-2 gap-grid lg:grid-cols-3 xl:grid-cols-4';

/**
 * The FEATURED poster grid — the homepage variant, capped at three columns.
 *
 * The full catalogue wants density (4-up at `xl`), but the homepage is a
 * showcase: four small tiles read as an index, three larger ones read as
 * "here are a few pieces worth looking at." Same `gap-grid` gutter and same
 * single-column-on-a-phone floor as `posterGridClasses`, only the desktop
 * ceiling differs, so the two grids still sit in the same rhythm on any page
 * that shows both. Homepage-only: do not use this for a full listing.
 */
export const featuredPosterGridClasses =
  'grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3';

/**
 * The news grid — one column on a phone, then two and three.
 *
 * Caps at three rather than four: a news caption (date, headline, three-line
 * standfirst) is much taller than a product's, and at 4-up the text block
 * outweighs the picture. One column per row on a phone gives a story its own
 * line, which is how a news list is read anyway.
 */
export const articleGridClasses =
  'grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3';

/**
 * The news grid for a SHORT list — a /news page with no featured lead card.
 * Same one/two-column ramp, but capped at two columns and centred in a narrower
 * column, so one or two cards sit balanced in the page instead of hugging the
 * left edge with a wide gap on the right — the failure mode a full-width 3-up
 * grid has at low counts. Above the threshold the page switches to the featured
 * lead + `articleGridClasses` instead.
 *
 * This is for a page whose own heading is centred / full-bleed (the /news
 * banner). Where the section heading is LEFT-aligned — the homepage "Latest
 * news" block — use `shortArticleGridClasses` instead, so the cards line up
 * under the heading rather than floating centred beneath a left-aligned title.
 */
export const centeredArticleGridClasses =
  'grid grid-cols-1 gap-grid sm:grid-cols-2 mx-auto max-w-3xl';

/**
 * The news grid for a SHORT list under a LEFT-aligned heading — the homepage
 * "Latest news" block with one or two stories. Same one/two-column, capped-at-two
 * ramp as `centeredArticleGridClasses`, but left-aligned (no `mx-auto`) and
 * capped at `max-w-3xl` so a pair of cards sits flush under the heading and the
 * flag mark above them, rather than centred in the page. A 3-up grid at this
 * count would leave an empty third column, so it still caps at two.
 */
export const shortArticleGridClasses =
  'grid grid-cols-1 gap-grid sm:grid-cols-2 max-w-3xl';

/*
 * There is no scrim export any more. It existed so MakerCard could lay white
 * text over a portrait; every card now captions below the frame instead, so no
 * text sits on a photograph and nothing needs a gradient behind it. If an
 * overlay card is ever wanted again, note the constraint it has to meet: white
 * text over an arbitrary image needs a solid `deep-blue` base at the bottom
 * edge to reach 10.6:1, and the scrim has to be tall enough to cover the
 * caption at its longest wrap — not just at desktop width.
 */

/**
 * Pill sitting on the image, top right. Set via PosterFrame's `pill` prop.
 *
 * An OUTLINED chip: solid white fill, `ocean` border, `ocean` text. The solid
 * `deep-blue` fill it used to have read too strongly against the quiet card, so
 * it was softened to an outline that labels without shouting.
 *
 * The fill is solid white, NOT transparent. Product photos are `contain`-fit
 * studio shots, which very often means a white or near-white background — a
 * transparent chip with only a border would lose its outline against exactly
 * those images. A solid white fill keeps the pill and its ocean border legible
 * over any photo, light or dark, without depending on what was uploaded. Ocean
 * text on white is 4.5:1 (AA).
 *
 * Kept as tight as the label allows: `px-xs` (12) not `px-sm` (16), and no
 * shadow. This is the ONLY thing now drawn over the photograph — the "View"
 * hover overlay was removed for exactly that reason — so it has to earn its
 * space. It does: material category and article tag are content a buyer scans,
 * not decoration.
 */
export const posterPillClasses =
  'inline-flex items-center rounded-full border border-ocean bg-white px-xs py-3xs text-xs font-medium capitalize text-ocean';

/**
 * Typography for the caption, exported so each card composes the same text
 * treatment instead of retyping the class strings (same reason `inputClasses`
 * exists for forms).
 *
 * Both title classes carry `group-hover:text-ocean`, and this is a supporting
 * hover affordance alongside the panel's shadow/lift. `shadow-card` is now a
 * two-layer brand-tinted shadow (see `tailwind.config.ts`) that lifts the card
 * clearly off the white page at rest, and hover steps it up to
 * `shadow-card-hover` under a `-translate-y-1` rise — so the shadow does real
 * work now, not just the title colour. The title still turns ocean because it
 * is the same signal a link gives anywhere else on the site, and it costs
 * nothing. It relies on `PosterCard`'s `group`, so any card composing the frame
 * directly must put `group` on its own link wrapper.
 *
 * Two sizes for a supporting line, and the distinction is meaning, not layout:
 * `posterBodyClasses` (16px) for anything that is content — a maker's name, a
 * village, a description; `posterMetaClasses` (14px) only for true metadata like
 * a publication date. Provenance is the point of this site, so it is never set
 * as a footnote.
 */
export const posterTitleClasses =
  'font-heading text-base font-semibold leading-title-sm text-deep-blue transition-colors duration-200 group-hover:text-ocean';
/**
 * Headline size, for the cards that carry a headline rather than a label — news.
 * A news card is wider than a poster tile and its title is the story, so it
 * takes the design system's full card-heading step instead of the small one.
 */
export const posterHeadlineClasses =
  'font-heading text-lg font-semibold leading-heading text-deep-blue transition-colors duration-200 group-hover:text-ocean';
export const posterBodyClasses =
  'text-base leading-body text-warm-gray-600 line-clamp-2';
export const posterMetaClasses = 'text-sm text-warm-gray-600';
export const posterMutedClasses = 'text-sm text-warm-gray-400';

interface PosterFrameProps {
  src?: string | null;
  alt: string;
  /**
   * `contain` for anything photographed as an object that must not be clipped
   * (a cropped basket handle reads as a defect). `cover` for photographs of
   * people and places, which are framed expecting a crop.
   */
  fit?: 'cover' | 'contain';
  /**
   * Frame ratio. Defaults to `FRAME_ASPECT`, the house shape for products and
   * crafts. Pass `MAKER_ASPECT` for makers or `ARTICLE_ASPECT` for news — all
   * three are square today, but naming the subject keeps the call site readable
   * and lets one diverge later. A fixed set defined in this file: a free-form
   * ratio per caller is how a grid loses its rhythm.
   */
  aspect?: typeof FRAME_ASPECT | typeof MAKER_ASPECT | typeof ARTICLE_ASPECT;
  /** Small label shown top-right on the image. */
  pill?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Branded stand-in shown INSTEAD of the missing-image well when `src` is empty
   * or null. News cards pass a deep-blue band with the tag + a glyph so an
   * article with no cover still looks intentional, rather than the generic grey
   * `SafeImage` well. Ignored when `src` is present.
   */
  fallback?: React.ReactNode;
  /**
   * When the frame sits INSIDE a card panel (the `PosterCard` layout, where the
   * whole card — image + caption — is one shadowed rounded surface), the frame
   * must not draw its own surface: no shadow, no rounding, no hover-shadow. The
   * panel owns all of that, and the panel's `overflow-hidden` clips the image to
   * the panel's top corners. Defaults to `false` so a standalone `PosterFrame`
   * (the hero gallery, the stockist card) keeps being its own surface.
   */
  bare?: boolean;
  /**
   * Content laid over the image, positioned absolutely by the caller against
   * this frame. Nothing uses it today — every card captions below the frame.
   * Prefer `PosterCard`'s caption slot over reaching for this.
   */
  children?: React.ReactNode;
}

/**
 * The image frame on its own, without a link wrapper.
 *
 * Cards whose caption contains its own controls (quantity steppers, Add to
 * Order) use this directly, because a button cannot be nested inside a link.
 * Everything else should compose `PosterCard`.
 */
export function PosterFrame({
  src,
  alt,
  fit = 'cover',
  aspect = FRAME_ASPECT,
  pill,
  sizes = '(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw',
  priority,
  fallback,
  bare = false,
  children,
}: PosterFrameProps) {
  const hasImage = typeof src === 'string' && src.trim() !== '';
  // A bare frame draws no surface — the enclosing card panel owns the shadow,
  // rounding and hover-shadow, and clips this image to its top corners.
  const surface = bare
    ? 'bg-card-bg'
    : 'rounded-lg bg-card-bg shadow-card transition-shadow duration-200 group-hover:shadow-card-hover';
  return (
    <div className={`relative ${aspect} overflow-hidden ${surface}`}>
      {!hasImage && fallback ? (
        fallback
      ) : (
        <SafeImage
          src={src ?? null}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`transition-transform duration-300 group-hover:scale-105 ${
            // No inset on `contain`: the frame is already white, so letterboxing
            // is invisible, and padding here would make the stockist catalogue
            // sit at a different size from ProductCard on the public catalogue.
            fit === 'contain' ? 'object-contain' : 'object-cover'
          }`}
        />
      )}
      {pill && (
        <span className={`absolute right-xs top-xs ${posterPillClasses}`}>{pill}</span>
      )}

      {/* There is deliberately NO "View" overlay on the frame.
          ────────────────────────────────────────────────────────────────────
          One existed and went through three versions: a full-bleed
          `bg-deep-blue/30` veil with a centred label, then a full-width bar
          inset at the bottom, then a small corner pill. Every version had the
          same underlying problem, which shrinking it could not fix — it put
          opaque chrome on top of the photograph. On a wholesale catalogue the
          photograph IS the product information: weave, finish, grain, colour.
          Anything laid over it competes with the one thing a buyer came to look
          at, and on a `contain`-fit shot the object floats mid-frame, so there
          is no reliably "empty" corner to hide a label in.
          It was also redundant. The card is a link, `posterTitleClasses` turns
          the title `ocean` on hover, and the image scales 105% — two signals
          that cost no image area. A third saying the same thing only had a
          downside. Deleting it was the simple fix; do not reintroduce it.
          If a card ever genuinely needs an on-image control, put it BELOW the
          frame in the caption, the way `StockistProductCard` does. */}
      {children}
    </div>
  );
}

interface PosterCardProps extends PosterFrameProps {
  href: string;
  /** The caption, rendered inside the card panel below the image. */
  children: React.ReactNode;
}

/**
 * Poster card — image and caption in ONE shadowed rounded panel, wrapped in one
 * link, so the whole card reads as a single object.
 *
 * The caption used to sit on the bare page background below a shadowed frame,
 * with no panel around the pair. That made the title/maker/price line look
 * detached from its own image — two separate things stacked, rather than one
 * card. So the surface (rounded corners, `shadow-card`, the hover-shadow step)
 * now lives on this outer panel: the image is a `bare` `PosterFrame` clipped to
 * the panel's top corners by `overflow-hidden`, and the caption gets its own
 * padding inside the same panel.
 *
 * The frame keeps a fixed ratio whatever the caption holds, so images in a grid
 * line up row to row. The focus ring is on the panel (`focus-within`-safe: it is
 * on the link, which fills the panel), and `overflow-hidden` on the panel does
 * not clip it because the ring is drawn just inside the rounded edge.
 */
export function PosterCard({ href, children, ...frame }: PosterCardProps) {
  return (
    // role="listitem" belongs on this wrapper, NOT on the <a>. Every card grid
    // is a role="list", so the item role is what gives a screen reader the count
    // and position ("2 of 12") — but `listitem` is not an allowed role for an
    // anchor with an href (ARIA in HTML restricts `a[href]` to link-like roles),
    // and putting it there also overrode the link role the card depends on.
    // A plain wrapper carries the list semantics and leaves the anchor a link.
    <div role="listitem">
      <Link
        href={href}
        // The panel: one rounded, shadowed white surface holding image + caption
        // so the card reads as a single object. `overflow-hidden` clips the bare
        // image to the panel's top corners. The focus ring is `ring-inset` so
        // `overflow-hidden` never clips it.
        //
        // Hover, the Health-NZ move adapted to this warm/light palette: the whole
        // card RESPONDS, not just the title. Three signals together —
        //   • a gentle lift (`-translate-y-1`) so the card physically rises,
        //   • the shadow steps up to `shadow-md` under the lift, and
        //   • the panel tints to `ocean/5` so the surface itself reacts
        // — plus the title going `ocean` (baked into `posterTitleClasses`) and
        // the image scaling (in `PosterFrame`). All on one `duration-200`
        // transition so they move as a unit. `prefers-reduced-motion` is handled
        // globally in `globals.css`, which neutralises the transform.
        //
        // The hover fill is SOLID `sand-light` (`#F0F0F0`), not a translucent
        // tint. A translucent `ocean/5` let the surface behind the card bleed
        // through; a solid fill gives a clean, opaque colour change on hover.
        // `sand-light` is chosen for accessibility: it is light enough that
        // every caption text token stays AA (4.5:1) over it — `warm-gray-400`
        // (the muted "Trade pricing" line, the tightest case) clears 4.5:1, and
        // `deep-blue`, `warm-gray-600` and `ocean` all clear it comfortably. A
        // solid darker fill (e.g. `ocean`) would fail contrast for the dark
        // caption text, so it is deliberately not used. `sand-light` is darker
        // than the white card, so the change reads on the white page; on the
        // grey `section-warm` band the lift + `shadow-card-hover` carry the
        // hover cue alongside the title going `ocean`.
        className="group block overflow-hidden rounded-lg bg-card-bg shadow-card transition-all duration-200 hover:-translate-y-1 hover:bg-sand-light hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean"
      >
        <PosterFrame {...frame} bare />
        {/* Caption inside the panel, left-aligned at every width. `p-sm` gives
            the text real breathing room from the panel edges so it reads as part
            of the card rather than crowding the border. */}
        <div className="p-sm text-left">{children}</div>
      </Link>
    </div>
  );
}
