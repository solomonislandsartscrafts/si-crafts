import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

/**
 * Shared Button component with consistent variants, states, and accessibility.
 *
 * Variants:
 *  - primary:   Green fill + gold border (main CTA)
 *  - secondary: Ocean outline, subtle darken on hover (NOT fill swap)
 *  - danger:    Red fill for destructive actions
 *  - admin:     Deep-blue fill for admin panel actions
 *
 * States: default, hover, focus, active, disabled, loading
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'admin';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Text shown while loading (replaces children) */
  loadingText?: string;
  /** Render as a full-width block button */
  fullWidth?: boolean;
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm sm:px-6 sm:py-3',
  lg: 'px-6 py-3 text-base sm:px-8 sm:py-3.5',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  admin: 'btn-admin',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={[
          'tap-target',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          loading ? 'cursor-wait' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface ButtonLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A next/link styled exactly like <Button>.
 *
 * Use this for navigation CTAs so link-buttons and real buttons stay visually
 * identical. Do not hand-roll `.btn-primary` onto a <Link>: the btn-* classes
 * already set their own padding, and extra padding utilities fight them.
 */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={[
        'tap-target',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Link>
  );
}
