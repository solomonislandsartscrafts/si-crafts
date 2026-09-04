import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { FlagDivider } from '@/components/layout/flag-divider';
import type { Maker, Craft } from '@/types';

/**
 * "Meet the Maker" — a story-first introduction to the person behind the piece.
 *
 * This section is deliberately the ONE surface on the provenance page that does
 * not look like the plain white sections around it. Everything else — How it's
 * made, Authenticity, Where to buy — sits directly on the page canvas with a
 * hairline rule above it. This one is a warm, full-bleed band (`bg-sand-light`
 * edge-to-edge, capped with a flag hairline) so a visitor scanning the page
 * cannot slide past the human at the centre of it. Provenance is the whole
 * point of the site; the maker is not a footnote.
 *
 * The reading order tells a small story rather than citing a source:
 *   1. the maker's face, large and centred — you meet a person, not a byline;
 *   2. a warm intro label ("A word from {name}") that frames what follows as
 *      them speaking to you;
 *   3. their name, place and craft — who and where;
 *   4. their own words: an opening line pulled out as a spoken-feeling quote,
 *      then the rest as comfortable prose;
 *   5. an invitation to read their full story.
 *
 * Cultural guardrail: the "story" framing is a layout device around the maker's
 * REAL words. We never fabricate a first-person voice. If a maker has no story,
 * the admin-editable `storyFallback` is shown instead (and may be blank on
 * purpose — writing a narrative on a maker's behalf is exactly what the cultural
 * rules forbid).
 *
 * Consent: renders nothing at all unless `maker.publishedFlag` is true.
 */
interface MakerSectionProps {
  maker?: Maker | null;
  craft?: Craft | null;
  excerptLength?: number;
  /**
   * Shown when a maker has no story of their own. Admin-editable, blankable on
   * purpose. Supports {name}, {village} and {province} placeholders.
   */
  storyFallback?: string;
}

export function MakerSection({
  maker,
  craft,
  excerptLength = 260,
  storyFallback = '',
}: MakerSectionProps) {
  if (!maker || !maker.publishedFlag) return null;

  // Split the story into a short spoken-feeling opening line and the rest. The
  // opener is set as a large quote — it reads like the maker greeting you — and
  // the body follows as normal prose so it stays comfortable to read past a
  // line or two.
  const story = maker.story?.trim() || null;
  let pullQuote: string | null = null;
  let storyBody: string | null = null;

  if (story) {
    const firstBreak = story.search(/[.!?](\s|$)/);
    const firstSentence =
      firstBreak !== -1 ? story.slice(0, firstBreak + 1).trim() : story;

    if (firstSentence.length <= 140 && firstSentence.length < story.length) {
      pullQuote = firstSentence;
      const rest = story.slice(firstSentence.length).trim();
      storyBody =
        rest.length > excerptLength
          ? `${rest.slice(0, excerptLength - 1).trim()}\u2026`
          : rest;
    } else {
      storyBody =
        story.length > excerptLength
          ? `${story.slice(0, excerptLength - 1).trim()}\u2026`
          : story;
    }
  }

  const resolvedFallback = storyFallback.trim()
    ? storyFallback
        .replace(/\{name\}/g, maker.name)
        .replace(/\{village\}/g, maker.village)
        .replace(/\{province\}/g, maker.province)
    : '';

  return (
    // Full-bleed warm panel. `-mx-gutter … site-px` breaks the section out to
    // the screen edges and re-applies the page gutter inside, so the coloured
    // band runs edge-to-edge (clearly a different surface from the white
    // sections) while the text still lines up with the rest of the page. The
    // flag hairline caps the top edge the way every deliberate brand band on the
    // site does.
    <section className="relative -mx-gutter mt-lg overflow-hidden bg-sand-light site-px py-xl">
      <div className="flag-hairline absolute inset-x-0 top-0" aria-hidden="true" />

      {/* Centred, capped column — a portrait-led profile reads best as a single
          narrow measure rather than running the full page width. */}
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Portrait, large and first. A gold ring lifts it off the sand panel
            and marks it as the subject of the section. Links through to the
            full maker page like the name does. */}
        {maker.portraitUrl && (
          <Link
            href={`/maker/${maker.slug}`}
            aria-hidden="true"
            tabIndex={-1}
            className="group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-sand ring-4 ring-accent-gold/70 ring-offset-4 ring-offset-sand-light shadow-card sm:h-32 sm:w-32">
              <SafeImage
                src={maker.portraitUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="128px"
              />
            </div>
          </Link>
        )}

        {/* Intro label — the storytelling frame. Small, uppercase, with a flag
            mark under it. Names the section AND sets up the maker's words as a
            personal address rather than a block of copy. */}
        <p className="mt-md text-xs font-semibold uppercase tracking-widest text-terracotta">
          A word from {maker.name}
        </p>
        <FlagDivider variant="mark" className="mt-2xs !mx-auto" />

        {/* Name — the section's h2, but set as a warm greeting rather than a
            plain "Meet the Maker" label. */}
        <h2 className="mt-sm font-heading text-2xl font-medium text-deep-blue sm:text-3xl">
          Meet {maker.name}
        </h2>

        {/* Place + craft — who and where, one quiet line. */}
        <p className="mt-2xs flex flex-wrap items-center justify-center gap-x-2xs gap-y-3xs text-base text-warm-gray-600">
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

        {/* The maker's own words. */}
        {story ? (
          <div className="mt-md">
            {pullQuote && (
              <blockquote>
                <p className="font-heading text-lg italic leading-body-lg text-deep-blue sm:text-xl">
                  &ldquo;{pullQuote}&rdquo;
                </p>
              </blockquote>
            )}
            {storyBody && (
              <p className="mt-sm whitespace-pre-line text-base leading-body text-warm-gray-800">
                {storyBody}
              </p>
            )}
          </div>
        ) : (
          resolvedFallback && (
            <p className="mt-md text-base leading-body text-warm-gray-600">
              {resolvedFallback}
            </p>
          )
        )}

        {/* Invitation to read on — a button-weight link, centred, so the story
            has an obvious next step. */}
        <Link
          href={`/maker/${maker.slug}`}
          className="tap-target mt-md inline-flex items-center gap-2xs text-base font-semibold text-ocean transition-colors hover:text-ocean-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
        >
          Read {maker.name}&apos;s full story
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
