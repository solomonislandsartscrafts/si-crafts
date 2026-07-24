'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, Shield, ShoppingCart } from 'lucide-react';
import { MobileNav } from './mobile-nav';

const NAV_LINKS = [
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/makers', label: 'Makers' },
  { href: '/crafts-and-techniques', label: 'Crafts' },
  { href: '/news', label: 'News' },
  { href: '/about', label: 'About' },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/contact', label: 'Contact' },
];

type AuthState = 'none' | 'stockist' | 'admin';

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

  const isHome = pathname === '/';
  const showDark = true; // Always use dark text on header now

  return (
    <>
      <header className="sticky top-0 z-30 bg-deep-blue transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="font-heading text-xl font-bold text-white hover:text-white/80 transition-colors"
            >
              SI Crafts
            </Link>

            <nav className="hidden md:flex items-center gap-2" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`tap-target flex items-center px-3 py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded-md ${
                    isActive(link.href)
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth button - changes based on login state */}
              {authState === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  className="tap-target inline-flex items-center gap-1.5 ml-2 px-4 py-2 bg-deep-blue hover:bg-deep-blue/90 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              {authState === 'stockist' && (
                <>
                  <Link
                    href="/stockist/orders"
                    className="tap-target relative ml-2 p-2 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
                    aria-label="View order"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <CartBadge />
                  </Link>
                  <Link
                    href="/stockist/account"
                    className="tap-target inline-flex items-center gap-1.5 ml-1 px-4 py-2 bg-ocean hover:bg-ocean-dark text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                  >
                    My Account
                  </Link>
                </>
              )}
              {authState === 'none' && (
                <Link
                  href="/login"
                  className="tap-target inline-flex items-center ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light bg-terracotta hover:bg-terracotta-dark text-white"
                >
                  Login
                </Link>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden tap-target relative flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean text-white hover:bg-white/10"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
              {authState !== 'none' && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-ocean rounded-full" aria-hidden="true" />
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
      try {
        const raw = localStorage.getItem('si_crafts_cart');
        if (raw) {
          const items = JSON.parse(raw);
          setCount(items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
        } else {
          setCount(0);
        }
      } catch { setCount(0); }
    }
    updateCount();
    // Listen for storage changes (other tabs or same-tab updates)
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 1000);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-terracotta text-white text-[10px] font-bold rounded-full px-1">
      {count}
    </span>
  );
}
