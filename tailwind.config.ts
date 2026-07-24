import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          light: '#F5F0E8',
          DEFAULT: '#E8DFD0',
          dark: '#C4B8A5',
        },
        terracotta: {
          light: '#D4845A',
          DEFAULT: '#C06A3A',
          dark: '#9C4F28',
        },
        cream: '#FFFDF8',
        'warm-gray': {
          100: '#F7F5F2',
          200: '#EDE9E3',
          400: '#8C8277',
          600: '#5C5349',
          800: '#4A433B',
        },
        ocean: {
          light: '#5B9EAF',
          DEFAULT: '#2E7D8C',
          dark: '#1A5C6A',
        },
        teal: {
          light: '#7EC8C8',
          DEFAULT: '#4AA8A8',
          dark: '#2D7A7A',
        },
        'deep-blue': '#1B3A4B',
        success: '#2D7A4F',
        warning: '#C4882A',
        error: '#B83A3A',
        'page-bg': '#FFFDF8',
        'card-bg': '#FFFFFF',
        'footer-bg': '#1B3A4B',
      },
      fontFamily: {
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        heading: ['DM Sans', 'system-ui', 'sans-serif'],
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
    },
  },
  plugins: [],
};

export default config;
