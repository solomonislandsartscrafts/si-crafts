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
 * The horizontal gutter is tighter than the vertical one at 2-up, so the two
 * columns stay close enough to compare while the rows still separate.
 */
export const posterGridClasses =
  'grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4';

/**
 * Same grid, capped at three columns — for the homepage rows that show exactly
 * three items, where a four-column track would leave a visible hole. On a phone
 * this is 2-up like everything else, so the third item sits alone on a second
 * row; that reads as a normal end-of-list, unlike a hidden third card.
 */
export const posterGridClassesThreeUp =
  'grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6 lg:grid-cols-3';

/**
 * The news grid — one column on a phone, then two and three.
 *
 * Landscape cards cannot go 2-up on a phone the way the portrait ones do: at
 * half of a 375px screen the cover photo is about 75px tall and the headline
 * wraps to four lines. One column per row gives a story its own line, which is
 * how a news list is read anyway.
 */
export const articleGridClasses =
  'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

/*
 * There is no scrim export any more. It existed so MakerCard could lay white
 * text over a portrait; every card now captions below the frame instead, so no
 * text sits on a photograph and nothing needs a gradient behind it. If an
 * overlay card is ever wanted again, note the constraint it has to meet: white
 * text over an arbitrary image needs a solid `deep-blue` base at the bottom
 * edge to reach 10.6:1, and the scrim has to be tall enough to cover the
 * caption at its longest wrap — not just at desktop width.
 */

/** Pill sitting on the image, top right. Set via PosterFrame's `pill` prop. */
export const posterPillClasses =
  'rounded-full bg-card-bg px-3 py-1 text-xs font-medium capitalize text-deep-blue shadow-card';

/**
 * Typography for the caption, exported so each card composes the same text
 * treatment instead of retyping the class strings (same reason `inputClasses`
 * exists for forms).
 */
export const posterTitleClasses =
  'font-heading text-base font-semibold leading-tight text-deep-blue';
/**
 * Headline size, for the cards that carry a headline rather than a label — news.
 * A news card is wider than a poster tile and its title is the story, so it
 * takes the design system's full card-heading step instead of the small one.
 */
export const posterHeadlineClasses =
  'font-heading text-lg font-semibold leading-tight text-deep-blue';
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
   * Frame ratio. Portrait by default — that is the house shape for products,
   * makers and crafts. Pass `ARTICLE_ASPECT` for news. Two options, both defined
   * in this file: a free-form ratio per caller is how a grid loses its rhythm.
   */
  aspect?: typeof FRAME_ASPECT | typeof ARTICLE_ASPECT;
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
        <span className={`absolute right-3 top-3 ${posterPillClasses}`}>{pill}</span>
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
    <Link
      href={href}
      className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <PosterFrame {...frame} />
      <div className="pt-3">{children}</div>
    </Link>
  );
}
