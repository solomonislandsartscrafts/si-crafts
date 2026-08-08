import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // -- Flag Theme palette --
        // Primary ink (headings, footer bg, nav background)
        'deep-blue': '#1B3A4B',

        // Primary accent (links, focus rings, info badges)
        ocean: {
          light: '#3D7AC4',
          DEFAULT: '#1E5AA8',
          dark: '#154A8C',
        },

        // Secondary accent — brand green (primary CTA buttons, "My Account" pill)
        'brand-green': {
          light: '#28994D',
          DEFAULT: '#1E7A3D',
          dark: '#166B30',
        },

        // Tertiary highlight — accent gold (gold accent line, stat strip bg, ribbons)
        'accent-gold': {
          light: '#F7C555',
          DEFAULT: '#F4B728',
          dark: '#D89412',
        },

        // Rare accent — error states only
        'crest-red': '#C0392B',

        // Backgrounds & surfaces
        cream: '#FFFFFF',
        'page-bg': '#FFFFFF',
        'card-bg': '#FFFFFF',
        'footer-bg': '#1B3A4B',

        // Sand/parchment tones (borders, dividers, light bg)
        sand: {
          light: '#F0F0F0',
          DEFAULT: '#E5E5E5',
          dark: '#D4D4D4',
        },

        // Neutral text scale
        'warm-gray': {
          100: '#FAFAFA',
          200: '#F0F0F0',
          400: '#736B62',
          600: '#5C5648',
          800: '#3D362E',
        },

        // --- Aliases (preserve existing call sites) ---
        // "terracotta" is a legacy alias for brand-green
        terracotta: {
          light: '#28994D',
          DEFAULT: '#1E7A3D',
          dark: '#166B30',
        },

        // "teal" is a legacy alias for ocean
        teal: {
          light: '#3D7AC4',
          DEFAULT: '#1E5AA8',
          dark: '#154A8C',
        },

        // "motto-gold" is a legacy alias for accent-gold
        'motto-gold': {
          light: '#F7C555',
          DEFAULT: '#F4B728',
          dark: '#D89412',
        },

        // Semantic states
        success: '#1E7A3D',
        warning: '#F4B728',
        'warning-text': '#92650A',
        error: '#C0392B',
      },
      fontFamily: {
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        xs: '0.8125rem',
        sm: '0.9375rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.25rem',
      },
      lineHeight: {
        body: '1.6',
        heading: '1.2',
        relaxed: '1.75',
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
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
