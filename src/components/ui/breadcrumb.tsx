import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

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
 * - "/" separators
 * - Current page (last item) rendered as text, not a link
 * - Parent link styled as ocean to act as clear "back" affordance
 * - Compact on mobile: shows only parent + current page
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // On mobile, show only the parent as a back link (more usable on small screens)
  const parent = items.length >= 2 ? items[items.length - 2] : null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {/* Mobile: simple back link to parent */}
      {parent?.url && (
        <Link
          href={parent.url}
          className="sm:hidden inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors tap-target"
        >
          <ChevronLeft className="w-4 h-4" />
          {parent.name}
        </Link>
      )}

      {/* Desktop: full breadcrumb trail */}
      <ol className="hidden sm:flex flex-wrap items-center gap-0 text-sm">
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
                  className="text-warm-gray-600 truncate max-w-[200px] lg:max-w-none"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-warm-gray-600 hover:text-ocean hover:underline transition-colors"
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
