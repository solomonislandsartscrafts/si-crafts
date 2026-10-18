import type { Metadata } from 'next';
import Script from 'next/script';
import { Poppins, DM_Sans } from 'next/font/google';
import { SkipLink } from '@/components/layout';
import { LayoutShell } from '@/components/layout/layout-shell';
import { Footer } from '@/components/layout/footer';
import { AnnouncementBanner } from '@/components/layout/announcement-banner';
import { SwRegister } from '@/components/shared/sw-register';
import { Providers } from '@/components/providers';
import { SITE_URL } from '@/lib/metadata';
import { SiteJsonLd } from '@/components/shared/site-json-ld';
import { getSiteContentSafe } from '@/services/site-content';
import { resolveImageUrl } from '@/lib/api-client';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The header/mobile-nav are client components and cannot fetch site content
  // themselves, so the admin-editable logo is resolved here on the server and
  // passed down through LayoutShell. Blank means "use the bundled artwork" —
  // resolveImageUrl leaves an empty string empty, and <Logo> falls back.
  const { siteLogo, siteLogoAlt } = await getSiteContentSafe();
  const logoSrc = siteLogo ? resolveImageUrl(siteLogo) : '';

  return (
    // suppressHydrationWarning: the blocking theme script in <head> adds
    // `dp-dark-os` to <html> before hydration, and dark-mode browser extensions
    // (Dark Reader etc.) also mutate <html>'s class/attributes pre-hydration.
    // Both are deliberate/expected pre-paint mutations of THIS element, so React
    // should not warn that the hydrated <html> differs from its render. Scoped
    // to <html> only — children still get full hydration checking.
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Single light-theme browser-chrome tint. The site is light by default
            and does not follow the OS, so there is no `prefers-color-scheme: dark`
            variant here — an OS-dark visitor still opens the light site and should
            get the light address-bar tint to match. */}
        <meta name="theme-color" content="#1B3A4B" />
        <SiteJsonLd />
        {/*
          No-FOUC dark activation. Runs before first paint and reads the STORED
          preference (si-theme). The site is light by DEFAULT and does NOT follow
          the OS `prefers-color-scheme` — dark is applied only when the user has
          explicitly stored 'dark'. In that one case it sets `dp-dark-os` on
          <html>, which the CSS uses to paint the canvas and key above-the-fold
          surfaces dark on the first frame, so returning in dark shows no white
          flash. LayoutShell then owns the full palette after hydration via the
          `.dp-dark` class on the public wrapper. Kept in sync with the storage
          key + resolution used by src/lib/theme.ts. Wrapped in try/catch so it
          can never block paint.
        */}
        <Script id="si-theme-no-fouc" strategy="beforeInteractive">
          {"try{if(localStorage.getItem('si-theme')==='dark'){document.documentElement.classList.add('dp-dark-os')}}catch(e){}"}
        </Script>
      </head>
      {/* No `bg-page-bg` here: the base canvas is painted on <html> and the
          public-site map watermark is a fixed `.map-backdrop` layer (see
          LayoutShell + globals.css). An opaque body background would hide it. */}
      <body className="font-body text-base leading-body min-h-screen flex flex-col">
        <SkipLink />
        <Providers>
          <div className="flex flex-col flex-1">
            <LayoutShell
              banner={<AnnouncementBanner />}
              footer={<Footer />}
              logoSrc={logoSrc}
              logoAlt={siteLogoAlt}
            >
              {children}
            </LayoutShell>
          </div>
          <SwRegister />
        </Providers>
      </body>
    </html>
  );
}
