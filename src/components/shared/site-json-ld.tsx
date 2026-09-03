import { SITE_URL, absoluteUrl } from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';

/**
 * Site-wide Organization and WebSite structured data.
 *
 * This is what lets Google connect the string "Solomon Islands Arts & Crafts"
 * to this site as an entity, rather than treating each page as unrelated text.
 * It is the piece that makes a brand-name search resolve to the right result,
 * which is precisely the search that was failing.
 *
 * Rendered once from the root layout so every page carries it. Kept as a plain
 * synchronous component with no data fetching on purpose: adding an API call to
 * the root layout would put a backend round-trip in front of every page on the
 * site, including ones that need nothing from it.
 *
 * Deliberately limited to facts that are stable and verifiable in this repo.
 * Notably absent:
 * - The contact email. It is admin-editable (SiteContent.contactEmail) and the
 *   service layer notes that which inbox is monitored is still unconfirmed.
 *   Structured data is a poor place for a value that can change under you.
 * - The ABN. site-text-manifest carries a default, but an incorrect company
 *   identifier published as structured data is worse than an absent one.
 * - Any postal address or phone number. None exists in the codebase and none
 *   should be invented.
 */
export function SiteJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Solomon Islands Arts & Crafts',
    // Both short forms appear in the wild — the title template renders
    // "| SI Crafts", and SIAC is what the organisation is called internally.
    // Listing them helps a search for either resolve to this entity.
    alternateName: ['SI Crafts', 'SIAC'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/sica%20logo.png'),
    },
    description:
      'Wholesale supplier of authentic Solomon Islands handicrafts — pandanus weaving, wood carving and shell-money jewellery — to Australian museum and gallery shops.',
    // SIAC imports and distributes; the crafts belong to Solomon Islands
    // makers and their communities. `areaServed` describes where the wholesale
    // business operates, not where the work originates.
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Solomon Islands Arts & Crafts',
    inLanguage: 'en-AU',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
    </>
  );
}
