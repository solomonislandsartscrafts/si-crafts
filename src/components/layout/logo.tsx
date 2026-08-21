/**
 * Brand lockup — text wordmark only.
 *
 * Wordmark is responsive so first-time visitors get the full name rather than
 * a bare acronym: "SIAC" on phones, "Solomon Islands Arts Crafts" from sm up.
 *
 * Note: Logo icon/mark intentionally omitted until an approved design is provided.
 */
interface LogoProps {
  /** Render light-on-dark, for the footer and admin sidebar. */
  variant?: 'default' | 'light';
  className?: string;
}

export function Logo({ variant = 'default', className = '' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-deep-blue';

  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <span className={`font-heading font-semibold leading-none ${textColor}`}>
        {/* Full name from lg up, where there is room beside the 8-item nav.
            Acronym below that, so phones and tablets stay uncrowded. */}
        <span className="lg:hidden text-lg">SIAC</span>
        <span className="hidden lg:inline text-base">
          Solomon Islands Arts Crafts
        </span>
      </span>
    </span>
  );
}
