import Image from 'next/image';
import type { Supporter } from '@/types';
import { resolveImageUrl } from '@/lib/api-client';
import { getSupportersSafe } from '@/services/supporters';
import { getSiteTextSafe } from '@/services/site-text';

/** Below this count the band uses the credit line rather than the wall. */
const WALL_THRESHOLD = 3;

/** True only for an absolute http(s) URL. `javascript:` and friends are not. */
function isWebHref(href: string | undefined | null): href is string {
  if (!href) return false;
  try {
    const { protocol } = new URL(href);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

interface SponsorBannerProps {
  /**
   * Set to false when the banner is rendered inside an existing
   * `.site-container`. Two nested containers stack their gutters and push the
   * logos in twice as far as the content around them.
   */
  contained?: boolean;
}

/**
 * Supporter logos, shown below the hero on the homepage.
 *
 * Managed under Admin → Supporters, with the one confirmed supporter bundled in
 * the service as a fallback for a backend that predates the supporters API.
 * A genuinely empty list still hides the band rather than showing an empty
 * label: better to show nothing than to claim backing that is not confirmed.
 *
 * Sized by BOX, not by height. A shared `h-*` across artwork of differing aspect
 * ratios hands a square crest far more visual mass than a long wordmark set to
 * the same height, so the logos stop reading as equals. Each one gets an
 * identical box and is fitted inside it.
 *
 * Deliberately unfiltered. A `grayscale`/`opacity` treatment exists to stop a
 * wall of colourful corporate logos fighting each other; applied to monochrome
 * ink it has nothing to desaturate and only lifts solid black to a muddy grey,
 * making good artwork look degraded. Emphasis is controlled with size instead.
 */
export async function SponsorBanner({ contained = true }: SponsorBannerProps = {}) {
  const [supporters, text] = await Promise.all([getSupportersSafe(), getSiteTextSafe()]);

  // A supporter with no artwork would render an empty box.
  const visible = supporters.filter((supporter) => supporter.logoUrl);
  if (visible.length === 0) return null;

  const label = text['homepage.supportersLabel'];

  const band =
    visible.length >= WALL_THRESHOLD ? (
      <SponsorWall supporters={visible} label={label} />
    ) : (
      <SponsorCredit supporters={visible} label={label} />
    );

  return (
    <section className="py-5 sm:py-6 lg:py-8" aria-label="Our supporters">
      {contained ? <div className="site-container">{band}</div> : band}
    </section>
  );
}

interface BandProps {
  supporters: Supporter[];
  label: string;
}

/**
 * One or two supporters: an inline credit line, left-aligned on the same edge as
 * the headline below it. Centring this would signal "wall of logos" and then
 * deliver one, which reads as an unfinished placeholder.
 */
function SponsorCredit({ supporters, label }: BandProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-3">
        <SponsorLabel label={label} />
        {/* Separates the eyebrow from the artwork so the two stop competing on
            one baseline. Quiet on purpose — an accent colour here would pull
            more attention than the credit deserves. */}
        <span className="h-px w-8 bg-sand-dark" aria-hidden="true" />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {supporters.map((supporter) => (
          <SponsorLogo key={supporter.id} supporter={supporter} />
        ))}
      </div>
    </div>
  );
}

/**
 * Three or more supporters: a centred wall with the label above it, so the
 * logos share a baseline and read as a set rather than a sentence.
 */
function SponsorWall({ supporters, label }: BandProps) {
  return (
    <>
      <div className="text-center mb-3 sm:mb-4">
        <SponsorLabel label={label} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:gap-x-12">
        {supporters.map((supporter) => (
          <SponsorLogo key={supporter.id} supporter={supporter} />
        ))}
      </div>
    </>
  );
}

function SponsorLabel({ label }: { label: string }) {
  if (!label) return null;
  return (
    <p className="text-xs uppercase tracking-widest text-warm-gray-400">{label}</p>
  );
}

/**
 * A logo fitted inside a fixed box. `max-h-full max-w-full` on a replaced
 * element preserves the aspect ratio while fitting the larger dimension, so
 * artwork of any shape lands inside the same footprint undistorted.
 */
function SponsorLogo({ supporter }: { supporter: Supporter }) {
  const image = (
    <Image
      src={resolveImageUrl(supporter.logoUrl)}
      /* A supporter logo is a wordmark: the name is the accessible name, so a
         separate alt field only earns its keep when the artwork says something
         the name does not. */
      alt={supporter.logoAlt || supporter.name}
      /* Intrinsic-ish dimensions, so next/image reserves space before the file
         loads and no layout shift occurs. The box does the real sizing. */
      width={240}
      height={112}
      sizes="(min-width: 640px) 144px, 112px"
      className="max-h-full max-w-full w-auto object-contain"
    />
  );

  const box = 'flex h-10 w-28 items-center justify-center sm:h-12 sm:w-36';

  /* Unlinked logos get no hover treatment. The previous hover-to-reveal sat on a
     plain div: nothing to click, no keyboard focus, and invisible to touch
     entirely — a promise the UI could not keep.

     A logo whose href is not a web address is treated the same as one with no
     href at all. The supporters serializer already rejects anything that is not
     http(s), but this is rendered straight into an anchor, so it does not rely
     on that being the only path a row can arrive by. */
  if (!isWebHref(supporter.href)) {
    return <span className={box}>{image}</span>;
  }

  return (
    <a
      href={supporter.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${supporter.name} (opens in a new tab)`}
      className={`${box} tap-target rounded-sm opacity-80 transition-opacity duration-200 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2`}
    >
      {image}
    </a>
  );
}
