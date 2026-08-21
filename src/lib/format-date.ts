/**
 * Date formatting helpers.
 *
 * The news index used a relative "3 days ago" formatter while the article page
 * used an absolute date, so the same article showed two different dates
 * depending on where you looked. These are the two agreed formats:
 *
 *  - formatArticleDate  — absolute, for card metadata and bylines
 *  - formatRelativeDate — relative, only where recency is the point
 *
 * Both use en-AU because the audience is Australian stockists.
 *
 * Everything here works in whole calendar days, never instants. Two kinds of
 * input arrive and neither should depend on where the reader is sitting:
 *
 *  - A bare "2026-08-20" names a day and carries no zone. `new Date(...)` on it
 *    is midnight UTC, so anywhere west of UTC it rendered as the 19th and a
 *    piece published today read "1 day ago". Its parts are read directly
 *    instead, so no zone is ever applied.
 *  - A full timestamp is a real instant, so it is reduced to the calendar day it
 *    falls on in the site's display zone (Australia/Brisbane, matching the
 *    backend TIME_ZONE) rather than the reader's.
 *
 * Both then render identically for every reader.
 */

const LOCALE = 'en-AU';

/** Matches the backend's TIME_ZONE — the zone SIAC's dates are quoted in. */
export const DISPLAY_TIME_ZONE = 'Australia/Brisbane';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** en-CA formats as YYYY-MM-DD, which splits back apart cleanly. */
const displayDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** A calendar day with no time and no zone attached. */
interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

function displayDayOf(instant: Date): CalendarDay {
  const parts = displayDayFormatter.formatToParts(instant);
  const year = Number(parts.find((p) => p.type === 'year')!.value);
  const month = Number(parts.find((p) => p.type === 'month')!.value);
  const day = Number(parts.find((p) => p.type === 'day')!.value);
  return { year, month, day };
}

function toCalendarDay(dateStr: string): CalendarDay | null {
  const trimmed = (dateStr ?? '').trim();

  if (DATE_ONLY.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    // Validate the date is real (e.g. reject Feb 30). Construct a UTC date and
    // confirm it matches the parsed components — Date will normalise overflows.
    const check = new Date(Date.UTC(year, month - 1, day));
    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day
    ) {
      return null;
    }
    return { year, month, day };
  }

  const instant = new Date(trimmed);
  if (Number.isNaN(instant.getTime())) return null;
  return displayDayOf(instant);
}

/**
 * Render a calendar day as a real date. UTC noon, formatted in UTC — the day
 * can't drift because no other zone is involved.
 */
function asUtcDate({ year, month, day }: CalendarDay): Date {
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/** Days since the epoch. Always exactly 24h apart, so DST can't skew a diff. */
function epochDay({ year, month, day }: CalendarDay): number {
  return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

function format(dateStr: string, options: Intl.DateTimeFormatOptions): string {
  const calendarDay = toCalendarDay(dateStr);
  if (calendarDay === null) return '';

  return asUtcDate(calendarDay).toLocaleDateString(LOCALE, {
    ...options,
    timeZone: 'UTC',
  });
}

/** e.g. "20 August 2026" */
export function formatArticleDate(dateStr: string): string {
  return format(dateStr, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** e.g. "20 Aug 2026" — for dense contexts such as admin tables. */
export function formatShortDate(dateStr: string): string {
  return format(dateStr, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. "3 days ago". Use only where recency itself is the information. */
export function formatRelativeDate(dateStr: string): string {
  const then = toCalendarDay(dateStr);
  if (then === null) return '';

  const today = displayDayOf(new Date());
  const days = Math.max(0, epochDay(today) - epochDay(then));

  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
