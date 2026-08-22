import type { Maker } from '@/types';
import { PosterCard, posterBodyClasses, posterTitleClasses } from './poster-card';

interface MakerCardProps {
  maker: Maker;
  /**
   * Not shown on the card — it goes into the alt text so a screen reader still
   * hears what the person makes. Kept as a prop because the callers that have
   * the craft to hand (the homepage and the craft pages) can supply a more
   * useful description than "maker".
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
 * 11.9:1, needs no scrim, and cannot collide with the photo. It also means a
 * maker tile is now the same shape as a product, craft and news tile — this is
 * plain `PosterCard` with nothing added.
 *
 * `cover` fit — a portrait is framed expecting a crop.
 */
export function MakerCard({ maker, craftName }: MakerCardProps) {
  return (
    <PosterCard
      href={`/maker/${maker.slug}`}
      src={maker.portraitUrl}
      alt={`${maker.name}, ${craftName || 'maker'} from ${maker.village}`}
      fit="cover"
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 33vw"
    >
      <h3 className={`${posterTitleClasses} line-clamp-2`}>{maker.name}</h3>
      {/* Body size, not the 14px meta size an article date gets. The hero
          slideshow shows this same village/province line at 16px, and provenance
          is the point of the site — the place a piece comes from should not be
          set as a footnote in one place and read as content in another. */}
      <p className={`mt-1 ${posterBodyClasses}`}>
        {maker.village}, {maker.province}
      </p>
    </PosterCard>
  );
}
