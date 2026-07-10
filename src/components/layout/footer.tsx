import Link from 'next/link';

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
    <footer className="bg-footer-bg text-white mt-section-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Three content boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group block p-6 rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              <h3 className="font-heading text-lg font-semibold text-sand-light group-hover:text-white mb-2">
                {link.title}
              </h3>
              <p className="text-sm text-sand/80 leading-relaxed">
                {link.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-sand/60">
            <p>&copy; {new Date().getFullYear()} Solomon Islands Arts and Crafts.</p>
            <Link href="/for-makers" className="text-sand/80 hover:text-white transition-colors">
              For Makers
            </Link>
          </div>
          <p className="text-xs text-sand/40">
            Crafts belong to Solomon Islands peoples and communities. SIAC is a conduit, not an owner.
          </p>
        </div>
      </div>
    </footer>
  );
}
