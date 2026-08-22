import Link from 'next/link';
import { AcknowledgementFooterNote } from './acknowledgement-of-country';
import { getSiteTextSafe } from '@/services/site-text';

/**
 * The three quick-link cards.
 *
 * Titles and hrefs stay in code: they are navigation, and a mismatch between a
 * card title and the page it opens is a bug, not an editorial choice. The
 * descriptions beside them are copy, so those come from site text.
 */
const FOOTER_LINKS = [
  { title: 'Our Promise', href: '/our-promise', descriptionKey: 'footer.promiseDescription' },
  { title: 'Care Guide', href: '/care-guide', descriptionKey: 'footer.careDescription' },
  { title: 'FAQs & Shipping', href: '/faqs-and-shipping', descriptionKey: 'footer.faqsDescription' },
];

export async function Footer() {
  const text = await getSiteTextSafe();

  return (
    <footer className="bg-footer-bg text-white mt-10 lg:mt-20">
      {/* Quick-link cards */}
      <div className="border-b border-white/10">
        <div className="site-container py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block p-5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
              >
                {/* h2, not h3: the footer has no section heading of its own, so
                    an h3 here attaches itself to whatever the last section of
                    the page happened to be. */}
                <h2 className="font-heading text-base font-semibold text-white mb-1">
                  {link.title}
                </h2>
                <p className="text-base text-white/60 leading-relaxed">
                  {text[link.descriptionKey]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Acknowledgement of Country */}
      <AcknowledgementFooterNote
        text={text['acknowledgement.text']}
        linkLabel={text['acknowledgement.footerLinkLabel']}
      />

      {/* Bottom bar */}
      <div className="site-container py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} Solomon Islands Arts & Crafts.</p>
            <Link href="/for-makers" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">
              For Makers
            </Link>
          </div>
          <p className="text-xs text-white/70">{text['footer.sovereigntyNote']}</p>
        </div>
      </div>
    </footer>
  );
}
