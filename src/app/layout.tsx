import type { Metadata } from 'next';
import { Header, Footer, SkipLink } from '@/components/layout';
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#1B3A4B" />
      </head>
      <body className="font-body text-base leading-body bg-page-bg min-h-screen flex flex-col">
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
