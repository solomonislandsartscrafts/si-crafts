/**
 * Standard page title block — the single source of truth for page-level
 * typography. Every page uses this so the h1 size, spacing, and the intro
 * paragraph are identical everywhere.
 *
 * Two treatments, one component:
 *
 *   1. PLAIN (default) — title + intro on the page background. Used by narrow
 *      form/confirmation pages (login, code lookup, stockist auth) and any page
 *      that does not want a coloured band.
 *
 *   2. BANNER — pass `banner="blue" | "green" | "gold" | "terracotta"` to render
 *      a full-bleed coloured band with an eyebrow rule and a subtle CSS-only
 *      motif on the right. This is the site-wide interior-page header. Each
 *      colour is one already used on the flag stripe (`.flag-divider` /
 *      `.flag-hairline` / `.flag-mark` — blue, gold, green) so banner variety
 *      reuses the site's existing palette instead of introducing a new one.
 *      Each colour is contrast-checked (AA+): blue/green/terracotta take white
 *      text, gold takes dark text (white-on-gold fails AA at every shade).
 *
 * Do not hand-roll a page title, and do not build a separate banner component:
 * the banner lives here so the h1 size and container gutters stay identical to
 * the plain treatment.
 *
 * If a page has a bespoke layout that cannot use this container (e.g. an
 * article inside a sidebar grid), import `pageTitleClasses` and apply it to
 * that page's own h1 rather than inventing a new size.
 */

/** The one h1 treatment. Exported for bespoke layouts that supply their own container. */
export const pageTitleClasses =
  'font-heading text-3xl md:text-4xl font-medium text-deep-blue leading-heading';

/** Banner colour variants — the flag-stripe palette (blue, green, gold) plus terracotta. */
export type BannerVariant = 'blue' | 'green' | 'gold' | 'terracotta';
type BannerMotif = 'waves' | 'cross' | 'dots';

const BANNER_BG: Record<BannerVariant, string> = {
  blue: 'bg-deep-blue',
  green: 'bg-brand-green',
  gold: 'bg-accent-gold',
  terracotta: 'bg-terracotta',
};

// Gold is a light fill, so it takes dark text (deep-blue) instead of white —
// per the locked colour rule: white on gold fails AA at every shade, dark
// text on gold-DEFAULT is 6.6:1 (AA). Every other variant is a dark fill and
// keeps the white banner text.
const BANNER_TEXT_ON: Record<BannerVariant, 'light' | 'dark'> = {
  blue: 'light',
  green: 'light',
  gold: 'dark',
  terracotta: 'light',
};

// Default motif per colour, matching the reference designs. Overridable via
// the `motif` prop.
const BANNER_DEFAULT_MOTIF: Record<BannerVariant, BannerMotif> = {
  blue: 'waves',
  green: 'cross',
  gold: 'dots',
  terracotta: 'dots',
};

// Lighter, layered gradient per variant — mirrors the homepage hero treatment
// so the interior banners read as the same airier, hand-dyed family rather
// than flat colour blocks. Each is a soft radial "bloom" over a diagonal
// linear wash, set as an inline `backgroundImage`; `BANNER_BG` stays on the
// element as the solid fallback for any renderer that drops the gradient.
//
// Contrast constraint, and it is load-bearing: unlike the hero, a banner has
// NO dark scrim behind its text and the heading/intro span the full left of
// the band — so every DARK-fill variant (blue/green/terracotta, white text)
// must stay dark enough for AA white text across the WHOLE gradient, not just
// one corner. That is why these are lightened only modestly from the flat
// tokens (lifted mid-tones, not the near-pastel the hero reaches at its bright
// corner). GOLD is the light-fill / dark-text variant, so it is free to be a
// genuinely bright, warm gradient.
const BANNER_GRADIENT: Record<BannerVariant, string> = {
  // deep-blue #1B3A4B lifted toward ocean; darkest stop still 11:1+ for white.
  blue:
    'radial-gradient(90% 120% at 88% 12%, rgba(61, 122, 196, 0.30) 0%, rgba(61, 122, 196, 0) 55%), ' +
    'linear-gradient(120deg, #1B3A4B 0%, #244C63 55%, #2B5B76 100%)',
  // brand-green #1E7A3D, darkened at the LEFT/text column so white stays AA
  // (≥4.5:1) across the whole max-w-2xl text run; only the far-right end (behind
  // the motif, past the text) is allowed to lift.
  green:
    'radial-gradient(90% 120% at 88% 12%, rgba(244, 183, 40, 0.18) 0%, rgba(244, 183, 40, 0) 55%), ' +
    'linear-gradient(120deg, #175C2F 0%, #1B6E38 55%, #248046 100%)',
  // gold takes dark text, so it can go genuinely bright and warm.
  gold:
    'radial-gradient(90% 120% at 88% 12%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 55%), ' +
    'linear-gradient(120deg, #F4B728 0%, #F7C555 55%, #FBD77E 100%)',
  // terracotta #A9522F, darkened at the LEFT/text column so white stays AA
  // (≥4.5:1) across the whole max-w-2xl text run; only the far-right end (behind
  // the motif, past the text) is allowed to lift.
  terracotta:
    'radial-gradient(90% 120% at 88% 12%, rgba(244, 183, 40, 0.16) 0%, rgba(244, 183, 40, 0) 55%), ' +
    'linear-gradient(120deg, #8C4426 0%, #9E4B2A 55%, #AF5936 100%)',
};

