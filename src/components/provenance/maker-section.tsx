import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import type { Maker, Craft } from '@/types';

/**
 * "Meet the Maker" — a compact introduction to the person behind the piece.
 *
 * Kept deliberately small: a portrait beside the maker's name, place and craft,
 * and a link through to their full story. Provenance is the point of the site,
 * so the maker is present on the page — but it is a tight profile card, not a
 * full-height band, so it does not push the rest of the provenance detail down.
 *
 * Cultural guardrail: we never fabricate a first-person voice. The full story
 * lives on the maker page; this section only introduces the person.
 *
 * Consent: renders nothing at all unless `maker.publishedFlag` is true.
 */
interface MakerSectionProps {
  maker?: Maker | null;
  craft?: Craft | null;
}

export function MakerSection({ maker, craft }: MakerSectionProps) {
  if (!maker || !maker.publishedFlag) return null;

  return (
    <section className="mt-lg rounded-lg bg-sand-light p-md">
      <div className="flex items-center gap-md">
        {maker.portraitUrl && (
          <Link
            href={`/maker/${maker.slug}`}
            aria-hidden="true"
            tabIndex={-1}
            className="group flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-sand ring-2 ring-accent-gold/70 sm:h-20 sm:w-20">
              <SafeImage
                src={maker.portraitUrl}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          </Link>
        )}

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Meet the maker
          </p>
          <h2 className="mt-3xs font-heading text-lg font-semibold text-deep-blue">
            {maker.name}
          </h2>
          <p className="mt-3xs flex flex-wrap items-center gap-x-2xs gap-y-3xs text-sm text-warm-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0 text-ocean" aria-hidden="true" />
            <span>{maker.village}, {maker.province}</span>
            {craft && (
              <>
                <span aria-hidden="true">&middot;</span>
                <Link
                  href={`/craft/${craft.slug}`}
                  className="font-medium text-ocean transition-colors hover:text-ocean-dark"
                >
                  {craft.name}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <Link
        href={`/maker/${maker.slug}`}
        className="tap-target mt-sm inline-flex items-center gap-2xs text-base font-semibold text-ocean transition-colors hover:text-ocean-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
      >
        Read {maker.name}&apos;s full story
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
