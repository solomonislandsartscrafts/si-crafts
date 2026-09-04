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
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
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
      <Header />

      {/* Flag stripe sits below the header, NOT inside it — so it does not
          scroll with the sticky header. Shown on every public page. */}
      <FlagDivider />

      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
    </>
  );
}
