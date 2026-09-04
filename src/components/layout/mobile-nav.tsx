'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogIn, User, Shield, ShoppingBag, Users, Palette, Newspaper, Info, Package, Mail, Home } from 'lucide-react';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { Logo } from './logo';


const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/catalogue', label: 'Catalogue', icon: ShoppingBag },
  { href: '/makers', label: 'Makers', icon: Users },
  { href: '/crafts-and-techniques', label: 'Crafts', icon: Palette },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/about', label: 'About', icon: Info },
  { href: '/wholesale', label: 'Wholesale', icon: Package },
  { href: '/contact', label: 'Contact', icon: Mail },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  authState: 'none' | 'stockist' | 'admin';
}

export function MobileNav({ isOpen, onClose, authState }: MobileNavProps) {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Shared modal a11y: focus trap, Escape to close, body-scroll lock, and —
  // the gap this migration closes — focus is RESTORED to the hamburger trigger
  // when the drawer closes. The hook also focuses the first focusable element
  // (the close button) on open. `navRef` is the hook's ref.
  const navRef = useModalA11y(isOpen, onClose);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  // Mount/unmount with an enter + exit transition.
  //
  // Open: mount the panel off-screen (translate-x-full), then flip `animating`
  // true on the NEXT frame so the browser has painted the closed position and
  // the enter transition actually plays. A single `setTimeout(0)` is used as
  // the flip rather than a chained double `requestAnimationFrame`: the double
  // RAF could be coalesced on mobile browsers (notably iOS Safari) so that the
  // flip landed in the same paint as the mount — no starting frame, so the
  // transition never ran and the drawer appeared to "do nothing". A macrotask
  // is always a separate frame, so the enter reliably animates. Either way the
  // panel ends at translate-x-0, so even with transitions disabled (reduced
  // motion) it is fully open and interactive.
  //
  // Close: flip `animating` false to slide out, then unmount after the 300ms
  // transition so the panel is not left in the DOM.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const enter = setTimeout(() => setAnimating(true), 0);
      return () => clearTimeout(enter);
    }
    setAnimating(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-deep-blue/30 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation panel */}
      <div
        ref={navRef}
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 w-full max-w-sm lg:hidden flex flex-col bg-page-bg shadow-xl transition-transform duration-300 ease-out ${
          animating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Top bar — the brand lockup, matching the header, and a close button.
            The logo is a link home so the drawer's header is not a dead end. */}
        <div className="flex items-center justify-between gap-sm border-b border-sand px-md py-sm">
          <Link
            href="/"
            onClick={onClose}
            className="tap-target inline-flex flex-shrink-0 items-center rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
            aria-label="Solomon Islands Arts & Crafts — home"
          >
            <Logo />
          </Link>
          <button
            onClick={onClose}
            className="tap-target flex items-center justify-center w-10 h-10 rounded-full text-warm-gray-600 hover:bg-sand-light hover:text-deep-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-sm py-sm" aria-label="Main navigation">
          <ul className="space-y-3xs">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`tap-target flex items-center gap-sm px-sm py-xs rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean ${
                      active
                        ? 'bg-ocean/10 text-ocean'
                        : 'text-deep-blue hover:bg-sand-light active:bg-sand'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? 'text-ocean' : 'text-warm-gray-600'}`}
                      aria-hidden="true"
                    />
                    <span className="text-base font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom auth section — one button, sized and centred the same way
            across all three states so the drawer always ends on a solid CTA. */}
        <div className="border-t border-sand px-sm py-md">
          {authState === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="tap-target flex items-center justify-center gap-2xs w-full px-sm py-xs bg-deep-blue text-white rounded-lg font-medium transition-colors hover:bg-deep-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
            >
              <Shield className="w-5 h-5" aria-hidden="true" />
              Admin Dashboard
            </Link>
          )}
          {authState === 'stockist' && (
            <Link
              href="/stockist/account"
              onClick={onClose}
              className="tap-target flex items-center justify-center gap-2xs w-full px-sm py-xs bg-ocean text-white rounded-lg font-medium transition-colors hover:bg-ocean-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-light"
            >
              <User className="w-5 h-5" aria-hidden="true" />
              My Account
            </Link>
          )}
          {authState === 'none' && (
            <Link
              href="/login"
              onClick={onClose}
              className="tap-target w-full btn-primary"
            >
              <LogIn className="w-5 h-5" aria-hidden="true" />
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
