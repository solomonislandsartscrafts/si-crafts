import type { Metadata } from 'next';

/**
 * Admin segment layout.
 *
 * The admin surface is its own environment: LayoutShell already suppresses the
 * public header and footer for /admin routes, and this layout keeps admin pages
 * out of the public metadata template and off search engines.
 */
export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | SIAC Admin',
  },
  robots: { index: false, follow: false },
};

export default function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
