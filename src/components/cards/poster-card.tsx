import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';

/**
 * The poster card — the one card shape used for every piece of public content:
 * products, makers, crafts, and articles.
 *
 * A portrait frame carries the image full bleed, and the caption sits BELOW the
 * frame on the page background. There is no panel around the pair: on a white
 * page a border round the caption added weight without adding separation.
 *
 * Every card in `components/cards` composes this, so the chrome cannot drift
 * between them. If you need to change card appearance, change it here.
 */

/**
 * Portrait frame shared by all cards. Keeps the grid rhythm identical.
 *
 * Exported because the homepage hero gallery uses the same frame shape. It
 * cannot compose `PosterFrame` itself (it needs a tinted well and stacked
 * cross-fading images), so it imports the ratio instead — one definition means
 * the hero and the grid below it cannot drift apart.
 */
export const FRAME_ASPECT = 'aspect-[3/4]';

/**
 * Maker frame.
 *
 * A maker photograph is a person seated with their work — a scene, not a
 * product cut-out. The house `3/4` portrait crops that scene tall: on a 3-up
 * homepage row each tile ran ~610px high, so the shirt and lap filled most of
 * the frame while the face and the piece sat in a narrow band up top. `4/5` is
 * a shorter portrait: it holds the same subject but trims roughly a fifth of
 * the height, so a maker tile reads as "meet the person" rather than a poster,
 * and the face + craft land nearer the centre of the crop. Kept portrait (not
 * square) so it still sits in the same column rhythm as the product and craft
 * tiles beside it. Third ratio on purpose — makers are a distinct subject from
 * both the product cut-out (`3/4`) and the news scene (`3/2`).
 */
export const MAKER_ASPECT = 'aspect-[4/5]';

/**
 * Landscape frame for news.
 *
 * A story's cover photograph is a scene — a workshop, a shop floor, a group of
 * people — and a portrait crop of a scene loses the context that makes it worth
 * publishing. It also matters that news does not look like stock: a portrait
 * frame with a pill and a caption reads as a product tile whatever the words
 * under it say, which is exactly the confusion this ratio removes.
 */
export const ARTICLE_ASPECT = 'aspect-[3/2]';

/**
 * The grid every poster-card listing uses — products, makers, crafts, news.
 *
 * One definition so column counts cannot drift page to page. Two columns on a
 * phone rather than one: a portrait frame at full width is a very tall card,
 * and 2-up keeps a listing scannable.
 *
 * The gutter is `gap-grid` — 24px, stepping to 32px at 920px — and it is the
 * SAME value horizontally and vertically. It used to be tighter across than
 * down (16/24) on the theory that closer columns compare better at 2-up; in
 * practice it was one of three different gutter recipes in use across the site's
 * card grids, and an uneven gutter is visible as soon as two grids sit on one
 * page. One token, both axes, every grid.
 */
export const posterGridClasses =
  'grid grid-cols-2 gap-grid lg:grid-cols-3 xl:grid-cols-4';

/**
 * The news grid — one column on a phone, then two and three.
 *
 * Landscape cards cannot go 2-up on a phone the way the portrait ones do: at
 * half of a 375px screen the cover photo is about 75px tall and the headline
 * wraps to four lines. One column per row gives a story its own line, which is
 * how a news list is read anyway.
 */
export const articleGridClasses =
  'grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3';

/**
 * The news grid for a SHORT list shown without a featured lead card (fewer than
 * four stories). Same one/two-column ramp, but capped at two columns and
 * centred in a narrower column, so one or two cards sit balanced in the page
 * instead of hugging the left edge with a wide gap on the right — the failure
 * mode a full-width 3-up grid has at low counts. Above the threshold the page
 * switches to the featured lead + `articleGridClasses` instead.
 */
export const centeredArticleGridClasses =
  'grid grid-cols-1 gap-grid sm:grid-cols-2 mx-auto max-w-3xl';

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
 * Solid `deep-blue` with white text (11.6:1), NOT a white pill. A white pill was
 * the same "arbitrary photograph underneath" problem the caption scrim had, only
 * moved to the badge: product photos are `contain`-fit studio shots, which very
 * often means a white or near-white background, so a white chip with a 6%-opacity
 * shadow all but disappeared on exactly the images it was labelling. A solid
 * dark fill is legible over any photo — light, dark, or empty letterboxing —
 * without depending on what was uploaded.
 */
export const posterPillClasses =
  'rounded-full bg-deep-blue px-xs py-3xs text-xs font-medium capitalize text-white shadow-card';

/**
 * Typography for the caption, exported so each card composes the same text
 * treatment instead of retyping the class strings (same reason `inputClasses`
 * exists for forms).
 *
 * Both title classes carry `group-hover:text-ocean`, and this is the card's real
 * hover affordance. The frame's shadow step (`shadow-card` is
 * `0 2px 8px rgba(0,0,0,0.06)`, hover is `shadow-md`) is a few percent of opacity
 * on a white card sitting on a white page — a change you have to look for. The
 * title turning ocean is the same signal a link gives anywhere else on the site,
 * and it costs nothing. It relies on `PosterCard`'s `group`, so any card
 * composing the frame directly must put `group` on its own link wrapper.
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
   * Frame ratio. Portrait by default — the house shape for products and crafts.
   * Pass `MAKER_ASPECT` for makers (a shorter portrait) or `ARTICLE_ASPECT` for
   * news (landscape). A fixed set defined in this file: a free-form ratio per
   * caller is how a grid loses its rhythm.
   */
  aspect?: typeof FRAME_ASPECT | typeof MAKER_ASPECT | typeof ARTICLE_ASPECT;
  /** Small label shown top-right on the image. */
  pill?: string;
  sizes?: string;
  priority?: boolean;
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
  children,
}: PosterFrameProps) {
  return (
    <div
      className={`relative ${aspect} overflow-hidden rounded-lg bg-card-bg shadow-card transition-shadow duration-200 group-hover:shadow-md`}
    >
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
      {pill && (
        <span className={`absolute right-xs top-xs ${posterPillClasses}`}>{pill}</span>
      )}
      {children}
    </div>
  );
}

interface PosterCardProps extends PosterFrameProps {
  href: string;
  /** The caption, rendered below the frame on the page background. */
  children: React.ReactNode;
}

/**
 * Poster card — the shared frame with a caption below it, wrapped in one link.
 *
 * The frame keeps a fixed ratio whatever the caption holds, so the images in a
 * grid line up row to row; a frame that grew with its caption pulled
 * neighbouring cards out of step. The link itself carries no panel or `overflow-hidden`, so
 * the focus ring is never clipped.
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
        className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean"
      >
        <PosterFrame {...frame} />
        <div className="pt-xs">{children}</div>
      </Link>
    </div>
  );
}
