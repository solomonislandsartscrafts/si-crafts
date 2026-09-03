import Link from 'next/link';
import { Logo } from './logo';
import { AcknowledgementFooterNote } from './acknowledgement-of-country';
import { getSiteTextSafe } from '@/services/site-text';

/**
 * Footer navigation — grouped by intent, mirroring the header.
 *
 * Titles and hrefs stay in code: this is navigation, and a mismatch between a
 * footer link and the page it opens is a bug, not an editorial choice. The
 * three support pages (Our Promise, Care Guide, FAQs) used to sit at the top of
 * the footer as large bordered cards with editable descriptions, which gave
 * secondary support pages more weight than the primary site sections and left
 * the footer with no real navigation. They are now plain links in the Support
 * column alongside the rest of the site map.
 *
 *  - Explore   the browse journey a public visitor moves through.
 *  - Wholesale the trade path — the site's core business goal.
 *  - Support   the help + policy pages, including the former three cards.
 */
const FOOTER_NAV: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Catalogue', href: '/catalogue' },
      { label: 'Makers', href: '/makers' },
      { label: 'Crafts', href: '/crafts-and-techniques' },
      { label: 'News', href: '/news' },
      { label: 'About', href: '/about' },
    ],
  },
  {
    heading: 'Wholesale',
    links: [
      { label: 'Wholesale enquiries', href: '/wholesale' },
      { label: 'Find a stockist', href: '/stockists' },
      { label: 'For makers', href: '/for-makers' },
      { label: 'Stockist login', href: '/login' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Our Promise', href: '/our-promise' },
      { label: 'Care Guide', href: '/care-guide' },
      { label: 'FAQs & Shipping', href: '/faqs-and-shipping' },
    ],
  },
];

export async function Footer() {
  const text = await getSiteTextSafe();

  return (
    // `mt-block` (32 → 64), one rung below a section break. The last section on
    // a page already contributes its own `--section-y`, so this lands on the
    // same 80 / 160px the footer had before — and it stays a rung below
    // section-to-section spacing on purpose: the switch to a dark background is
    // itself a hard boundary, so a full section gap of white above it reads as a
    // layout fault rather than as rhythm.
    <footer className="bg-footer-bg text-white mt-block">
      {/* Site map + brand.
          `.section-y` (48 → 96): the footer is a major section of the page, so
          it takes the section rung of the scale like every other one. */}
      <div className="border-b border-white/10">
        <div className="site-container section-y">
          <div className="grid grid-cols-2 gap-x-grid gap-y-block md:grid-cols-4 md:gap-y-0">
            {/* Brand column — the wordmark and a one-line description. On a
                phone it spans both columns so the nav groups pair up beneath it;
                from md it is the first of four columns. The dark footer renders
                the white (`onDark`) lockup, since the ink artwork would vanish
                here. */}
            <div className="col-span-2 md:col-span-1">
              <Link
                href="/"
                className="inline-flex rounded-sm focus:outline-none focus:ring-2 focus:ring-ocean-light"
                aria-label="Solomon Islands Arts & Crafts — home"
              >
                <Logo onDark />
              </Link>
              {text['footer.tagline'] && (
                <p className="mt-sm max-w-xs text-base text-white/70 leading-body">
                  {text['footer.tagline']}
                </p>
              )}
            </div>

            {/* Nav groups.
                h2, not h3: the footer has no section heading of its own, so an
                h3 here would attach itself to whatever the last section of the
                page happened to be. */}
            {FOOTER_NAV.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="font-heading text-base font-semibold leading-title-sm text-white mb-sm">
                  {group.heading}
                </h2>
                <ul className="space-y-2xs">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {/* `tap-target` (48px min hit area) rather than a bare
                          text link, so a footer link is comfortably tappable on
                          a phone. `justify-start` keeps the label left-aligned
                          inside that taller box. */}
                      <Link
                        href={link.href}
                        className="tap-target inline-flex items-center justify-start text-base text-white/70 leading-body hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-light rounded-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Acknowledgement of Country */}
      <AcknowledgementFooterNote
        text={text['acknowledgement.text']}
        linkLabel={text['acknowledgement.footerLinkLabel']}
      />

      {/* Bottom bar.
          `.page-y` (24 → 32) so the copyright row is separated from the
          acknowledgement above it by the acknowledgement's own bottom padding
          plus this one. The border above it does the rest of the work. */}
      <div className="site-container page-y">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-sm">
          <p className="text-sm text-white/70">
            &copy; {new Date().getFullYear()} Solomon Islands Arts &amp; Crafts.
          </p>
          <p className="text-xs text-white/70 sm:text-right">
            {text['footer.sovereigntyNote']}
          </p>
        </div>
      </div>
    </footer>
  );
}
