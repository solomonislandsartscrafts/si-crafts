import type { Metadata } from 'next';
import { SkipLink } from '@/components/layout';
import { LayoutShell } from '@/components/layout/layout-shell';
import { AccessibilityWidget } from '@/components/shared/accessibility-widget';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { SwRegister } from '@/components/shared/sw-register';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://solomonislandsartsandcrafts.com.au'),
  title: {
    default: 'Solomon Islands Arts and Crafts',
    template: '%s | SI Crafts',
  },
  description:
    'Authentic Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery. Meet the makers, discover the stories.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Solomon Islands Arts and Crafts',
    description:
      'Authentic Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery.',
    url: 'https://solomonislandsartsandcrafts.com.au',
    siteName: 'Solomon Islands Arts and Crafts',
    type: 'website',
    images: [{ url: '/images/og-default.jpg' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1B3A4B" />
      </head>
      <body className="font-body text-base leading-body bg-page-bg min-h-screen flex flex-col">
        {/* SVG filters for colorblind modes */}
        <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
          <defs>
            <filter id="a11y-protanopia-filter">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0" />
            </filter>
            <filter id="a11y-deuteranopia-filter">
              <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0" />
            </filter>
            <filter id="a11y-tritanopia-filter">
              <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0  0, 0.433, 0.567, 0, 0  0, 0.475, 0.525, 0, 0  0, 0, 0, 1, 0" />
            </filter>
          </defs>
        </svg>
        <SkipLink />
        <Providers>
          <div className="a11y-filter-scope flex flex-col flex-1">
            <LayoutShell>
              {children}
            </LayoutShell>
          </div>
          <AccessibilityWidget />
          <ScrollToTop />
          <SwRegister />
        </Providers>
      </body>
    </html>
  );
}
