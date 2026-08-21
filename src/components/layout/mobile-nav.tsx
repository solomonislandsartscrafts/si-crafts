'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogIn, User, Shield, ShoppingBag, Users, Palette, Newspaper, Info, Package, Mail, Home } from 'lucide-react';


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
  const navRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  // Handle mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && navRef.current) {
        const focusableElements = navRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-deep-blue/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation panel */}
      <div
        ref={navRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 w-full max-w-sm md:hidden flex flex-col bg-page-bg shadow-xl transition-transform duration-300 ease-out ${
          animating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-5">
          <span className="inline-flex items-center">
            <span className="font-heading text-lg font-semibold text-deep-blue leading-none">
              SIAC
            </span>
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="tap-target flex items-center justify-center w-10 h-10 rounded-full bg-sand-light text-deep-blue hover:bg-sand hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 pt-2 pb-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`tap-target flex items-center gap-4 px-4 py-3.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                      active
                        ? 'bg-ocean/10 text-ocean border-l-[3px] border-ocean'
                        : 'text-deep-blue hover:bg-sand-light active:bg-sand'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-ocean' : 'text-warm-gray-400'}`} />
                    <span className="text-base font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom auth section */}
        <div className="border-t border-sand px-4 py-5 bg-sand-light/50">
          {authState === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="tap-target flex items-center gap-3 w-full px-4 py-3 bg-deep-blue text-white rounded-lg font-medium transition-colors hover:bg-deep-blue/90 focus:outline-none focus:ring-2 focus:ring-ocean"
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
          )}
          {authState === 'stockist' && (
            <Link
              href="/stockist/account"
              onClick={onClose}
              className="tap-target flex items-center gap-3 w-full px-4 py-3 bg-ocean text-white rounded-lg font-medium transition-colors hover:bg-ocean-dark focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              <User className="w-5 h-5" />
              My Account
            </Link>
          )}
          {authState === 'none' && (
            <Link
              href="/login"
              onClick={onClose}
              className="tap-target w-full btn-primary"
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
