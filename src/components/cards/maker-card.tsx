import { ArrowRight } from 'lucide-react';
import type { Maker } from '@/types';
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
 * `cover` fit — a portrait is framed expecting a crop — on the shorter
 * `MAKER_ASPECT` (4/5) frame. Makers are a seated-with-their-work scene, and
 * the taller house `3/4` made those tiles read as oversized posters; the 4/5
 * frame keeps the same subject at a calmer height. See `MAKER_ASPECT`.
 */
export function MakerCard({ maker, craftName }: MakerCardProps) {
  return (
    <PosterCard
      href={`/maker/${maker.slug}`}
      src={maker.portraitUrl}
      alt={`${maker.name}, ${craftName || 'maker'} from ${maker.village}`}
      fit="cover"
      aspect={MAKER_ASPECT}
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 25vw"
    >
      {/* Name + a small arrow cue. The arrow is always visible (not hover-only),
          so the card signals it is tappable at rest too — which matters on
          touch, where there is no hover state at all. It sits in the ocean
          accent, the site's interactive colour, and nudges right on hover to
          reinforce "go to this maker". aria-hidden: the whole card is one link
          whose accessible name already comes from the heading, so the arrow is
          decorative to a screen reader. */}
      <h3 className={`${posterTitleClasses} flex items-center gap-2xs`}>
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
    </PosterCard>
  );
}
