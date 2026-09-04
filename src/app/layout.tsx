import type { Metadata } from 'next';
import { Poppins, DM_Sans } from 'next/font/google';
import { SkipLink } from '@/components/layout';
import { LayoutShell } from '@/components/layout/layout-shell';
import { Footer } from '@/components/layout/footer';
import { SwRegister } from '@/components/shared/sw-register';
import { Providers } from '@/components/providers';
import { SITE_URL } from '@/lib/metadata';
import { SiteJsonLd } from '@/components/shared/site-json-ld';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-heading',
});

// Body typeface. Loaded here so `font-body` (tailwind.config.ts) resolves to a
// real webfont rather than silently falling back to the OS UI font.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  // Single source of truth for the origin — see src/lib/metadata.ts. This was
  // hardcoded to the .com.au domain while SITE_URL was env-driven, so the two
  // could disagree and OG tags pointed at a host that doesn't resolve.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Solomon Islands Arts & Crafts',
    template: '%s | SI Crafts',
  },
  description:
    'Authentic Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery. Meet the makers, discover the stories.',
  manifest: '/manifest.json',
  /**
   * Google Search Console ownership proof.
   *
   * Only rendered when NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is set, so there is
   * no empty tag on the page by default. This is the HTML-tag verification
   * method; the DNS TXT method is preferable where you control DNS (it verifies
   * the whole domain including every subdomain and both protocols, and survives
   * a redeploy), so treat this as the fallback rather than the first choice.
   */
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  openGraph: {
    title: 'Solomon Islands Arts & Crafts',
    description:
      'Authentic Solomon Islands handicrafts — pandanus weaving, wood carving, and shell-money jewellery.',
    url: SITE_URL,
    siteName: 'Solomon Islands Arts & Crafts',
    type: 'website',
    // No `images` entry: src/app/opengraph-image.tsx generates the card and
    // Next injects the tags automatically. Listing a path here would override it.
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`}>
      <head>
        <meta name="theme-color" content="#1B3A4B" />
        <SiteJsonLd />
      </head>
      <body className="font-body text-base leading-body bg-page-bg min-h-screen flex flex-col">
        <SkipLink />
        <Providers>
          <div className="flex flex-col flex-1">
            <LayoutShell footer={<Footer />}>
              {children}
            </LayoutShell>
          </div>
          <SwRegister />
        </Providers>
      </body>
    </html>
  );
}
