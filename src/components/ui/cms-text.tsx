import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Renders admin-authored copy.
 *
 * Editable text needs a little formatting — a bold lead-in on a bullet, a link
 * to another page — but handing admins a rich-text editor for a one-line
 * heading, and then trusting its HTML, is a bad trade. So this understands
 * exactly two things and nothing else:
 *
 *   **bold**              → <strong>
 *   [label](/path)        → a link
 *
 * Everything else is plain text. Output is built as React nodes, so it is
 * escaped by React itself — dangerouslySetInnerHTML is never involved and no
 * sanitiser is needed. Unrecognised or unsafe link targets (javascript:, data:,
 * protocol-relative //evil.com) degrade to their visible label rather than
 * rendering a live link.
 */

/** Matches a **bold** run or a [label](target) link. */
const INLINE_TOKEN = /(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\))/g;
const BOLD = /^\*\*([^*\n]+)\*\*$/;
const LINK = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/;

/**
 * True for targets we are willing to turn into a live link.
 *
 * A single leading slash only. `//evil.com` is protocol-relative and would
 * leave the site; `/\evil.com` is the same trick with a backslash, which
 * browsers normalise to a forward slash.
 */
function isSafeHref(href: string): boolean {
  if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/\\')) return true;
  return (
    href.startsWith('https://') ||
    href.startsWith('http://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  );
}

const LINK_CLASSES = 'text-ocean hover:text-ocean-dark font-medium transition-colors';

/** Turns one line of copy into inline React nodes. */
export function parseCmsInline(value: string, linkClassName = LINK_CLASSES): ReactNode[] {
  if (!value) return [];

  return value
    .split(INLINE_TOKEN)
    .filter((part) => part !== '')
    .map((part, i) => {
      const bold = part.match(BOLD);
      if (bold) return <strong key={i}>{bold[1]}</strong>;

      const link = part.match(LINK);
      if (link) {
        const [, label, href] = link;
        if (!isSafeHref(href)) return label;

        // Internal paths get client-side navigation; anything off-site opens in
        // a new tab and drops the referrer/opener.
        if (href.startsWith('/') || href.startsWith('#')) {
          return (
            <Link key={i} href={href} className={linkClassName}>
              {label}
            </Link>
          );
        }
        const external = href.startsWith('https://') || href.startsWith('http://');
        return (
          <a
            key={i}
            href={href}
            className={linkClassName}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>
        );
      }

      return part;
    });
}

/** One line of copy, with no wrapping element. */
export function CmsInline({
  value,
  linkClassName,
}: {
  value: string;
  linkClassName?: string;
}) {
  return <>{parseCmsInline(value, linkClassName)}</>;
}

/**
 * Multi-paragraph copy. A blank line starts a new paragraph, matching the hint
 * shown beside multiline fields in the admin.
 */
export function CmsText({
  value,
  className,
  paragraphClassName,
  linkClassName,
}: {
  value: string;
  /** Wrapper class. Omit the wrapper entirely by passing a single paragraph. */
  className?: string;
  paragraphClassName?: string;
  linkClassName?: string;
}) {
  const paragraphs = splitCmsParagraphs(value);
  if (paragraphs.length === 0) return null;

  return (
    <div className={className}>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={paragraphClassName}>
          {parseCmsInline(paragraph, linkClassName)}
        </p>
      ))}
    </div>
  );
}

/** Splits prose into paragraphs on blank lines. */
export function splitCmsParagraphs(value: string): string[] {
  if (!value) return [];
  return value
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Splits a `list` field into its items — one per non-blank line. */
export function splitCmsList(value: string): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
