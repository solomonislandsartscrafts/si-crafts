import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
        // NOTE: cream and page-bg are intentionally set to pure white (#FFFFFF).
        // The warm "cream" name is retained for semantic clarity in templates
        // (distinguishes page chrome from card surfaces). Card boundaries are
        // established via shadow-card and border tokens, not background contrast.
        cream: '#FFFFFF',
        'page-bg': '#FFFFFF',
        'card-bg': '#FFFFFF',
        // Footer — dark background. MUST pair with explicit light text.
        // Never rely on inherited body color (warm-gray-800) on this background.
        'footer-bg': '#1B3A4B',
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

        // NOTE: the legacy aliases `terracotta`, `teal` and `motto-gold` were
        // removed. They pointed at brand-green / ocean / accent-gold, so class
        // names like `bg-terracotta` rendered green — the names lied about the
        // colour. Use the real token names above.

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
        body: '1.6',   // minimum for body copy — aids readability at 16px
        heading: '1.2',
        relaxed: '1.7',
      },
      spacing: {
        // Vertical page/section rhythm lives in the .page-y and .section-y
        // utilities in globals.css, which scale across breakpoints. These
        // fixed tokens remain only for one-off use.
        section: '32px',
        'section-lg': '64px',
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
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
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
