import type { LucideIcon } from 'lucide-react';

/**
 * Shared empty state — one treatment for "there is nothing here".
 *
 * Replaces the ad-hoc mix of bare <p> tags, centred text blocks and
 * dashed-border boxes that previously differed on every list page.
 *
 * Always give the user a way out via `action`. An empty state with no recovery
 * action is a dead end.
 */
interface EmptyStateProps {
  /** Lucide icon shown above the message. */
  icon?: LucideIcon;
  /** Short statement of what is missing, e.g. "No makers in this province yet." */
  title: string;
  /** Optional second line with more detail. */
  description?: string;
  /** Recovery action — a button or link. Strongly recommended. */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-sand-dark px-md py-xl text-center ${className}`.trim()}
    >
      {Icon && (
        <Icon
          className="w-10 h-10 text-warm-gray-400 mx-auto mb-sm"
          aria-hidden="true"
        />
      )}
      <p className="text-base font-medium text-deep-blue">{title}</p>
      {description && (
        <p className="text-base text-warm-gray-600 mt-2xs max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-md flex justify-center">{action}</div>}
    </div>
  );
}
