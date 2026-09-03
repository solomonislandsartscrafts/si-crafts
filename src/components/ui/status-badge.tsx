/**
 * Shared StatusBadge component — single source of truth for status indicators.
 *
 * Visually distinct from buttons and links: uses rounded-sm (not pill),
 * no hover/pointer, and smaller padding to avoid confusion with interactive
 * elements when placed near clickable rows or links.
 *
 * Supports two sizes:
 *  - 'default': standard page/card context
 *  - 'compact': denser table rows (smaller padding, won't force extra row height)
 */

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'default' | 'compact';

interface StatusBadgeProps {
  /** Semantic status determines the color scheme */
  status: BadgeStatus;
  /** Size variant for context-appropriate density */
  size?: BadgeSize;
  /** The label text */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const STATUS_STYLES: Record<BadgeStatus, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning-text',
  error: 'bg-error/10 text-error',
  info: 'bg-ocean/10 text-ocean',
  neutral: 'bg-warm-gray-200 text-warm-gray-600',
};

const SIZE_STYLES: Record<BadgeSize, string> = {
  default: 'px-xs py-3xs text-xs',
  compact: 'px-2xs py-3xs text-xs leading-heading',
};

export function StatusBadge({
  status,
  size = 'default',
  children,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-sm font-medium whitespace-nowrap',
        STATUS_STYLES[status],
        SIZE_STYLES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
