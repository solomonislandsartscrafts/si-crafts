'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { FlagDivider } from './flag-divider';
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
  banner,
  logoSrc,
  logoAlt,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * The admin-controlled announcement bar. Rendered pre-built as a server
   * component (like `footer`) because this shell is a client component and
   * cannot await the copy itself. Shown above the header on public routes only.
   */
  banner?: React.ReactNode;
  /**
   * Admin-editable site logo, resolved on the server in RootLayout because the
   * header/mobile-nav are client components. Empty falls back to the bundled
   * artwork inside <Logo>.
   */
  logoSrc?: string;
  logoAlt?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

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
      {/* Top chrome — announcement banner (if any) + header — is a normal
          in-flow block, so it scrolls away with the page rather than staying
          pinned to the viewport. The banner sits above the header. */}
      {banner}
      <Header logoSrc={logoSrc} logoAlt={logoAlt} />

      {/* Flag stripe scrolls with the page, just under the header. */}
      <FlagDivider />

      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
    </>
  );
}
