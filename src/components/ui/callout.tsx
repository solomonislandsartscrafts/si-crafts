import type { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react';

/**
 * Callout — the one way to flag an important standalone notice on the site.
 *
 * Some copy carries real weight and must not read as ordinary body text: the
 * wholesale-only pricing rule, the GST threshold warning, the "no minimum
 * order" note. A plain paragraph buries them; this component gives each a
 * tinted panel, an icon and (optionally) a heading so the message stands out
 * by COLOUR and SHAPE, not text alone — the accessibility point is that the
 * meaning is not carried by colour on its own (icon + text + colour together).
 *
 * Variants map to the locked semantic tokens, each an AA-safe pairing:
 *   - `info`    — ocean. Neutral-but-important facts (wholesale-only pricing).
 *   - `warning` — gold fill tint + `warning-text` (#92650A, 5.1:1 on white).
 *                 Thresholds and obligations (GST over A$1,000).
 *   - `success` — brand green. Confirmations.
 *   - `note`    — quiet sand surface for a low-key aside (no strong colour).
 *
 * The tint is the `/10` fill already used by StatusBadge, so a callout and a
 * badge of the same status read as the same colour family. A matching left
 * accent bar (border-l-4) gives the panel a clear edge without a heavy full
 * border.
 *
 * Accessibility:
 *   - The icon is decorative (`aria-hidden`) — the text always states the
 *     meaning, so the callout never relies on colour or icon alone.
 *   - `role="status"` (info/success/note) or `role="alert"` (warning), so a
 *     screen reader is told a threshold warning matters. Pass `role` to
 *     override when a warning is static page copy rather than a live response.
 */

type CalloutVariant = 'info' | 'warning' | 'success' | 'note';

interface VariantStyle {
  /** Panel fill + text colour (both AA on the fill). */
  panel: string;
  /** Left accent bar colour. */
  accent: string;
  /** Icon colour. */
  icon: string;
  /** Default Lucide icon for the variant. */
  Icon: LucideIcon;
  /** Default ARIA live role. */
  role: 'status' | 'alert';
}

const VARIANT_STYLES: Record<CalloutVariant, VariantStyle> = {
  info: {
    panel: 'bg-ocean/10 text-warm-gray-800',
    accent: 'border-ocean',
    icon: 'text-ocean',
    Icon: Info,
    role: 'status',
  },
  warning: {
    // Gold is a background-only token; the readable copy is `warning-text`.
    panel: 'bg-warning/10 text-warning-text',
    accent: 'border-accent-gold',
    icon: 'text-accent-gold-dark',
    Icon: AlertTriangle,
    role: 'alert',
  },
  success: {
    panel: 'bg-success/10 text-warm-gray-800',
    accent: 'border-brand-green',
    icon: 'text-success',
    Icon: CheckCircle2,
    role: 'status',
  },
  note: {
    panel: 'bg-sand-light text-warm-gray-600',
    accent: 'border-sand-dark',
    icon: 'text-warm-gray-400',
    Icon: Info,
    role: 'status',
  },
};

interface CalloutProps {
  /** Semantic variant — sets colour, icon and default live-region role. */
  variant?: CalloutVariant;
  /** Optional bold heading above the body (e.g. "Wholesale only"). */
  title?: string;
  /** The notice body. */
  children: ReactNode;
  /** Override the variant's default icon. Pass `null` to hide it. */
  icon?: LucideIcon | null;
  /** Override the ARIA live role. */
  role?: 'status' | 'alert';
  /** Extra classes on the outer panel (e.g. spacing, max-width). */
  className?: string;
}

export function Callout({
  variant = 'info',
  title,
  children,
  icon,
  role,
  className = '',
}: CalloutProps) {
  const style = VARIANT_STYLES[variant];
  const Icon = icon === null ? null : (icon ?? style.Icon);

  return (
    <div
      role={role ?? style.role}
      className={[
        'flex items-start gap-xs rounded-lg border-l-4 p-sm',
        style.panel,
        style.accent,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {Icon && (
        <Icon
          className={`mt-3xs h-5 w-5 flex-shrink-0 ${style.icon}`}
          aria-hidden="true"
        />
      )}
      <div className="min-w-0 text-base leading-body">
        {title && (
          <p className="font-heading text-base font-semibold leading-title-sm">
            {title}
          </p>
        )}
        <div className={title ? 'mt-3xs' : undefined}>{children}</div>
      </div>
    </div>
  );
}
