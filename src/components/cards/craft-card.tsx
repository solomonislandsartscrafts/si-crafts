import type { Craft } from '@/types';
import {
  PosterCard,
  posterBodyClasses,
  posterTitleClasses,
} from './poster-card';

interface CraftCardProps {
  craft: Craft;
}

/**
 * Craft card — the shared poster tile: the process photo in the house portrait
 * frame, name and description captioned below it.
 *
 * This was the last card still wearing the old panel treatment: a bordered white
 * box wrapping the image AND the caption, a square frame, `p-sm` of internal
 * padding, and a 14px description. Every other card had moved to
 * frame-plus-caption-on-the-page, so a visitor going from the catalogue to
 * /crafts-and-techniques saw the card language change mid-visit. Composing
 * `PosterCard` means the chrome, the frame ratio and the caption typography now
 * come from the same place as products, makers and news, and it drops the site
 * from four frame shapes to three.
 *
 * `contain` fit, as products use: a process photo of a part-finished piece must
 * not have its edges clipped — the weave border is the subject.
 *
 * No pill. A craft's name already IS its material category ("Pandanus
 * weaving"), so a material pill would just repeat the title back.
 */
export function CraftCard({ craft }: CraftCardProps) {
  return (
    <PosterCard
      href={`/craft/${craft.slug}`}
      src={craft.processImageUrls[0] || null}
      alt={craft.processImageAlt || `${craft.name} process`}
      fit="contain"
      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
    >
      <h3 className={`${posterTitleClasses} line-clamp-2`}>{craft.name}</h3>
      <p className={`mt-2xs ${posterBodyClasses}`}>{craft.description}</p>
    </PosterCard>
  );
}
