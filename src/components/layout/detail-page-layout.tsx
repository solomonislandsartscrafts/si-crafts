import type { ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb';
import { BackLink } from '@/components/shared/back-link';

/**
 * Standard layout wrapper for detail pages (maker, craft, news, piece, etc.).
 * 
 * Eliminates the repeated pattern of:
 * - Outer `site-container page-y` wrapper
 * - Breadcrumb at the top
 * - Optional BackLink at the bottom
 * 
 * The children prop contains the page-specific content structure, which varies
 * significantly across detail pages (news has sidebar, piece has gallery, etc.),
 * so this component stays deliberately minimal rather than prescribing layout.
 * 
 * @param breadcrumbs - Array of breadcrumb items (Home → Section → Current)
 * @param backLink - Optional back link shown at the bottom (e.g. "All makers", "Browse catalogue")
 * @param children - Page-specific content
 * 
 * @example
 * ```tsx
 * <DetailPageLayout
 *   breadcrumbs={[
 *     { name: 'Home', url: '/' },
 *     { name: 'Makers', url: '/makers' },
 *     { name: maker.name },
 *   ]}
 *   backLink={{ label: 'All makers', href: '/makers' }}
 * >
 *   <YourPageContent />
 * </DetailPageLayout>
 * ```
 */
export function DetailPageLayout({
  breadcrumbs,
  backLink,
  children,
}: {
  breadcrumbs: BreadcrumbItem[];
  backLink?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <div className="site-container page-y">
      {/* Breadcrumb navigation */}
      <Breadcrumb items={breadcrumbs} className="mb-stack" />

      {/* Page-specific content */}
      {children}

      {/* Optional back link at bottom */}
      {backLink && (
        <div className="mt-block pt-block border-t border-sand text-center">
          <BackLink href={backLink.href} label={backLink.label} />
        </div>
      )}
    </div>
  );
}
