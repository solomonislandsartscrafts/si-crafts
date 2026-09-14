'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, User, Shield } from 'lucide-react';
import { useModalA11y } from '@/lib/use-modal-a11y';
import { Logo } from './logo';
import { ButtonLink } from '@/components/ui/button';

// Primary destinations — each renders as a full-width row with a trailing
// chevron, modelled on the health.govt.nz mobile menu. No leading icons: the
// row IS the affordance, so a chevron on the right is the single, quiet cue
// that the row navigates.
const PRIMARY_LINKS = [
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/makers', label: 'Makers' },
  { href: '/crafts-and-techniques', label: 'Crafts' },
  { href: '/news', label: 'News' },
  { href: '/about', label: 'About' },
  { href: '/wholesale', label: 'Wholesale' },
];

// Secondary/utility links — smaller, muted, below the divider, the way the
// health.govt.nz menu drops "Contact us" and "Feedback" under its main list.
const SECONDARY_LINKS = [{ href: '/contact', label: 'Contact us' }];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  authState: 'none' | 'stockist' | 'admin';
  /** Admin-editable site logo, threaded from the header. Empty falls back. */
  logoSrc?: string;
  logoAlt?: string;
}

export function MobileNav({ isOpen, onClose, authState, logoSrc, logoAlt }: MobileNavProps) {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Shared modal a11y: focus trap, Escape to close, body-scroll lock, and focus
  // restored to the hamburger trigger when the drawer closes. The hook focuses
  // the first focusable element (the close button) on open. `navRef` is its ref.
  const navRef = useModalA11y(isOpen, onClose);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  // Mount/unmount with an enter + exit transition.
  //
  // Open: mount the panel faded/off-screen, then flip `animating` true on the
  // NEXT frame (a `setTimeout(0)` macrotask, not a double RAF — the double RAF
  // could be coalesced on iOS Safari into the mount paint, so the enter never
  // ran) so the browser paints the closed position first and the transition
  // plays. The panel ends fully open, so with transitions disabled (reduced
  // motion) it is still open and interactive.
  //
  // Close: flip `animating` false to fade/slide out, then unmount after 300ms.
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
    // Full-viewport overlay — covers the whole mobile view like the
    // health.govt.nz menu, not a right-side max-w-sm drawer. Fades and slides
    // up slightly on enter.
    <div
      ref={navRef}
      id="mobile-nav-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className={`fixed inset-0 z-[9999] flex flex-col bg-page-bg lg:hidden transition-all duration-300 ease-out ${
        animating ? 'translate-y-0 opacity-100' : '-translate-y-2xs opacity-0'
      }`}
    >
      {/* Deep-blue top bar — the brand lockup (white ink on the dark surface)
          and the close button. Mirrors the coloured bar in the health.govt.nz
          overlay. */}
      <div className="flex items-center justify-between gap-sm bg-deep-blue px-md py-sm">
        <Link
          href="/"
          onClick={onClose}
          className="tap-target inline-flex flex-shrink-0 items-center rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-light"
          aria-label="Solomon Islands Arts & Crafts — home"
        >
          <Logo onDark src={logoSrc} alt={logoAlt} />
        </Link>
        <button
          onClick={onClose}
          className="focus-ring-on-dark tap-target flex items-center justify-center w-10 h-10 rounded-full text-white transition-colors hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Everything below the bar scrolls if it overflows a short viewport. */}
      <div className="flex-1 overflow-y-auto">
        {/* Primary links — full-width chevron rows. */}
        <nav aria-label="Main navigation">
          <ul className="site-px py-sm">
            {PRIMARY_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`tap-target flex items-center justify-between gap-sm border-b border-sand py-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm ${
                      active ? 'text-ocean' : 'text-deep-blue hover:text-ocean'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="font-heading text-lg font-medium">{link.label}</span>
                    <ChevronRight
                      className={`w-5 h-5 flex-shrink-0 ${active ? 'text-ocean' : 'text-ocean-light'}`}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Secondary links + auth control, below the primary list. */}
        <div className="site-px py-md">
          <ul className="space-y-2xs">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="tap-target inline-flex items-center py-2xs text-base text-warm-gray-600 transition-colors hover:text-deep-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth control — the same shared <ButtonLink> and variants the
              desktop header uses (admin fill for admins, ocean outline for
              stockist/logged-out), so the button matches every other button on
              the site. `onClose` closes the drawer on navigation. */}
          <div className="mt-sm">
            {authState === 'admin' && (
              <ButtonLink
                href="/admin/dashboard"
                onClick={onClose}
                variant="admin"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                Admin
              </ButtonLink>
            )}
            {authState === 'stockist' && (
              <ButtonLink
                href="/stockist/account"
                onClick={onClose}
                variant="secondary"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                My Account
              </ButtonLink>
            )}
            {authState === 'none' && (
              <ButtonLink
                href="/login"
                onClick={onClose}
                variant="secondary"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                Login
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
