import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  /** The destination URL (e.g. '/makers', '/catalogue') */
  href: string;
  /** Label shown next to the arrow — describe the destination, not "Back" */
  label: string;
  /** Additional class names */
  className?: string;
}

/**
 * Static back-link for detail pages. Always points to a known destination
 * so it works even when there's no browser history (QR scans, direct links).
 *
 * Use this instead of router.back() on pages that are entry points.
 */
export function BackLink({ href, label, className = '' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors tap-target ${className}`.trim()}
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
