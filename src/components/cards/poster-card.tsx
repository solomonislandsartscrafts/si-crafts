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

/** Portrait frame shared by all cards. Keeps the grid rhythm identical. */
const FRAME_ASPECT = 'aspect-[3/4]';

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
 * Scrim for overlay cards. White text sits on an arbitrary photograph, so a
 * scrim is a contrast requirement, not decoration — `deep-blue` at full opacity
 * along the bottom edge gives white text 10.6:1 regardless of the image
 * underneath. This is the documented exception to the no-gradients rule.
 *
 * Half the frame from `sm` up: it only needs to cover the two lines of caption,
 * and any taller starts hiding the person. On a phone the frame is two columns
 * wide, so the same two lines wrap further and need three fifths to stay
 * covered — the scrim has to fit the text, or the text is not legible.
 */
export const posterScrimClasses =
  'pointer-events-none absolute inset-x-0 bottom-0 h-3/5 sm:h-1/2 bg-gradient-to-t from-deep-blue via-deep-blue/60 to-transparent';

/** Pill sitting on the image. `light` on the image, `dark` on the scrim. */
export const posterPillClasses =
  'rounded-full bg-card-bg px-3 py-1 text-xs font-medium capitalize text-deep-blue shadow-card';

/**
 * Typography for the caption, exported so each card composes the same text
 * treatment instead of retyping the class strings (same reason `inputClasses`
 * exists for forms).
 */
export const posterTitleClasses =
  'font-heading text-base font-semibold leading-tight text-deep-blue';
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
  /** Small label shown top-right on the image. */
  pill?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Content laid over the image — scrim, pills, overlaid caption. Positioned
   * absolutely by the caller against this frame.
   */
  children?: React.ReactNode;
}

/**
 * The image frame on its own, without a link wrapper.
 *
 * Cards whose caption contains its own controls (quantity steppers, Add to
 * Order) use this directly, because a button cannot be nested inside a link.
 * Also used by MakerCard for the overlay-caption pattern.
 */
export function PosterFrame({
  src,
  alt,
  fit = 'cover',
  pill,
  sizes = '(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw',
  priority,
  children,
}: PosterFrameProps) {
  return (
    <div
      className={`relative ${FRAME_ASPECT} overflow-hidden rounded-lg bg-card-bg shadow-card transition-shadow duration-200 group-hover:shadow-md`}
    >
      <SafeImage
        src={src ?? null}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`transition-transform duration-300 group-hover:scale-105 ${
          fit === 'contain' ? 'object-contain p-3' : 'object-cover'
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
 * The frame is a fixed 3:4 whatever the caption holds, so the images in a grid
 * line up row to row; a frame that grew with its caption pulled neighbouring
 * cards out of step. The link itself carries no panel or `overflow-hidden`, so
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
