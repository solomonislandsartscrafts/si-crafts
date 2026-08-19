import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation with prominent back-navigation:
 * - Mobile: pill-style "← Parent" button — large, tappable, unmissable
 * - Desktop: full trail with emphasized parent link (arrow + medium weight)
 * - Semantic: <nav> with aria-label, ordered list, aria-current on last item
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  const parent = items.length >= 2 ? items[items.length - 2] : null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {/* Mobile: prominent pill-style back link */}
      {parent?.url && (
        <Link
          href={parent.url}
          className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ocean bg-ocean/8 hover:bg-ocean/15 rounded-full transition-colors tap-target"
        >
          <ArrowLeft className="w-4 h-4" />
          {parent.name}
        </Link>
      )}

      {/* Desktop: full breadcrumb trail with emphasized parent */}
      <ol className="hidden sm:flex flex-wrap items-center gap-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isParent = index === items.length - 2;

          return (
            <li key={index} className="flex items-center">
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
              ) : isParent ? (
                <Link
                  href={item.url}
                  className="inline-flex items-center gap-1 font-medium text-ocean hover:text-ocean-dark transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
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
