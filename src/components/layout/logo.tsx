import Image from 'next/image';

/**
 * Brand lockup — the SIAC logo.
 *
 * The artwork already contains the wordmark ("Solomon Islands Arts & Crafts")
 * alongside the frangipani mark, so no text is rendered beside it. That is why
 * this replaced the previous responsive text wordmark rather than sitting next
 * to it.
 *
 * Sized by height with `w-auto`, so the intrinsic 404x151 ratio is preserved at
 * every breakpoint and the logo can never distort. Height (44/48px) is kept
 * under the 80px header (h-20) with room to breathe.
 *
 * Light-on-dark: the artwork is dark ink on transparency, so it disappears on
 * dark surfaces (footer, admin sidebar). Those surfaces render their own white
 * text. The homepage hero is the exception — it wants the real lockup on the
 * blue band — so `onDark` applies a `brightness-0 invert` filter that renders
 * the single-colour mark crisp white. This reuses the one PNG rather than
 * shipping a second reversed asset.
 */
interface LogoProps {
  className?: string;
  /**
   * Render the mark white, for placement on a dark background (footer, admin
   * sidebar, hero band). Applies at every width.
   */
  onDark?: boolean;
  /**
   * Render the mark white only from `lg` up, dark ink below. Used ONLY by the
   * homepage header: it floats white over the blue hero on desktop, but below
   * `lg` the header is solid white (transparent-over-hero is desktop-only — see
   * Header), so the dark ink logo is correct on the white mobile bar. Kept
   * separate from `onDark` so a genuinely dark surface (the footer) stays white
   * at every width. Pass one or the other, not both.
   */
  onDarkFromLg?: boolean;
}

export function Logo({ className = '', onDark = false, onDarkFromLg = false }: LogoProps) {
  const darkFilter = onDark
    ? 'brightness-0 invert'
    : onDarkFromLg
      ? 'lg:brightness-0 lg:invert'
      : '';
  return (
    <Image
      src="/images/sica logo.png"
      /* Intrinsic dimensions, so next/image knows the true aspect ratio and
         reserves the right space before the file loads (no layout shift). */
      width={404}
      height={151}
      /* Empty alt is deliberate, not an oversight. Every place this renders sits
         inside a link that already carries its own aria-label (e.g. "Solomon
         Islands Arts & Crafts — home"). An aria-label on the link overrides the
         image's alt for the accessible name, so a non-empty alt here would be
         dead text at best and a duplicated announcement at worst. */
      alt=""
      /* The header is above the fold on every page, so lazy-loading the logo
         would delay the first paint of the brand and can hurt LCP. */
      priority
      /* Tells the browser the real rendered width, so it picks the small
         variant instead of downloading artwork sized for a 404px slot. */
      sizes="(min-width: 640px) 128px, 118px"
      className={`h-11 w-auto sm:h-12 ${darkFilter} ${className}`.trim()}
    />
  );
}
