/**
 * Standard page title block — the single source of truth for page-level
 * typography. Every page uses this so the h1 size, spacing, and the intro
 * paragraph are identical everywhere.
 *
 * Do not hand-roll a page title. If a page needs extra elements under the
 * intro (buttons, filters, counts), pass them as children.
 *
 * If a page has a bespoke layout that cannot use this container (e.g. an
 * article inside a sidebar grid), import `pageTitleClasses` and apply it to
 * that page's own h1 rather than inventing a new size.
 */

/** The one h1 treatment. Exported for bespoke layouts that supply their own container. */
export const pageTitleClasses =
  'font-heading text-3xl md:text-4xl font-medium text-deep-blue leading-tight';

interface PageHeaderProps {
  title: string;
  /** Optional lead paragraph. Accepts nodes so it can contain links. */
  intro?: React.ReactNode;
  /** Optional slot above the title — typically a breadcrumb or "back to" link. */
  eyebrow?: React.ReactNode;
  /** Centre the title and intro. Used for narrow confirmation/lookup pages. */
  align?: 'left' | 'center';
  /**
   * Narrow the container. `default` is the site-wide 1440px container; `narrow`
   * is for single-column pages such as a code lookup or a confirmation screen.
   */
  width?: 'default' | 'narrow';
  /** Extra content rendered below the intro, inside the same container. */
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  intro,
  eyebrow,
  align = 'left',
  width = 'default',
  children,
}: PageHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={[
        width === 'narrow' ? 'max-w-2xl' : 'max-w-site',
        // Gutters come from .site-px so the title lines up exactly with the
        // body container below it. pb-5 (20px) closes the gap to the content,
        // which then owns its own bottom padding.
        'mx-auto site-px page-y pb-5',
        centered ? 'text-center' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow ? <div className="mb-6">{eyebrow}</div> : null}
      <h1 className={`${pageTitleClasses} mb-3`}>{title}</h1>
      {intro ? (
        <p
          className={[
            'text-base sm:text-lg text-warm-gray-600 leading-relaxed max-w-2xl',
            centered ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {intro}
        </p>
      ) : null}
      {children}
    </div>
  );
}