/**
 * CSS-only decorative fill for the banner. Sits behind the text, right-anchored,
 * low contrast, aria-hidden. No images, no extra dependency. `stroke` follows
 * the banner's text treatment so the motif stays legible on both a dark fill
 * (white stroke) and the light gold fill (deep-blue stroke).
 */
function BannerMotif({ motif, stroke }: { motif: BannerMotif; stroke: string }) {
  const common =
    'pointer-events-none absolute inset-y-0 right-0 w-full opacity-[0.12]';

  if (motif === 'waves') {
    return (
      <svg
        aria-hidden="true"
        className={common}
        preserveAspectRatio="xMaxYMid slice"
        viewBox="0 0 600 400"
        fill="none"
      >
        {[40, 100, 160, 220, 280, 340].map((y) => (
          <path
            key={y}
            d={`M300 ${y} C 380 ${y - 26}, 460 ${y + 26}, 600 ${y}`}
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }

  if (motif === 'cross') {
    return (
      <svg
        aria-hidden="true"
        className={common}
        preserveAspectRatio="xMaxYMid slice"
        viewBox="0 0 600 400"
        fill="none"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={`a${i}`}
            x1={200 + i * 40}
            y1={0}
            x2={i * 40}
            y2={400}
            stroke={stroke}
            strokeWidth="4"
          />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={`b${i}`}
            x1={200 + i * 40}
            y1={400}
            x2={i * 40}
            y2={0}
            stroke={stroke}
            strokeWidth="4"
          />
        ))}
      </svg>
    );
  }

  // dots
  return (
    <svg
      aria-hidden="true"
      className={common}
      preserveAspectRatio="xMaxYMid slice"
      viewBox="0 0 600 400"
      fill="none"
    >
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={220 + col * 48}
            cy={40 + row * 64}
            r="14"
            stroke={stroke}
            strokeWidth="3"
            fill="none"
          />
        )),
      )}
    </svg>
  );
}

