/**
 * Unit Tests — Date formatting
 *
 * The bug these cover: `new Date('2026-08-20')` is midnight UTC, so in any zone
 * behind UTC a bare published date rendered as the previous day, and a piece
 * published today was labelled "1 day ago".
 *
 * The suite runs under America/New_York (UTC-4/-5) because that is where the
 * off-by-one appears. Australia/Brisbane would pass either way, which is why
 * the local default is not good enough as a regression guard.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import {
  formatArticleDate,
  formatShortDate,
  formatRelativeDate,
} from '@/lib/format-date';

const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'America/New_York';
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = ORIGINAL_TZ;
  }
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatArticleDate', () => {
  it('keeps the calendar day of a bare YYYY-MM-DD in a UTC-negative zone', () => {
    expect(formatArticleDate('2026-08-20')).toBe('20 August 2026');
  });

  it('does not roll a first-of-month date back into the previous month', () => {
    expect(formatArticleDate('2026-01-01')).toBe('1 January 2026');
  });

  it('renders a timestamp on its display-zone day, not the viewer zone day', () => {
    // 23:00 on the 20th in Brisbane, still the 19th in New York.
    expect(formatArticleDate('2026-08-20T13:00:00Z')).toBe('20 August 2026');
  });

  it('returns an empty string rather than "Invalid Date"', () => {
    expect(formatArticleDate('not a date')).toBe('');
  });
});

describe('formatShortDate', () => {
  it('keeps the calendar day of a bare YYYY-MM-DD', () => {
    expect(formatShortDate('2026-08-20')).toBe('20 Aug 2026');
  });

  it('renders a timestamp on its display-zone day', () => {
    expect(formatShortDate('2026-08-20T13:00:00Z')).toBe('20 Aug 2026');
  });
});

describe('formatRelativeDate', () => {
  it('calls a bare date published today "Today"', () => {
    // 11:00 on the 21st in Brisbane.
    vi.setSystemTime(new Date('2026-08-21T01:00:00Z'));
    expect(formatRelativeDate('2026-08-21')).toBe('Today');
  });

  it('counts whole calendar days back', () => {
    vi.setSystemTime(new Date('2026-08-21T01:00:00Z'));
    expect(formatRelativeDate('2026-08-20')).toBe('1 day ago');
    expect(formatRelativeDate('2026-08-18')).toBe('3 days ago');
  });

  it('never reports a future date as negative', () => {
    vi.setSystemTime(new Date('2026-08-21T01:00:00Z'));
    expect(formatRelativeDate('2026-09-01')).toBe('Today');
  });

  it('rolls up to months and years', () => {
    vi.setSystemTime(new Date('2026-08-21T01:00:00Z'));
    expect(formatRelativeDate('2026-06-20')).toBe('2 months ago');
    expect(formatRelativeDate('2024-08-20')).toBe('2 years ago');
  });

  it('is unaffected by a local DST transition', () => {
    // US DST ended 2 November 2025, making that local day 25 hours long. A
    // millisecond-based day count would report 2 days here.
    vi.setSystemTime(new Date('2025-11-03T14:00:00Z'));
    expect(formatRelativeDate('2025-11-01')).toBe('3 days ago');
  });
});
