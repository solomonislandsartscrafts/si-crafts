'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { MobileNav } from './mobile-nav';

const NAV_LINKS = [
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/makers', label: 'Makers' },
  { href: '/about', label: 'About' },
  { href: '/wholesale', label: 'Wholesale' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-page-bg/95 backdrop-blur-sm border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="font-heading text-xl font-bold text-deep-blue hover:text-ocean transition-colors"
            >
              SI Crafts
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`tap-target flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean ${
                    isActive(link.href)
                      ? 'text-ocean bg-ocean/5'
                      : 'text-warm-gray-800 hover:bg-sand-light hover:text-deep-blue'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden tap-target flex items-center justify-center p-2 rounded-md text-warm-gray-800 hover:bg-sand-light focus:outline-none focus:ring-2 focus:ring-ocean"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
