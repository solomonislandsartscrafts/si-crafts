'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { RouteProgressBar } from '@/components/shared/route-progress-bar';

export function LayoutShell({ children }: { children: React.ReactNode }) {
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
      <main id="main-content" className="flex-1 pt-4 sm:pt-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
