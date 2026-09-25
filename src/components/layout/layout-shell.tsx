'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { FlagDivider } from './flag-divider';
import { RouteProgressBar } from '@/components/shared/route-progress-bar';
import { getStoredThemePreference, resolveTheme, THEME_CHANGE_EVENT } from '@/lib/theme';

/**
 * Resolves the effective theme ('light' | 'dark') from the stored preference:
 *   - 'system' follows the OS (dark at night wherever the user is), and updates
 *     live when the OS setting changes.
 *   - 'light' / 'dark' force that theme regardless of the OS.
 *
 * Also listens for THEME_CHANGE_EVENT so that when the header toggle changes the
 * preference, this re-resolves immediately without a reload.
 *
 * Starts null (unknown) on the server / first render so SSR markup does not
 * assume a theme; the blocking script in layout.tsx has already set the class on
 * the wrapper before paint, so there is no flash while this settles on mount.
 */
function useResolvedTheme(): 'light' | 'dark' | null {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(getStoredThemePreference());
      setTheme(resolved);
      // Keep the pre-paint flag on <html> in step with the resolved theme.
      //
      // The blocking script in layout.tsx sets `.dp-dark-os` on <html> before
      // first paint whenever the OS prefers dark, and its CSS (globals.css) is
      // NOT inside a media query — it applies whenever the class is present. So
      // if a dark-OS visitor forces LIGHT with the toggle, removing `.dp-dark`
      // from this wrapper is not enough: `.dp-dark-os` would linger on <html>
      // and keep the canvas/header/surfaces dark, leaving a broken half-dark
      // page. Syncing the flag here means the pre-paint layer always agrees with
      // the post-hydration decision, in every OS/choice combination.
      document.documentElement.classList.toggle('dp-dark-os', resolved === 'dark');
    };
    apply();

    // Follow the OS only matters while the preference is 'system'; resolveTheme
    // ignores the OS otherwise, so re-resolving on every OS change is harmless.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    // The header toggle dispatches this after writing the new preference.
    window.addEventListener(THEME_CHANGE_EVENT, apply);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener(THEME_CHANGE_EVENT, apply);
    };
  }, []);

  return theme;
}

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
  const resolvedTheme = useResolvedTheme();

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
    // `theme-auto` marks this subtree as opting into the auto dark theme. The
    // blocking inline script in RootLayout adds `dp-dark` here before first
    // paint when the OS reports prefers-color-scheme: dark (and toggles it live
    // when the OS setting changes), which turns on the shared dark palette in
    // globals.css. /admin returns early above and never gets this wrapper, so it
    // stays on the light theme. In dark this wrapper paints the deep-blue canvas
    // (the map watermark, which paints the light canvas, is hidden on dark), so
    // it stretches to at least the viewport height. It carries no styling in the
    // light theme, so the existing light layout is unchanged.
    <div className={`theme-auto flex flex-col flex-1 ${resolvedTheme === 'dark' ? 'dp-dark' : ''}`}>
      {/* Faint Solomon Islands map watermark behind every public page — the
          Solomon Airlines backdrop treatment. A single fixed, decorative layer
          that stays put while the page scrolls. Public routes only; the admin
          branch above never reaches here. See `.map-backdrop` in globals.css. */}
      <div className="map-backdrop" aria-hidden="true" />

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
    </div>
  );
}
