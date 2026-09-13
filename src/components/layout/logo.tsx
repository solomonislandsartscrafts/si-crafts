import Image from 'next/image';

/**
 * Brand lockup — the SIAC logo.
 *
 * The artwork already contains the wordmark ("Solomon Islands Arts & Crafts")
 * alongside the frangipani mark, so no text is rendered beside it. That is why
 * this replaced the previous responsive text wordmark rather than sitting next
 * to it.
 *
 * Sized by height with `w-auto`, so the intrinsic 962x513 ratio is preserved at
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
/**
 * The bundled fallback artwork, used when no logo has been set in
 * Admin → Site Content → Branding. The admin-uploaded logo (when present) is
 * passed in as `src` from the server layout.
 */
const DEFAULT_LOGO_SRC = '/images/sica logo new.png';

interface LogoProps {
  className?: string;
  /**
   * Render the mark white, for placement on a dark background. Applies at every
   * width.
   */
  onDark?: boolean;
  /**
   * Admin-editable logo URL from Site Content. When empty/undefined the bundled
   * artwork is used, so the header never renders a broken image if nothing is
   * set. An uploaded logo is an arbitrary aspect ratio, so it is sized by height
   * with `w-auto` and `object-contain` just like the default.
   */
  src?: string;
  /**
   * Accessible name override. Normally empty — the enclosing link carries its
   * own aria-label — but an admin can set alt text for a logo whose artwork says
   * something the link label does not.
   */
  alt?: string;
}

export function Logo({ className = '', onDark = false, src, alt = '' }: LogoProps) {
  const darkFilter = onDark ? 'brightness-0 invert' : '';
  // An admin-uploaded logo is an arbitrary shape; the bundled artwork is the
  // known 962x513. Only the bundled artwork can rely on those intrinsic
  // dimensions, so a custom logo is given a fill-agnostic box via object-contain
  // and the same width/height as a hint (next/image still needs both).
  const logoSrc = src && src.trim() ? src : DEFAULT_LOGO_SRC;
  return (
    <Image
      src={logoSrc}
      /* Intrinsic dimensions, so next/image knows the true aspect ratio and
         reserves the right space before the file loads (no layout shift). */
      width={962}
      height={513}
      /* Empty alt is deliberate, not an oversight. Every place this renders sits
         inside a link that already carries its own aria-label (e.g. "Solomon
         Islands Arts & Crafts — home"). An aria-label on the link overrides the
         image's alt for the accessible name, so a non-empty alt here would be
         dead text at best and a duplicated announcement at worst. An admin CAN
         override it for a custom logo whose artwork carries extra meaning. */
      alt={alt}
      /* The header is above the fold on every page, so lazy-loading the logo
         would delay the first paint of the brand and can hurt LCP. */
      priority
      /* Tells the browser the real rendered width, so it picks the small
         variant instead of downloading artwork sized for the full 962px slot.
         At the 962:513 ratio the mark renders ~90px wide at h-12 and ~82px at
         h-11 — round up for safety. */
      sizes="(min-width: 640px) 96px, 88px"
      /* `object-contain` + `max-w-full` so a custom logo of any aspect ratio is
         fitted to the header height without distorting or overflowing the row.
         The bundled artwork is already the right shape, so this is a no-op for
         it. */
      className={`h-11 w-auto max-w-full object-contain sm:h-12 ${darkFilter} ${className}`.trim()}
    />
  );
}
