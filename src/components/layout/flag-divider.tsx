/**
 * Solomon Islands flag motif — navy, white, gold, then green on a 115deg diagonal.
 * Purely decorative; carries no meaning for assistive tech.
 *
 * Variants, in descending weight:
 *  - divider  (14px, full-bleed) chapter break. Max two per page.
 *  - hairline (3px, full-bleed)  caps the top edge of dark bands.
 *  - mark     (64px stub)        sits under page titles on interior pages.
 */
type FlagVariant = 'divider' | 'hairline' | 'mark';

const VARIANT_CLASS: Record<FlagVariant, string> = {
  divider: 'flag-divider',
  hairline: 'flag-hairline',
  mark: 'flag-mark',
};

interface FlagDividerProps {
  variant?: FlagVariant;
  className?: string;
}

export function FlagDivider({ variant = 'divider', className = '' }: FlagDividerProps) {
  return (
    <div
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
