'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/makers', label: 'Makers' },
  { href: '/about', label: 'About' },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/contact', label: 'Contact' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    // Lock body scroll
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

  if (!isOpen) return null;

  return (
    <div
      ref={navRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 md:hidden flex flex-col"
      style={{ zIndex: 9999, backgroundColor: '#FFFDF8' }}
    >
      {/* Top bar — close button in same position as hamburger (top-right) */}
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <span className="font-heading text-xl font-bold text-deep-blue">
          SI Crafts
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

      {/* Centered nav links */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-4 pb-16">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`tap-target flex items-center justify-center w-full max-w-xs px-4 py-4 rounded-md text-xl font-heading font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
              isActive(link.href)
                ? 'text-ocean bg-ocean/5'
                : 'text-deep-blue hover:text-ocean hover:bg-sand-light'
            }`}
            aria-current={isActive(link.href) ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
