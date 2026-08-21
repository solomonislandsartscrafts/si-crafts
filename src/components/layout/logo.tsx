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
 * every breakpoint and the logo can never distort. Height is kept under the
 * 64px header (h-16) with room to breathe.
 *
 * Light-on-dark: there is deliberately no `light` variant. The artwork is dark
 * ink on transparency, so it disappears on the footer and admin sidebar. Those
 * surfaces render their own white text instead. Dropping the prop means a
 * future `<Logo variant="light" />` is a compile error rather than an
 * invisible logo.
 */
interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Image
      src="/images/sica logo.png"
      /* Intrinsic dimensions, so next/image knows the true aspect ratio and
         reserves the right space before the file loads (no layout shift). */
      width={404}
      height={151}
      /* Empty alt is deliberate, not an oversight. Every place this renders sits
         inside a link that already carries its own aria-label (e.g. "Solomon
         Islands Arts Crafts — home"). An aria-label on the link overrides the
         image's alt for the accessible name, so a non-empty alt here would be
         dead text at best and a duplicated announcement at worst. */
      alt=""
      /* The header is above the fold on every page, so lazy-loading the logo
         would delay the first paint of the brand and can hurt LCP. */
      priority
      /* Tells the browser the real rendered width, so it picks the small
         variant instead of downloading artwork sized for a 404px slot. */
      sizes="(min-width: 640px) 118px, 107px"
      className={`h-10 w-auto sm:h-11 ${className}`.trim()}
    />
  );
}
