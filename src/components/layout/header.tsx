'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, Shield, ShoppingCart } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { Logo } from './logo';
import { ButtonLink } from '@/components/ui/button';
import { getCart } from '@/lib/cart';

// Split into two groups so the primary nav stays lean. The primary set is the
// browse journey — the pages a public visitor moves through. Wholesale and
// Contact are utility destinations (act on / get in touch), so they sit after
// a hairline divider, grouped with the auth control rather than competing with
// the browse links. Keeping them in one row, just visually separated, means no
// item is hidden while the primary nav still reads as six focused links.
const PRIMARY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/makers', label: 'Makers' },
  { href: '/crafts-and-techniques', label: 'Crafts' },
  { href: '/news', label: 'News' },
  { href: '/about', label: 'About' },
];

const UTILITY_NAV = [
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/contact', label: 'Contact' },
];

type AuthState = 'none' | 'stockist' | 'admin';

/**
 * Shared class string for a desktop nav link, so the two groups stay identical.
 */
function navLinkClasses(active: boolean): string {
  const base =
    'tap-target px-2xs xl:px-xs py-2xs text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm';
  return `${base} ${
    active
      ? 'text-ocean'
      : 'text-warm-gray-600 border-transparent hover:text-deep-blue hover:border-ocean'
  }`;
}

/**
 * Site header — solid on every route, including the homepage.
 *
 * There used to be a `transparentOverHero` prop: on `/` the header started
 * transparent with white nav content over the coloured hero band and flipped to
 * the solid treatment once `window.scrollY` passed ~64px. It has been removed
 * because the homepage hero is now white (see `src/app/page.tsx`), so there is no
 * dark band to sit over and white nav content would have been invisible. Nothing
 * had passed the prop for a while, which left roughly ten unreachable style
 * branches and a scroll listener that could never fire.
 *
 * If a coloured hero is restored, recover this from git history rather than
 * rebuilding it — it also needs the white `<Logo>` variant, a `max-lg:` pin (the
 * treatment was desktop-only, because the flip was unreliable on mobile
 * browsers), and the light nav/divider/auth-button variants.
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('none');
  const pathname = usePathname();

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_session');
    const stockistToken = localStorage.getItem('stockist_session');
    if (adminToken) {
      setAuthState('admin');
    } else if (stockistToken) {
      setAuthState('stockist');
    } else {
      setAuthState('none');
    }
  }, [pathname]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* The `border-b border-sand` is the separation between the header and the
          page below it — interior pages open with a full coloured
          `<PageHeader banner>` band flush against it, and the homepage opens on
          white. There is deliberately no flag stripe under the header. */}
      <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur-sm transition-colors duration-300">
        <div className="site-container">
          {/* Row height stepped up from h-16 (64px) to h-20 (80px) so the bar
              has vertical breathing room that matches the page's spacing
              rhythm. The logo stays inside this taller row with its own margin,
              so the h-16 constraint noted in <Logo> is still comfortably met. */}
          <div className="flex items-center justify-between h-20">
            {/* flex-shrink-0: without it the flex row resolved its own overflow
                by squeezing the logo — the brand mark rendered at 48px wide
                instead of its natural 128px at every width below 900px. */}
            <Link
              href="/"
              className="tap-target inline-flex flex-shrink-0 items-center rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean mr-md lg:mr-lg"
              aria-label="Solomon Islands Arts & Crafts — home"
            >
              {/* Standard dark-ink logo at every width — the header bar is
                  always light. */}
              <Logo />
            </Link>

            {/* `lg:` (1024), not `md:` (768). Eight links plus the hairline and
                the auth control need ~670px at their tightest; with the logo and
                the page gutters that is ~950px, so between 768 and ~850px the
                header did not fit and the whole page scrolled sideways — and up
                to 900px it only "fit" by crushing the logo. The drawer serves
                every width below 1024 instead: it is a full-quality nav, and a
                tablet is a touch device anyway. */}
            <nav className="hidden lg:flex items-center gap-3xs" aria-label="Primary">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClasses(isActive(link.href))}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Hairline separating the browse links from the utility links +
                  auth control, so the primary nav reads as one lean group. */}
              <span className="mx-2xs h-5 w-px bg-sand" aria-hidden="true" />

              {UTILITY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClasses(isActive(link.href))}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth control — changes based on login state. Uses ButtonLink so
                  the header matches every other button on the site. */}
              {authState === 'admin' && (
                <ButtonLink
                  href="/admin/dashboard"
                  variant="admin"
                  size="sm"
                  className="ml-2xs"
                >
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  Admin
                </ButtonLink>
              )}
              {authState === 'stockist' && (
                <>
                  <Link
                    href="/stockist/orders"
                    className="tap-target relative ml-2xs flex items-center justify-center rounded-md text-warm-gray-600 transition-colors hover:bg-sand-light hover:text-deep-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                    aria-label="View order"
                  >
                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                    <CartBadge />
                  </Link>
                  <ButtonLink
                    href="/stockist/account"
                    size="sm"
                    className="ml-3xs"
                  >
                    My Account
                  </ButtonLink>
                </>
              )}
              {authState === 'none' && (
                // Kept as the ocean-outline secondary variant on purpose: the
                // page's primary CTAs are "Browse Catalogue" / "Our Story" in
                // the hero, and the design system reserves the green fill for
                // the single main action on a page. A filled Login here would
                // compete with those. The user icon is the only addition — it
                // lets the control read as an account action at a glance rather
                // than as one more text link in the row.
                <ButtonLink
                  href="/login"
                  variant="secondary"
                  size="sm"
                  className="ml-2xs"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Login
                </ButtonLink>
              )}
            </nav>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              // Only shows below `lg`. Dark treatment, on the light header bar.
              className="lg:hidden tap-target relative flex items-center justify-center p-2xs rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean transition-colors text-warm-gray-800 hover:bg-sand-light"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
            >
              <Menu className="h-6 w-6" />
              {authState !== 'none' && (
                <span
                  className="absolute top-2xs right-2xs w-2.5 h-2.5 rounded-full bg-ocean"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        authState={authState}
      />
    </>
  );
}

function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      const items = getCart();
      setCount(items.reduce((sum, i) => sum + i.quantity, 0));
    }
    updateCount();
    // Listen for storage changes (other tabs) and custom cart-updated event (same tab)
    window.addEventListener('storage', updateCount);
    window.addEventListener('cart-updated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('cart-updated', updateCount);
    };
  }, []);

  return (
    <>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-green text-white text-[10px] font-bold rounded-full px-3xs"
        >
          {count}
        </span>
      )}
      {/* The visible badge is aria-hidden (a small numeral chip is easy to
          miss even sighted, and doubles up with the "View order" label on the
          link it sits inside) — this live region is what actually announces a
          cart-count change to screen-reader users when an item is added from
          elsewhere on the site. */}
      <span className="sr-only" role="status" aria-live="polite">
        {count > 0 ? `${count} item${count === 1 ? '' : 's'} in your order` : ''}
      </span>
    </>
  );
}
