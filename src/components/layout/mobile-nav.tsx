'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, LogIn, User, Shield } from 'lucide-react';

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
        animating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      style={{ zIndex: 9999 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="tap-target flex items-center justify-center p-2 rounded-md text-deep-blue hover:text-ocean focus:outline-none focus:ring-2 focus:ring-ocean"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
        <span className="font-heading text-sm font-semibold text-deep-blue uppercase tracking-wider">
          SIAC
        </span>
        {/* Spacer to balance layout */}
        <div className="w-10" />
      </div>

      {/* Nav links — compact list, left-aligned with chevrons */}
      <nav className="flex-1 px-5 pt-2" aria-label="Main navigation">
        <ul className="space-y-0">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className={`tap-target flex items-center justify-between py-3 text-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded ${
                  isActive(link.href)
                    ? 'text-ocean'
                    : 'text-deep-blue hover:text-ocean'
                }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
                <ChevronRight className="w-5 h-5 text-brand-green flex-shrink-0" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="border-t border-sand mt-2 pt-4">
          {authState === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="tap-target inline-flex items-center gap-2 py-3 text-lg font-medium text-deep-blue hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
          )}
          {authState === 'stockist' && (
            <Link
              href="/stockist/catalogue"
              onClick={onClose}
              className="tap-target inline-flex items-center gap-2 py-3 text-lg font-medium text-deep-blue hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
            >
              <User className="w-5 h-5" />
              My Account
            </Link>
          )}
          {authState === 'none' && (
            <Link
              href="/login"
              onClick={onClose}
              className="tap-target inline-flex items-center gap-2 py-3 text-lg font-medium text-deep-blue hover:text-ocean transition-colors focus:outline-none focus:ring-2 focus:ring-ocean rounded"
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
