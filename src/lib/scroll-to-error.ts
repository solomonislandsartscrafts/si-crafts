/**
 * After form validation fails, scroll the first invalid field into view
 * so the user immediately sees what needs fixing — even if it's above the fold.
 *
 * How it works:
 * 1. Looks for [aria-invalid="true"] inside the given container (or document).
 * 2. Falls back to the first visible error message element (text-error class).
 * 3. Scrolls it into view with a small offset from the top.
 * 4. Focuses the element if it's an input/select/textarea for keyboard users.
 *
 * Call this right after setting form errors in state:
 *   setErrors(errs);
 *   scrollToFirstError(formRef.current);
 */
export function scrollToFirstError(container?: HTMLElement | null): void {
  // Wait one tick so the DOM has rendered the error state
  requestAnimationFrame(() => {
    const root = container ?? document;

    // Try aria-invalid first (set on invalid inputs)
    let target = root.querySelector<HTMLElement>('[aria-invalid="true"]');

    // Fallback: first error message paragraph
    if (!target) {
      target = root.querySelector<HTMLElement>('.text-error');
    }

    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // If it's an interactable field, focus it
    const focusable = target.matches('input, select, textarea')
      ? target
      : target.closest<HTMLElement>('input, select, textarea') ??
        target.parentElement?.querySelector<HTMLElement>('input, select, textarea');

    if (focusable) {
      // Small delay so scroll finishes before focus shifts viewport
      setTimeout(() => focusable.focus({ preventScroll: true }), 300);
    }
  });
}