interface PageHeaderProps {
  title: string;
  /** Optional lead paragraph. Accepts nodes so it can contain links. */
  intro?: React.ReactNode;
  /** Optional slot above the title — a breadcrumb, "back to" link, or (on a
   *  banner) a short eyebrow label. On a banner it renders with the leading
   *  rule and light styling automatically when passed as a plain string. */
  eyebrow?: React.ReactNode;
  /**
   * Render a full-bleed coloured band. Omit for the plain treatment. Ignored
   * when `align="center"` or `width="narrow"` — those form/confirmation layouts
   * always stay plain.
   */
  banner?: BannerVariant;
  /** Override the banner's decorative motif. Defaults per variant. */
  motif?: BannerMotif;
  /** Centre the title and intro. Used for narrow confirmation/lookup pages. */
  align?: 'left' | 'center';
  /**
   * Narrow the container. `default` is the site-wide 1440px container; `narrow`
   * is for single-column pages such as a code lookup or a confirmation screen.
   */
  width?: 'default' | 'narrow';
  /** Extra content rendered below the intro, inside the same container. */
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  intro,
  eyebrow,
  banner,
  motif,
  align = 'left',
  width = 'default',
  children,
}: PageHeaderProps) {
  const centered = align === 'center';

  // A coloured band behind a centred login form or a narrow lookup page reads
  // Coloured banners are currently disabled site-wide — the site uses plain
  // white headers only. The banner prop is still accepted (so call sites don't
  // break) but ignored. To re-enable coloured banners later, restore
  // `useBanner = Boolean(banner) && !centered && width === 'default'`.
  const useBanner = false;

  if (useBanner && banner) {
    const activeMotif = motif ?? BANNER_DEFAULT_MOTIF[banner];
    const onLight = BANNER_TEXT_ON[banner] === 'dark';
    // Gold is the one light-fill banner, so its text and motif flip to the
    // deep-blue ink used everywhere else on a light surface, instead of the
    // white treatment every dark-fill banner uses. Each branch is a complete,
    // literal class string (including the `!` important prefix) so Tailwind's
    // static scanner can find it — it does not evaluate string concatenation,
    // so `` `!${'text-white'}` `` would silently fail to generate `!text-white`.
    const headingColor = onLight ? '!text-deep-blue' : '!text-white';
    const introColor = onLight ? 'text-deep-blue/80' : 'text-white/85';
    const eyebrowRuleColor = onLight ? 'bg-deep-blue/40' : 'bg-white/60';
    const eyebrowTextColor = onLight ? 'text-deep-blue/80' : 'text-white/80';
    const motifStroke = onLight ? '#1B3A4B' : '#FFFFFF';

    return (
      // `mb-block` (32 → 64) is the gap from the band to the page content. The
      // plain header creates its heading-to-content gap with `pb-stack`; a
      // coloured band cannot — bottom padding inside it only makes the band
      // taller — so the gap lives here as an outside margin instead. `block`
      // (one rung below `section`) rather than `stack`, because a full-strength
      // band reads as a section boundary, not just a heading.
      //
      // The band sits flush below the header — `main` is flush (no top
      // padding) so the banner meets the header cleanly, with the header's own
      // border as the separation.
      <section
        className={`relative overflow-hidden ${BANNER_BG[banner]} mb-block`}
        style={{ backgroundImage: BANNER_GRADIENT[banner] }}
      >
        <BannerMotif motif={activeMotif} stroke={motifStroke} />
        {/* Fixed band height, so every banner is identical regardless of how
            much text it holds — a one-line title with no metadata (Catalogue)
            and a two-line title with a stats row (Makers) fill the same block.
            The height is set to the TALLEST banner on the site (Makers: eyebrow
            + two-line intro + a stats-row child) so that banner sits inside the
            fixed height rather than growing past it, and every shorter banner
            matches it. `flex items-center` then optically centres whatever
            content each page passes. The height is a deliberate one-off
            dimension (banner height is not on the 4px spacing scale). `py-block`
            is kept only as breathing room / a last-resort floor for an
            unusually long future intro. Same container + gutters + `max-w-site`
            as the body below, so the text lines up and the width matches every
            other page. `py-xl` (48) rather than `py-block` (32 → 64): a smaller
            vertical padding leaves more room for content INSIDE the fixed
            height, so the `min-h` reliably governs the band height and the
            tallest banner (Makers) does not push the band past it. */}
        <div className="relative flex items-center min-h-[20rem] tabtop:min-h-[21rem] max-w-site mx-auto site-px py-xl">
          <div className="w-full max-w-2xl">
            {eyebrow ? (
              typeof eyebrow === 'string' ? (
                <div className="mb-md flex items-center gap-xs">
                  <span className={`h-px w-8 ${eyebrowRuleColor}`} aria-hidden="true" />
                  <span className={`text-sm font-medium uppercase tracking-wide ${eyebrowTextColor}`}>
                    {eyebrow}
                  </span>
                </div>
              ) : (
                <div className="mb-md">{eyebrow}</div>
              )
            ) : null}

            <h1 className={`${pageTitleClasses} ${headingColor} mb-2xs`}>{title}</h1>

            {intro ? (
              <p className={`text-base sm:text-lg ${introColor} leading-body-lg max-w-2xl`}>
                {intro}
              </p>
            ) : null}

            {/* On a banner, child metadata/actions inherit the banner's text
                colour unless the child sets its own. */}
            {children ? <div className={onLight ? 'text-deep-blue/80' : 'text-white/85'}>{children}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={[
        width === 'narrow' ? 'max-w-2xl' : 'max-w-site',
        // Gutters come from .site-px so the title lines up exactly with the
        // body container below it. `pb-stack` (24 → 32) is the same
        // heading-to-content step every section heading on the site uses, so a
        // page title sits the same distance above its content as an h2 does.
        // The content below then owns its own bottom padding.
        'mx-auto site-px page-y pb-stack',
        centered ? 'text-center' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow ? <div className="mb-md">{eyebrow}</div> : null}
      <h1 className={`${pageTitleClasses} mb-2xs`}>{title}</h1>
      {intro ? (
        <p
          className={[
            'text-base sm:text-lg text-warm-gray-600 leading-body-lg max-w-2xl',
            centered ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {intro}
        </p>
      ) : null}
      {children}
    </div>
  );
}
