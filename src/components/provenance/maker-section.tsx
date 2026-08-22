import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import type { Maker, Craft } from '@/types';

/**
 * "Meet the Maker" — quote-first with compact attribution.
 *
 * The maker's voice leads. The portrait and identity metadata sit in a small
 * attribution row beneath the quote. This ensures the story lands first,
 * which matches the provenance page's core job: telling the visitor who
 * made their piece, in that maker's own words.
 *
 * Consent: renders nothing at all unless `maker.publishedFlag` is true.
 */
interface MakerSectionProps {
  maker?: Maker | null;
  craft?: Craft | null;
  excerptLength?: number;
  /**
   * Shown when a maker has no story of their own.
   *
   * Admin-editable, and blankable on purpose: writing provenance narrative on a
   * maker's behalf is exactly what the cultural guardrails warn against, so
   * clearing this leaves the space empty rather than inventing a story.
   * Supports {name}, {village} and {province} placeholders.
   */
  storyFallback?: string;
}

export function MakerSection({
  maker,
  craft,
  excerptLength = 200,
  storyFallback = '',
}: MakerSectionProps) {
  if (!maker || !maker.publishedFlag) return null;

  const storyExcerpt = maker.story
    ? maker.story.length > excerptLength
      ? `${maker.story.slice(0, excerptLength - 1).trim()}\u2026`
      : maker.story
    : null;

  return (
    <section className="mt-8">
      <h2 className="font-heading text-2xl font-medium text-deep-blue mb-3">
        Meet the Maker
      </h2>

      <div className="border-t border-sand pt-5">
        {/* Quote — the maker's voice leads */}
        {storyExcerpt ? (
          <blockquote className="mb-4">
            <p className="text-base text-warm-gray-800 italic leading-relaxed">
              &ldquo;{storyExcerpt}&rdquo;
            </p>
          </blockquote>
        ) : (
          storyFallback.trim() && (
            <p className="text-base text-warm-gray-600 leading-relaxed mb-4">
              {storyFallback
                .replace(/\{name\}/g, maker.name)
                .replace(/\{village\}/g, maker.village)
                .replace(/\{province\}/g, maker.province)}
            </p>
          )
        )}

        {/* Attribution row — avatar + name + location + craft */}
        <div className="flex items-center gap-3">
          <Link
            href={`/maker/${maker.slug}`}
            className="group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ocean rounded-full"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div className="w-10 h-10 relative rounded-full overflow-hidden bg-sand">
              <SafeImage
                src={maker.portraitUrl}
                alt=""
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="40px"
              />
            </div>
          </Link>

          <div className="min-w-0">
            <p className="text-base font-medium text-deep-blue leading-tight">
              <Link
                href={`/maker/${maker.slug}`}
                className="hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm"
              >
                {maker.name}
              </Link>
            </p>
            <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-warm-gray-600 leading-tight mt-0.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{maker.village}, {maker.province}</span>
              {craft && (
                <>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={`/craft/${craft.slug}`}
                    className="text-ocean hover:text-ocean-dark transition-colors"
                  >
                    {craft.name}
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Read more link */}
        <Link
          href={`/maker/${maker.slug}`}
          className="inline-block mt-4 text-base font-medium text-ocean hover:text-ocean-dark transition-colors"
        >
          Read {maker.name}&apos;s full story →
        </Link>
      </div>
    </section>
  );
}
