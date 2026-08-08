import { FlagDivider } from './flag-divider';

/**
 * Standard page title block — the single source of truth for page-level
 * typography. Every interior page uses this so the h1 size, the flag mark,
 * and the intro paragraph are identical everywhere.
 *
 * Do not hand-roll a page title. If a page needs extra elements under the
 * intro (buttons, filters, counts), pass them as children.
 */
interface PageHeaderProps {
  title: string;
  /** Optional lead paragraph. Accepts nodes so it can contain links. */
  intro?: React.ReactNode;
  /** Optional slot above the title — typically a "back to" link. */
  eyebrow?: React.ReactNode;
  /** Extra content rendered below the intro, inside the same container. */
  children?: React.ReactNode;
}

export function PageHeader({ title, intro, eyebrow, children }: PageHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-y pb-8">
      {eyebrow ? <div className="mb-6">{eyebrow}</div> : null}
      <h1 className="font-heading text-[1.75rem] sm:text-3xl md:text-4xl font-medium text-deep-blue leading-tight mb-3">
        {title}
      </h1>
      <FlagDivider variant="mark" className="mb-5" />
      {intro ? (
        <p className="text-base sm:text-lg text-warm-gray-600 max-w-2xl leading-relaxed">{intro}</p>
      ) : null}
      {children}
    </div>
  );
}
