import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation following Cedar REI patterns:
 * - <nav> with aria-label="Breadcrumb"
 * - Ordered list for semantic structure
 * - "/" separators via CSS pseudo-elements
 * - Current page (last item) rendered as text, not a link
 * - Gray tint for links, underline on hover
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className="flex items-center"
            >
              {index > 0 && (
                <span className="mx-2 text-warm-gray-400 select-none" aria-hidden="true">/</span>
              )}
              {isLast || !item.url ? (
                <span
                  className="text-warm-gray-600 truncate max-w-[200px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-warm-gray-600 hover:text-deep-blue hover:underline transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
