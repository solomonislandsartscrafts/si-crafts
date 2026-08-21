import { CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { pageTitleClasses } from '@/components/layout/page-header';

/**
 * Confirmation screen shown after a form submits successfully.
 *
 * Replaces the near-identical centred "icon circle + heading + reassurance"
 * blocks that were duplicated across contact, for-makers, stockist apply,
 * orders, requests, and the three password flows — each with slightly
 * different container widths, icons and heading sizes.
 */
interface SuccessPanelProps {
  title: string;
  /** What happens next. Keep it concrete: who will contact them, and when. */
  description?: React.ReactNode;
  /** Defaults to CheckCircle. Pass Send for "message sent" style flows. */
  icon?: LucideIcon;
  /** Reference numbers, timestamps, notices. Rendered above the actions. */
  children?: React.ReactNode;
  /** Next steps — usually one or two <ButtonLink> elements. */
  actions?: React.ReactNode;
}

export function SuccessPanel({
  title,
  description,
  icon: Icon = CheckCircle,
  children,
  actions,
}: SuccessPanelProps) {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 page-y text-center">
      <div
        className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
        aria-hidden="true"
      >
        <Icon className="w-8 h-8 text-success" />
      </div>

      <h1 className={`${pageTitleClasses} mb-3`}>{title}</h1>

      {description && (
        <p className="text-base text-warm-gray-600 leading-relaxed">
          {description}
        </p>
      )}

      {children && <div className="mt-6 text-left">{children}</div>}

      {actions && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
