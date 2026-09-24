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
 *
 * Layout invariant: the label and input NEVER move. The field flows top-down
 * and is not stretched to fill its grid cell, so a neighbour in the same row
 * growing (e.g. its error message appearing as the user types) cannot shift
 * this field's input. Errors open below the input, extending the field
 * downward only.
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
  /**
   * A short hint shown inline on the label row itself (right of the label /
   * required mark) rather than as a block line below it. Use for a brief format
   * cue like "11 digits" so it doesn't add a line and drop the input below a
   * neighbouring field in the same grid row. For longer descriptions, prefer
   * `helperText`. If both are given, `inlineHint` wins and `helperText` is
   * ignored.
   */
  inlineHint?: string;
  /**
   * An interactive element rendered at the right end of the label row — e.g. an
   * <InfoTip> info icon that reveals a format example on hover/click. Like
   * `inlineHint` it stays on the label row so it never adds a line, but it's a
   * node rather than plain text. If both are given, `inlineAction` wins.
   */
  inlineAction?: ReactNode;
  /** Error message — when set, the field enters error state */
  error?: string;
  /**
   * Reserve a fixed line of space under the input for the error message, so the
   * field's height is identical whether or not an error is showing. Use this on
   * forms where fields validate live as the user types (like the stockist apply
   * form): without it, an error appearing/clearing changes the field height and
   * nudges everything below it. Assumes single-line error messages. Off by
   * default so forms that validate only on submit don't gain a blank line under
   * every field.
   */
  reserveErrorSpace?: boolean;
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
  inlineHint,
  inlineAction,
  error,
  reserveErrorSpace = false,
  children,
  className = '',
}: FormFieldProps) {
  // Generate IDs for aria-describedby linkage
  const helperId = htmlFor ? `${htmlFor}-helper` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  // An inline hint takes the place of block helper text: it describes the same
  // thing (expected format) but on the label row. Collapse to one source of
  // truth so the label→input aria-describedby wiring below stays simple.
  // An inlineAction (e.g. an InfoTip) sits in the same slot and, when present,
  // supersedes the text hint — the two would compete for the right of the row.
  const hint = inlineHint || helperText;
  const showInlineAction = Boolean(inlineAction);
  const showInlineHint = Boolean(inlineHint) && !showInlineAction;
  const showBlockHelper = Boolean(helperText) && !inlineHint && !showInlineAction;
  // A text hint sits at the FAR right of the row; the action (info icon) hugs
  // the label instead. The spacer that pushes content to the far edge is only
  // needed when a text hint is shown.
  const showFarRightHint = showInlineHint;

  return (
    // Top-aligned, flows downward. NOT `h-full`/`mt-auto` stretched: a stretched
    // field pushes its input to a shared bottom edge, so when a neighbour in the
    // same grid row grows (usually its error appearing mid-typing) this field's
    // input would move to track it. The input must never move. The label row is
    // always one line — the inline hint sits ON it — so every field in a row
    // starts its input at the same y; the error opens BELOW the input.
    <div className={`flex flex-col gap-2xs ${className}`.trim()}>
      {/* Label row. Reading order left-to-right: label, required mark, then the
          info action (an InfoTip) hugging the label so it reads as one unit —
          the icon belongs to the field it explains, not the far edge of the
          row. A text hint (e.g. "11 digits"), by contrast, sits at the FAR
          right: the `mr-auto` spacer after the action pushes it there. */}
      <div className="flex items-baseline gap-3xs">
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
        {showInlineAction && <span className="-my-2xs">{inlineAction}</span>}
        {/* Spacer: only when a far-right text hint follows, to push it to the
            edge. Without a hint, the row ends after the action so it hugs. */}
        {showFarRightHint && <span className="mr-auto" aria-hidden="true" />}
        {showInlineHint && (
          <span id={helperId} className="text-sm text-warm-gray-400">
            {hint}
          </span>
        )}
      </div>

      {/* Block helper text — shown before input, describes expected format.
          Suppressed when an inline hint is used (it takes the label row). */}
      {showBlockHelper && (
        <p
          id={helperId}
          className="text-base text-warm-gray-400 leading-relaxed"
        >
          {helperText}
        </p>
      )}

      {/* Input slot — inject accessibility attributes into child element.
          Merges with (rather than overwrites) any `aria-describedby`/
          `aria-invalid` the caller already set on the child directly — a
          field can be wired to an error that lives outside FormField's own
          `error` prop (e.g. one shared banner covering several fields, as in
          the login form), and that association must survive this clone. */}
      {isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            id: htmlFor || (children as ReactElement<Record<string, unknown>>).props.id,
            'aria-describedby':
              [
                // Reference BOTH the hint (if any) and the error (if any). The
                // hint stays visible during an error, since it describes the
                // format a user fixing the error needs, so both ids can be
                // present at once. Pointing `aria-describedby` at an id no
                // element carries is itself a violation, so each id is added
                // only when its element renders.
                showInlineHint || showBlockHelper ? helperId : '',
                error ? errorId : '',
                (children as ReactElement<Record<string, unknown>>).props['aria-describedby'],
              ]
                .filter(Boolean)
                .join(' ') || undefined,
            ...(required ? { required: true, 'aria-required': true } : {}),
            // Only assert `aria-invalid` when FormField owns an error. When it
            // does not, leave whatever the child set directly — including the
            // string "false" — untouched, rather than flipping it to `true`.
            ...(error ? { 'aria-invalid': true } : {}),
          })
        : children}

      {/* Error message. With `reserveErrorSpace` the slot is ALWAYS rendered at
          a fixed one-line min-height (`leading-body` = 28px, the height one
          line of `text-base` error copy takes), so toggling the error text in
          and out never changes the field's height and nothing below it moves.
          Without it, the slot only exists when there's an error (the field
          grows downward, which is fine for submit-only forms). `aria-live`
          means the empty reserved <p> still announces the message when it later
          populates. */}
      {reserveErrorSpace ? (
        <p
          id={errorId}
          className="text-base text-error leading-body min-h-7"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : (
        error && (
          <p
            id={errorId}
            className="text-base text-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )
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
  'w-full px-sm py-xs rounded-md border border-sand-dark bg-white text-warm-gray-800 ' +
  'placeholder:text-warm-gray-400 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:border-transparent ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-warm-gray-100 ' +
  'data-[error=true]:border-error data-[error=true]:focus-visible:ring-error';
