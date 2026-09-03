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
 * `overHero` swaps to light text for the transparent-over-blue homepage state.
 */
function navLinkClasses(active: boolean, overHero: boolean): string {
  const base =
    'tap-target px-2xs xl:px-xs py-2xs text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-sm';
  if (overHero) {
    return `${base} ${active ? 'text-white' : 'text-white/75 hover:text-white'}`;
  }
  return `${base} ${
    active
      ? 'text-ocean'
      : 'text-warm-gray-600 border-transparent hover:text-deep-blue hover:border-ocean'
  }`;
}

interface HeaderProps {
  /**
   * Homepage only. The header starts transparent over the green hero band
   * with light content (white wordmark + nav), then flips to the solid
   * `bg-cream` treatment once the user scrolls past the hero. Off everywhere
   * else — every other page has a light background under the header.
   */
  transparentOverHero?: boolean;
}

export function Header({ transparentOverHero = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('none');
  // `true` while the header sits over the hero (transparent, light content).
  // Only ever true when transparentOverHero is set. Starts true so the first
  // paint over the hero is already light — flipping from solid to transparent
  // on mount would flash the wrong treatment.
  const [overHero, setOverHero] = useState(transparentOverHero);
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

  // Flip to the solid treatment once the hero band has scrolled up past the
  // header. The threshold is intentionally short (most of the header height):
  // it flips while the hero is still mostly in view, so the transparent state
  // never lingers over white content below the fold. Passive listener, and it
  // runs once on mount to catch a reload partway down the page.
  useEffect(() => {
    if (!transparentOverHero) {
      setOverHero(false);
      return;
    }
    function onScroll() {
      setOverHero(window.scrollY < 64);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOverHero]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          overHero
            ? // Transparent-over-hero is a DESKTOP-only treatment. Below `lg` the
              // hero is text-only (the slideshow is `lg`+), the header sits on a
              // shorter blue band, and the flip-on-scroll was unreliable on
              // mobile browsers — so on mobile the header is solid white from the
              // start, matching every other page. The transparent state only
              // applies from `lg` up; `max-lg:` pins the solid treatment below it.
              'bg-transparent border-b border-transparent max-lg:bg-cream/95 max-lg:backdrop-blur-sm max-lg:border-sand'
            : 'bg-cream/95 backdrop-blur-sm border-b border-sand'
        }`}
      >
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
              className="tap-target inline-flex flex-shrink-0 items-center rounded-sm transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ocean mr-md lg:mr-lg"
              aria-label="Solomon Islands Arts & Crafts — home"
            >
              {/* Over the blue hero the logo is rendered white via a
                  brightness-0/invert filter — but only from `lg` up
                  (`onDarkFromLg`), because the transparent-over-hero header is
                  desktop-only. Below `lg` the header is solid white and the dark
                  ink logo is correct. Once scrolled (solid header, `overHero`
                  false) the standard dark logo returns at every width. */}
              <Logo onDarkFromLg={overHero} />
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
                  className={navLinkClasses(isActive(link.href), overHero)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Hairline separating the browse links from the utility links +
                  auth control, so the primary nav reads as one lean group. */}
              <span
                className={`mx-2xs h-5 w-px ${overHero ? 'bg-white/30' : 'bg-sand'}`}
                aria-hidden="true"
              />

              {UTILITY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClasses(isActive(link.href), overHero)}
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
                  className={`ml-2xs ${overHero ? '!bg-white/15 hover:!bg-white/25' : ''}`}
                >
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  Admin
                </ButtonLink>
              )}
              {authState === 'stockist' && (
                <>
                  <Link
                    href="/stockist/orders"
                    className={`tap-target relative ml-2xs flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                      overHero
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-warm-gray-600 hover:text-deep-blue hover:bg-sand-light'
                    }`}
                    aria-label="View order"
                  >
                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                    <CartBadge />
                  </Link>
                  <ButtonLink
                    href="/stockist/account"
                    size="sm"
                    className={`ml-3xs ${overHero ? '!bg-white/15 hover:!bg-white/25' : ''}`}
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
                // than as one more text link in the row. Over the hero the
                // ocean outline becomes a white outline so it reads on blue.
                <ButtonLink
                  href="/login"
                  variant="secondary"
                  size="sm"
                  className={`ml-2xs ${
                    overHero
                      ? '!text-white !border-white/70 hover:!bg-white/10 hover:!border-white hover:!text-white'
                      : ''
                  }`}
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  Login
                </ButtonLink>
              )}
            </nav>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              // The menu button only shows below `lg`, where the header is now
              // solid white even on the homepage (transparent-over-hero is
              // desktop-only). So it always takes the dark treatment — the
              // `overHero` white variant would be invisible on the white bar.
              className="lg:hidden tap-target relative flex items-center justify-center p-2xs rounded-md focus:outline-none focus:ring-2 focus:ring-ocean transition-colors text-warm-gray-800 hover:bg-sand-light"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
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

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-green text-white text-[10px] font-bold rounded-full px-3xs">
      {count}
    </span>
  );
}
