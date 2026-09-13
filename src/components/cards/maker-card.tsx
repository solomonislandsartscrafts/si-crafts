import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Maker } from '@/types';
import { PosterFrame } from './poster-card';
import {
  MAKER_ASPECT,
  PosterCard,
  posterBodyClasses,
  posterTitleClasses,
} from './poster-card';

interface MakerCardProps {
  maker: Maker;
  /**
   * The craft this maker practises (e.g. "Weaving"). Shown on the card as a
   * one-line cue and folded into the alt text so a screen reader also hears
   * what the person makes. Optional — callers that do not have it (or where it
   * would be redundant) can omit it and the card falls back to name + place.
   */
  craftName?: string;
  /**
   * `"poster"` (default) is the vertical card — square photo on top, caption
   * below — used in the homepage carousel where each tile is a narrow
   * fixed-width column.
   *
   * `"row"` is the health.nz mobile pattern: on a phone the card is a
   * full-width horizontal row — a small square thumbnail on the LEFT, name /
   * craft / place stacked on the RIGHT — so a single-column maker list reads as
   * a scannable list of people rather than one huge photo per screen. At `sm:`
   * and up, where the grid is 2+ columns, it reverts to the vertical poster so
   * the two layouts never fight inside one grid. Pass this from the full-width
   * single-column grids (makers page, craft page).
   */
  layout?: 'poster' | 'row';
}

/**
 * Maker card — portrait, then the name and place beneath it.
 *
 * The caption used to sit ON the photograph, which needed a gradient scrim to
 * make white text legible over an arbitrary image, a clamp on both lines so
 * text could not escape the scrim, and padding that tightened at 2-up. Moving
 * the caption below the frame removes all of it: the text is dark-on-white at
 * 11.9:1, needs no scrim, and cannot collide with the photo — plain
 * `PosterCard` with nothing added.
 *
 * `cover` fit — a portrait is framed expecting a crop — on the `MAKER_ASPECT`
 * frame (square, like every other card). See `MAKER_ASPECT`.
 */
export function MakerCard({ maker, craftName, layout = 'poster' }: MakerCardProps) {
  const href = `/maker/${maker.slug}`;
  const alt = `${maker.name}, ${craftName || 'maker'} from ${maker.village}`;

  // The caption is identical in both layouts, so it lives here once. In the
  // poster layout the name centres on a phone (it sits under a full-width
  // photo); in the row layout it is always left-aligned beside the thumbnail.
  const caption = (justify: 'center' | 'left') => (
    <>
      {/* Name + a small arrow cue. The arrow is always visible (not hover-only),
          so the card signals it is tappable at rest too — which matters on
          touch, where there is no hover state at all. It sits in the ocean
          accent, the site's interactive colour, and nudges right on hover to
          reinforce "go to this maker". aria-hidden: the whole card is one link
          whose accessible name already comes from the heading, so the arrow is
          decorative to a screen reader. */}
      <h3
        className={`${posterTitleClasses} flex items-center gap-2xs ${
          justify === 'center' ? 'justify-center sm:justify-start' : 'justify-start'
        }`}
      >
        <span className="line-clamp-2">{maker.name}</span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-ocean transition-transform duration-200 group-hover:translate-x-3xs"
          aria-hidden="true"
        />
      </h3>
      {/* The two supporting lines are ONE block, set 8px below the name with 4px
          between them. Previously all three lines sat 4px apart, which is the
          hairline rung of the spacing scale — at that distance a name, a craft
          and a place read as an undifferentiated list rather than a title with
          support under it. Grouping them also means the gap below the name does
          not change depending on whether `craftName` was passed. */}
      <div className="mt-2xs space-y-3xs">
        {/* Craft, when the caller has it — a one-word cue (Weaver / Carver /
            Jeweller) that tells the visitor what this person makes before they
            click. Ocean text, so it reads as the interactive/thematic accent. */}
        {craftName && <p className="text-sm font-medium text-ocean">{craftName}</p>}
        {/* Body size, not the 14px meta size an article date gets. The hero
            slideshow shows this same village/province line at 16px, and
            provenance is the point of the site — the place a piece comes from
            should not be set as a footnote in one place and read as content in
            another. */}
        <p className={posterBodyClasses}>
          {maker.village}, {maker.province}
        </p>
      </div>
    </>
  );

  // Vertical poster card — square photo on top, caption below. The default,
  // used by the homepage carousel where each tile is a narrow fixed-width
  // column that a horizontal row would not suit.
  if (layout === 'poster') {
    return (
      <PosterCard
        href={href}
        src={maker.portraitUrl}
        alt={alt}
        fit="cover"
        aspect={MAKER_ASPECT}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      >
        {caption('center')}
      </PosterCard>
    );
  }

  // Row card — the health.nz mobile pattern. On a phone this is a full-width
  // horizontal row (thumbnail left, caption right); at `sm:` it becomes the same
  // vertical poster as above, so a 2+-column grid keeps one card language. The
  // shared hover treatment (lift + shadow step + warm surface) and the same
  // `bare` PosterFrame are reused from PosterCard so the two variants match.
  return (
    <div role="listitem">
      <Link
        href={href}
        className="group flex flex-row items-stretch overflow-hidden rounded-lg bg-card-bg shadow-card transition-all duration-200 hover:-translate-y-1 hover:bg-section-warm hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean sm:flex-col"
      >
        {/* Thumbnail: a fixed-width square on the phone (the health.nz row
            thumbnail), then the full-width square poster frame from `sm:` up.
            `shrink-0` keeps the phone thumbnail from being squeezed by a long
            name. */}
        <div className="w-28 shrink-0 sm:w-full">
          <PosterFrame
            src={maker.portraitUrl}
            alt={alt}
            fit="cover"
            aspect={MAKER_ASPECT}
            sizes="(max-width: 640px) 128px, (max-width: 1024px) 50vw, 25vw"
            bare
          />
        </div>
        {/* Caption fills the rest of the row, vertically centred on the phone so
            a short two-line caption sits level with the square thumbnail. */}
        <div className="flex flex-1 flex-col justify-center p-sm text-left">
          {caption('left')}
        </div>
      </Link>
    </div>
  );
}
