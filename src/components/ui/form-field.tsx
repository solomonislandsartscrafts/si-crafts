import { type ReactNode, type ReactElement, isValidElement, cloneElement } from 'react';

/**
 * Shared FormField wrapper providing consistent label, helper text,
 * required indicator, and error message patterns.
 *
 * Usage:
 *   <FormField label="Email" required helperText="We'll never share your email.">
 *     <input type="email" id="email" className="form-input" />
 *   </FormField>
 *
 * The `htmlFor` prop links the label to the input. If omitted, provide an `id`
 * matching the child input's id attribute.
 */

interface FormFieldProps {
  /** Label text displayed above the input */
  label: string;
  /** HTML id of the associated input (for label `htmlFor`) */
  htmlFor?: string;
  /** Show a required indicator (* Required) */
  required?: boolean;
  /** Helper/description text below the label, before the input */
  helperText?: string;
  /** Error message — when set, the field enters error state */
  error?: string;
  /** The form control (input, textarea, select, etc.) */
  children: ReactNode;
  /** Additional class names for the wrapper */
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  helperText,
  error,
  children,
  className = '',
}: FormFieldProps) {
  // Generate IDs for aria-describedby linkage
  const helperId = htmlFor ? `${htmlFor}-helper` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      {/* Label row */}
      <div className="flex items-baseline gap-1">
        <label
          htmlFor={htmlFor}
          className="block text-base font-medium text-warm-gray-800"
        >
          {label}
        </label>
        {required && (
          <span className="text-crest-red text-sm" aria-hidden="true">
            *
          </span>
        )}
      </div>

      {/* Helper text — shown before input, describes expected format */}
      {helperText && !error && (
        <p
          id={helperId}
          className="text-base text-warm-gray-400 leading-relaxed"
        >
          {helperText}
        </p>
      )}

      {/* Input slot — inject accessibility attributes into child element */}
      {isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            id: htmlFor || (children as ReactElement<Record<string, unknown>>).props.id,
            'aria-describedby':
              [error ? errorId : helperId ? helperId : '']
                .filter(Boolean)
                .join(' ') || undefined,
            ...(required ? { required: true, 'aria-required': true } : {}),
            ...(error ? { 'aria-invalid': true } : {}),
          })
        : children}

      {/* Error message — replaces helper text when present */}
      {error && (
        <p
          id={errorId}
          className="text-base text-error mt-1"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      {/* Screen-reader only required hint */}
      {required && (
        <span className="sr-only">This field is required</span>
      )}
    </div>
  );
}

/**
 * Standard input class string — use on <input>, <textarea>, <select>.
 * Includes error variant via data attribute: data-error="true".
 *
 * Usage:
 *   <input className={inputClasses} data-error={!!error || undefined} />
 */
export const inputClasses =
  'w-full px-4 py-3 rounded-md border border-sand-dark bg-white text-warm-gray-800 ' +
  'placeholder:text-warm-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-ocean focus:border-transparent ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-warm-gray-100 ' +
  'data-[error=true]:border-error data-[error=true]:focus:ring-error';
