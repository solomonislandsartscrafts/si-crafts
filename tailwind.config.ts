import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // =========================================================================
    // BREAKPOINTS — declared in full (not `extend`) so `tabtop` is emitted in
    // min-width order. Tailwind writes variants in declaration order, so a
    // breakpoint added via `extend` lands after `2xl` and would then override
    // `lg:`/`xl:` rules. Declaring the whole set keeps cascade order correct.
    //
    // `tabtop` (920px) is the reference site's primary layout breakpoint — the
    // point at which page gutters widen and the grid gains a wider column gap.
    // =========================================================================
    screens: {
      sm: '640px',
      md: '768px',
      tabtop: '920px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // =====================================================================
        // FLAG THEME PALETTE — WCAG 2.1 contrast-checked
        // =====================================================================

        // Primary ink (headings, footer bg, nav background)
        // Contrast on white: 11.9:1 — AAA ✅
        'deep-blue': '#1B3A4B',

        // Primary accent (links, focus rings, info badges)
        ocean: {
          // ⚠️ ACCESSIBILITY: ocean-light (4.4:1 on white) FAILS AA for normal
          // text. Use ONLY for: large text (24px+ / 18px bold), decorative UI,
          // icons, borders, or focus-ring offsets. For readable text on white,
          // use ocean (6.8:1) or ocean-dark (8.8:1).
          light: '#3D7AC4',
          DEFAULT: '#1E5AA8',  // 6.8:1 on white — AA ✅
          dark: '#154A8C',     // 8.8:1 on white — AAA ✅
        },

        // Secondary accent — brand green (primary CTA buttons, "My Account" pill)
        'brand-green': {
          // ⚠️ ACCESSIBILITY: brand-green-light (3.65:1 white-on-green) FAILS
          // AA for white text. NEVER use as a solid fill behind white text.
          // Reserved for: focus rings, outline borders, hover outlines only.
          // Safe white-text buttons: use DEFAULT (5.4:1) or dark (6.6:1).
          light: '#28994D',
          DEFAULT: '#1E7A3D',  // White text: 5.4:1 — AA ✅ (safe CTA default)
          dark: '#166B30',     // White text: 6.6:1 — AA ✅
        },

        // Tertiary highlight — accent gold (gold accent line, stat strip bg, ribbons)
        // 🚫 HARD RULE: Gold backgrounds must ALWAYS use dark text (deep-blue
        // or warm-gray-800). NEVER use white text on any gold shade — contrast
        // ranges from 1.8:1 to 2.6:1 (all fail). Dark text on gold-DEFAULT
        // gives 6.6:1 (AA ✅).
        'accent-gold': {
          light: '#F7C555',
          DEFAULT: '#F4B728',
          dark: '#D89412',
        },

        // Rare accent — error states only
        // Contrast on white: ~4.7:1 — AA ✅ for body text (16px+).
        // Do NOT use at xs/sm sizes (13–15px) where it becomes borderline.
        'crest-red': '#C0392B',

        // Backgrounds & surfaces
        // cream / page-bg / card-bg are all pure white (#FFFFFF): the page
        // canvas and cards share one white base. Card boundaries are carried by
        // shadow-card and border tokens, and by the bg-sand-light section
        // bands, not by a page/card colour difference. The warm accent in the
        // palette comes from the coloured page banners (incl. terracotta), not
        // from tinting the whole canvas.
        cream: '#FFFFFF',
        'page-bg': '#FFFFFF',
        'card-bg': '#FFFFFF',
        // Subtle warm section band — the alternating body-section background.
        // A barely-there warm off-white (NOT cool grey): it reads as a gentle
        // change of surface so successive content sections are visually
        // distinct, without the wireframe/disabled feel that bg-sand-light
        // (#F0F0F0, a cool grey) gave and without fighting the warm craft
        // palette. Dark body text on it is effectively unchanged for contrast
        // (11.7:1 for warm-gray-800). Use via `.section-band` on a `.section-y`
        // section, alternated with plain white sections — see globals.css.
        'section-warm': '#FBF7F2',
        // Footer — the darkest surface on the site, on purpose. It is the same
        // flag-blue hue as deep-blue (#1B3A4B) taken down in lightness, so it
        // stays on-brand while reading as a distinct, heavier anchor than the
        // deep-blue page banners / hero / closing CTA that sit above it. White
        // text is 14.8:1 — AAA. MUST pair with explicit light text; never rely
        // on inherited body color (warm-gray-800) on this background.
        'footer-bg': '#0E2129',
        // Explicit footer text color for use on footer-bg
        'footer-text': '#FFFFFF',
        'footer-muted': '#CBD5DC',  // Lighter secondary text on dark footer

        // Sand/parchment tones (borders, dividers, light backgrounds)
        sand: {
          light: '#F0F0F0',
          DEFAULT: '#E5E5E5',
          dark: '#D4D4D4',
        },

        // Neutral grays — split into BACKGROUND and TEXT categories
        'warm-gray': {
          // --- BACKGROUND/SURFACE ONLY (not for text) ---
          // ⚠️ 100 and 200 are far too light for text on white. Use only for
          // background fills, dividers, zebra-striping, or subtle surface tints.
          100: '#FAFAFA',  // Lightest bg — e.g. alternate table rows
          200: '#F0F0F0',  // Light bg — e.g. input backgrounds, dividers
          // --- TEXT COLORS (safe on white backgrounds) ---
          400: '#736B62',  // 5.2:1 on white — AA ✅ (secondary/muted text)
          600: '#5C5648',  // 7.3:1 on white — AAA ✅ (body secondary text)
          800: '#3D362E',  // 11.9:1 on white — AAA ✅ (primary body text)
        },

        // NOTE: the legacy aliases `teal` and `motto-gold` were removed. They
        // pointed at ocean / accent-gold, so class names like `bg-teal`
        // rendered blue — the names lied about the colour. Use the real token
        // names above.

        // =====================================================================
        // TERRACOTTA — warm earth accent. The third page-banner colour
        // (alongside deep-blue and brand-green) and the warm counterpart to the
        // cool ocean/green palette. Reserved for banner bands and warm accents;
        // it is NOT a general-purpose fill. White heading text only on DEFAULT
        // or dark — the light shade fails AA for white text.
        //   terracotta DEFAULT: white text 4.9:1 — AA ✅ (safe for headings)
        //   terracotta dark:    white text 6.0:1 — hover/active
        //   terracotta light:   3.2:1 white — decorative / dark-text only
        // =====================================================================
        terracotta: {
          light: '#C97B57',
          DEFAULT: '#A9522F',  // white text 4.9:1 — AA ✅
          dark: '#8C4426',     // white text 6.0:1
        },

        // Semantic states
        success: '#1E7A3D',
        // ⚠️ warning (#F4B728) is a BACKGROUND/FILL color only.
        // For warning TEXT on white, always use warning-text (#92650A, 5.1:1).
        // Never use the base warning token as a text color.
        warning: '#F4B728',
        'warning-text': '#92650A',
        error: '#C0392B',
      },
      fontFamily: {
        // Both families are loaded via next/font in src/app/layout.tsx, which
        // sets --font-body (DM Sans) and --font-heading (Poppins) on <html>.
        body: ['var(--font-body)', 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['var(--font-heading)', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Standard 16px-based scale. `base` is the 16px accessibility floor for
        // body copy — never drop below it for reading text.
        // ⚠️ xs (12px) and sm (14px) are below that floor. Use ONLY for
        // non-essential secondary content: timestamps, captions, metadata
        // labels, badge text. Never for paragraphs or maker stories.
        xs: '0.75rem',     // 12px — metadata, timestamps only
        sm: '0.875rem',    // 14px — captions, secondary labels only
        base: '1rem',      // 16px — primary body text (minimum for reading)
        lg: '1.125rem',    // 18px — body-large / intro text
        xl: '1.25rem',     // 20px — H3 small variant
        '2xl': '1.5rem',   // 24px — H3 / H2-small
        '3xl': '1.875rem', // 30px — H2 default
        '4xl': '2.25rem',  // 36px — H1 interior pages
        '5xl': '3rem',     // 48px — H1 hero / landing pages
      },
      lineHeight: {
        // =====================================================================
        // Line boxes land on the 4px base unit, so a run of text stacks in step
        // with the spacing scale instead of drifting a fraction of a pixel per
        // line. Kept unitless (not rem) so a nested larger or smaller element
        // still scales its own line box.
        //
        // Ratios are chosen per the size each token pairs with:
        //   body     1.75   × 16px (text-base) = 28px  — 7 × base ✅
        //   body-lg  1.7778 × 18px (text-lg)   = 32px  — 8 × base ✅
        //   heading  1.3333 × any multiple of 3px:
        //                     18 → 24, 24 → 32, 30 → 40, 36 → 48, 48 → 64 ✅
        //   title-sm 1.5    × 16px (small card headings) = 24px — 6 × base ✅
        //
        // `relaxed` is a deliberate alias of `body`: two near-identical body
        // leadings is how a page ends up with two competing rhythms.
        // =====================================================================
        body: '1.75',
        'body-lg': '1.7778',
        relaxed: '1.75',
        heading: '1.3333',
        'title-sm': '1.5',
      },
      maxWidth: {
        // The single page-content width. 1440px, wider than Tailwind's
        // max-w-7xl (1280px), so the content column keeps breathing room on
        // large displays instead of stranding it mid-screen.
        // Applied via the .site-container utility in globals.css.
        site: '1440px',
      },
      spacing: {
        // =====================================================================
        // SPACING SCALE — base unit 4px. Declared as CSS variables in
        // src/app/globals.css (see the SPACING TOKENS block at the top of that
        // file for the full rationale); this block only surfaces them as
        // Tailwind utilities so you can write `p-md`, `gap-lg`, `mb-2xs`.
        //
        // Nothing here is a raw length. Change a value in globals.css and every
        // call site follows.
        // =====================================================================

        // --- Raw scale ------------------------------------------------------
        '3xs': 'var(--space-3xs)',  //  4px
        '2xs': 'var(--space-2xs)',  //  8px
        xs: 'var(--space-xs)',      // 12px
        sm: 'var(--space-sm)',      // 16px
        md: 'var(--space-md)',      // 24px
        lg: 'var(--space-lg)',      // 32px
        xl: 'var(--space-xl)',      // 48px
        '2xl': 'var(--space-2xl)',  // 64px
        '3xl': 'var(--space-3xl)',  // 96px

        // --- Semantic layer -------------------------------------------------
        // These are RESPONSIVE ON THEIR OWN: the variable re-points at a
        // different rung of the scale at 920px / 1024px. So `pb-section` is a
        // complete responsive declaration and replaces `pb-10 lg:pb-20`. Do not
        // pair them with a breakpoint prefix — that defeats the point and
        // reintroduces the per-call-site drift they exist to prevent.
        gutter: 'var(--gutter)',      // 16 → 48  page side gutters
        page: 'var(--page-y)',        // 24 → 32  whole-page top/bottom padding
        section: 'var(--section-y)',  // 48 → 96  between major sections
        block: 'var(--block-y)',      // 32 → 64  between blocks in a section
        stack: 'var(--stack-y)',      // 24 → 32  section heading → its content
        grid: 'var(--grid-gap)',      // 16 → 24  card grid gutters — the
                                      // smallest structural gap, deliberately a
                                      // rung below `stack` so a grid reads as
                                      // one block under its heading
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.0)' },
          '100%': { transform: 'scale(1.06)' },
        },
        'progress-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Mobile nav drawer enter slide. A keyframe animation, not a CSS
        // transition: an animation runs off the element's first paint, so the
        // drawer can mount already in its OPEN position and still animate. A
        // transition would need a second render to flip the class, and that
        // second frame being dropped or coalesced on a phone is exactly how
        // this drawer used to end up stranded off-screen.
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        marquee: 'marquee 20s linear infinite',
        'ken-burns': 'ken-burns 6s ease-out forwards',
        'progress-fill': 'progress-fill 5s linear forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
