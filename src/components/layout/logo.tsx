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
 * Light-on-dark: the artwork is dark ink on transparency, so it disappears on a
 * dark surface. `onDark` applies a `brightness-0 invert` filter that renders the
 * single-colour mark crisp white, reusing the one PNG rather than shipping a
 * second reversed asset. The footer uses it; the admin sidebar renders its own
 * white text instead.
 *
 * There was also an `onDarkFromLg` prop, for the homepage header when it floated
 * transparent over a coloured hero band on desktop only. Both that header
 * treatment and the coloured hero are gone, so the prop went with them.
 */
interface LogoProps {
  className?: string;
  /**
   * Render the mark white, for placement on a dark background. Applies at every
   * width.
   */
  onDark?: boolean;
}

export function Logo({ className = '', onDark = false }: LogoProps) {
  const darkFilter = onDark ? 'brightness-0 invert' : '';
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
