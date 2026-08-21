import Link from 'next/link';
import type { Maker } from '@/types';
import { PosterFrame, posterPillClasses, posterScrimClasses } from './poster-card';

interface MakerCardProps {
  maker: Maker;
  craftName?: string;
}

/**
 * Maker card — portrait with the name and place laid over it.
 *
 * A listing card answers three things: who, where, and what craft. Anything
 * more belongs on the maker's own page. Earlier versions also carried a story
 * excerpt, a labelled location row, a divider, and a "View story" button; all
 * were cut. The button in particular was redundant, since the whole card is
 * already a link.
 *
 * `cover` fit — a portrait is framed expecting a crop. The scrim is a contrast
 * requirement, not decoration: white text over an arbitrary photograph is not
 * legible without it.
 */
export function MakerCard({ maker, craftName }: MakerCardProps) {
  return (
    <Link
      href={`/maker/${maker.slug}`}
      className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean"
    >
      <PosterFrame
        src={maker.portraitUrl}
        alt={`${maker.name}, ${craftName || 'maker'} from ${maker.village}`}
        fit="cover"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 33vw"
      >
        <div className={posterScrimClasses} />

        {/* The craft is one of the three things this card answers, so it has to
            be visible — alt text is not a substitute. Omitted when unknown
            rather than filled with a generic label. */}
        {craftName && (
          <span className={`absolute left-3 top-3 ${posterPillClasses}`}>{craftName}</span>
        )}

        {/* Padding tightens on a phone so the two lines still fit inside the
            scrim at two-column width. Both lines are clamped for the same
            reason: text that overflows the scrim sits on the bare photograph,
            where white is not reliably legible. */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <h3 className="font-heading text-base sm:text-lg font-semibold leading-tight text-white line-clamp-2">
            {maker.name}
          </h3>
          <p className="mt-1 text-base text-white/85 line-clamp-2">
            {maker.village}, {maker.province}
          </p>
        </div>
      </PosterFrame>
    </Link>
  );
}
