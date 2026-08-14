import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders an internal Next.js Link for paths starting with "/",
 * or an external <a> with target="_blank", rel="noopener noreferrer",
 * and an external-link icon indicator for all other URLs.
 */
export function SmartLink({ href, children, className }: SmartLinkProps) {
  const isInternal = href.startsWith('/');

  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <ExternalLink className="w-4 h-4" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
