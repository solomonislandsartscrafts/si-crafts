import Link from 'next/link';
import { absoluteUrl } from '@/lib/metadata';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation — follows the WAI-ARIA APG breadcrumb pattern and
 * Google's BreadcrumbList structured-data guidance.
 *
 * Best-practice choices:
 * - The FULL trail shows on every viewport (Home → Section → Current). It never
 *   collapses to a single back link on mobile — a breadcrumb's job is "you are
 *   here", and dropping levels throws that away. On a narrow screen the trail
 *   simply wraps, and the current item truncates rather than pushing the row
 *   sideways.
 * - No directional arrows inside the trail. A breadcrumb reads left-to-right as
 *   hierarchy; a back-arrow conflates "up a level" with "back in history". Back
 *   navigation is a separate concern handled by <BackLink>.
 * - Semantics: <nav aria-label="Breadcrumb"> › <ol> › <li>, separators are
 *   aria-hidden, the current page is a <span> with aria-current="page" (not a
 *   link).
 * - Emits a BreadcrumbList JSON-LD script so search engines can render the
 *   trail in results. Only items that carry a URL are included as positions
 *   with an @id; the current (last) item is included by name without a URL,
 *   which Google accepts as the final crumb.
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // BreadcrumbList JSON-LD. Every listed item gets a 1-based position. Items
  // with a URL expose an absolute `item` @id; the current page is listed by
  // name only. URLs are made absolute because structured data must not use
  // site-relative paths.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-y-3xs text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span
                  className="mx-2xs text-warm-gray-400 select-none"
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {isLast || !item.url ? (
                <span
                  className="text-warm-gray-600 truncate max-w-[180px] sm:max-w-[240px] lg:max-w-none"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-ocean hover:text-ocean-dark hover:underline transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Structured data for search engines. Breadcrumb names can be
          CMS-derived, so `<` is escaped before injection — otherwise a value
          containing `</script>` would close this block early. The escape keeps
          the JSON-LD valid (\u003c is a legal JSON string for `<`). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </nav>
  );
}
