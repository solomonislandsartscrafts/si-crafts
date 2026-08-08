import Link from 'next/link';
import { AcknowledgementFooterNote } from './acknowledgement-of-country';

const FOOTER_LINKS = [
  {
    title: 'Our Promise',
    href: '/our-promise',
    description: 'Fair pay, consent, cultural respect — how we work with makers.',
  },
  {
    title: 'Care Guide',
    href: '/care-guide',
    description: 'How to look after each piece so it lasts a lifetime.',
  },
  {
    title: 'FAQs & Shipping',
    href: '/faqs-and-shipping',
    description: 'Ordering, delivery, returns, and common questions.',
  },
];

export function Footer() {
  return (
    <footer className="bg-footer-bg text-white mt-12 lg:mt-16">
      {/* Quick-link cards */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block p-5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
              >
                <h3 className="font-heading text-base font-semibold text-white mb-1">
                  {link.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Acknowledgement of Country */}
      <AcknowledgementFooterNote />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} Solomon Islands Arts and Crafts.</p>
            <Link href="/for-makers" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">
              For Makers
            </Link>
          </div>
          <p className="text-xs text-white/70">
            Crafts belong to Solomon Islands peoples and communities. SIAC is a conduit, not an owner.
          </p>
        </div>
      </div>
    </footer>
  );
}
