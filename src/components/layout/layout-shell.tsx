'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { RouteProgressBar } from '@/components/shared/route-progress-bar';

/**
 * The footer arrives as an already-rendered server component rather than being
 * imported here. It reads admin-editable copy, and this shell is a client
 * component (it needs the pathname to hide chrome on /admin routes), so
 * rendering the footer itself would have forced that fetch into the browser.
 */
export function LayoutShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  // The homepage hero is a full-bleed deep-blue band, and the header floats
  // over it (transparent, light content, flips solid on scroll). See Header's
  // `transparentOverHero`.
  const isHome = pathname === '/';

  if (isAdmin) {
    return (
      <>
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      <Header transparentOverHero={isHome} />

      {isHome ? (
        // Homepage: the header floats over the hero band. `-mt-20` pulls the
        // hero up under the sticky 80px (h-20) header so the blue runs behind
        // it, and the hero supplies its own top padding for the content. No
        // flag stripe under the header here — on the homepage the stripe caps
        // the BOTTOM of the blue hero cover instead (rendered in page.tsx), so
        // it reads as the seam between the hero and the page body.
        <main id="main-content" className="flex-1 -mt-20">
          {children}
        </main>
      ) : (
        // No flag stripe under the header. Interior pages open with a full
        // coloured banner (`<PageHeader banner>`) that already separates the
        // header from the content far more boldly than a thin stripe — the two
        // stacked read as competing bands. The header keeps its own bottom
        // border as separation. `main` is flush (no top padding) so a banner
        // sits directly under the header with no white gap; plain-header pages
        // supply their own top spacing via `<PageHeader>`'s `page-y`.
        <main id="main-content" className="flex-1">
          {children}
        </main>
      )}
      {footer}
    </>
  );
}
