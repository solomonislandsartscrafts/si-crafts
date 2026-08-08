'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogIn, User, Shield } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/makers', label: 'Makers' },
  { href: '/crafts-and-techniques', label: 'Crafts' },
  { href: '/news', label: 'News' },
  { href: '/about', label: 'About' },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/contact', label: 'Contact' },
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
      // Trigger animation on next frame
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
    <div
      ref={navRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className={`fixed inset-0 md:hidden flex flex-col bg-white transition-all duration-300 ease-out ${
        animating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{ zIndex: 9999 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6">
        <span className="font-heading text-xl font-semibold text-deep-blue">
          SIAC
        </span>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="tap-target flex items-center justify-center p-2 rounded-md text-warm-gray-800 hover:bg-sand-light focus:outline-none focus:ring-2 focus:ring-ocean"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Nav links with staggered fade-in */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-4 pb-16">
        {NAV_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`tap-target flex items-center justify-center w-full max-w-xs px-4 py-4 rounded-md text-xl font-heading font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ocean ${
              isActive(link.href)
                ? 'text-ocean bg-ocean/5'
                : 'text-deep-blue hover:text-ocean hover:bg-sand-light'
            } ${animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: `${(i + 1) * 50}ms` }}
            aria-current={isActive(link.href) ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
        {authState === 'admin' && (
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className={`tap-target inline-flex items-center justify-center gap-2 w-full max-w-xs mt-4 px-4 py-4 btn-admin text-lg transition-all duration-300 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: `${(NAV_LINKS.length + 1) * 50}ms` }}
          >
            <Shield className="w-5 h-5" />
            Admin Dashboard
          </Link>
        )}
        {authState === 'stockist' && (
          <Link
            href="/stockist/catalogue"
            onClick={onClose}
            className={`tap-target inline-flex items-center justify-center gap-2 w-full max-w-xs mt-4 px-4 py-4 btn-primary text-lg transition-all duration-300 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: `${(NAV_LINKS.length + 1) * 50}ms` }}
          >
            <User className="w-5 h-5" />
            My Account
          </Link>
        )}
        {authState === 'none' && (
          <Link
            href="/login"
            onClick={onClose}
            className={`tap-target inline-flex items-center justify-center gap-2 w-full max-w-xs mt-4 px-4 py-4 btn-primary text-lg transition-all duration-300 ${
              animating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: `${(NAV_LINKS.length + 1) * 50}ms` }}
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>
        )}
      </nav>
    </div>
  );
}
