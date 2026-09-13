import { apiGet, apiGetPublic, apiPut, getAdminToken } from '@/lib/api-client';
import type { AnnouncementBanner, AnnouncementVariant } from '@/types';

/** Default: banner off, no message. */
const DEFAULT_ANNOUNCEMENT: AnnouncementBanner = {
  enabled: false,
  message: '',
  variant: 'blue',
};

const VARIANTS: AnnouncementVariant[] = ['blue', 'green', 'gold'];

/**
 * Parse the raw `announcement` blob from the backend into a typed banner.
 * Gracefully falls back to defaults for empty or malformed data — a broken
 * value must never take the whole public site down or show a garbled bar.
 */
function parseAnnouncement(raw: unknown): AnnouncementBanner {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ANNOUNCEMENT };

  const obj = raw as Record<string, unknown>;

  return {
    enabled: typeof obj.enabled === 'boolean' ? obj.enabled : DEFAULT_ANNOUNCEMENT.enabled,
    message: typeof obj.message === 'string' ? obj.message : DEFAULT_ANNOUNCEMENT.message,
    variant:
      typeof obj.variant === 'string' && VARIANTS.includes(obj.variant as AnnouncementVariant)
        ? (obj.variant as AnnouncementVariant)
        : DEFAULT_ANNOUNCEMENT.variant,
  };
}

/**
 * Fetch the current announcement (uncached — for the admin editor, so a save
 * is reflected immediately). Falls back to defaults if the backend is empty.
 */
export async function getAnnouncement(): Promise<AnnouncementBanner> {
  // No try/catch here on purpose: this is the admin read, and a request or
  // parse failure must propagate so the editor can surface an error toast
  // instead of silently showing a "banner off" default that would look like a
  // successful load. The default-fallback path belongs only to
  // getAnnouncementSafe (the public read), which must never fail a page.
  const data = await apiGet<Record<string, unknown>>('/api/site-content/');
  return parseAnnouncement(data?.announcement);
}

/**
 * How long a visitor may see a stale banner before the edge refetches.
 *
 * Deliberately much shorter than the site-wide PUBLIC_REVALIDATE_SECONDS (300).
 * The banner is used for time-sensitive notices an admin flips on and expects
 * to appear promptly — a five-minute delay reads as "it didn't save". This
 * still caches (so a visitor never waits on a Render cold start), just with a
 * tighter window.
 */
const ANNOUNCEMENT_REVALIDATE_SECONDS = 30;

/**
 * Public read for the banner shown on every page. Cached (ISR) like other
 * public copy, so a visitor's request never waits on the backend — but with a
 * shorter window than the rest of the site (see above).
 *
 * The `?for=banner` param is not read by the backend; it exists so this read
 * is a SEPARATE Next data-cache entry from the site-wide `/api/site-content/`
 * fetch (which uses the 300s window). Sharing one URL would let the two
 * different revalidate windows collide on a single cache entry.
 */
export async function getAnnouncementSafe(): Promise<AnnouncementBanner> {
  try {
    const data = await apiGetPublic<Record<string, unknown>>(
      '/api/site-content/?for=banner',
      ANNOUNCEMENT_REVALIDATE_SECONDS
    );
    return parseAnnouncement(data?.announcement);
  } catch {
    return { ...DEFAULT_ANNOUNCEMENT };
  }
}

/** Save the announcement (admin-only). */
export async function updateAnnouncement(
  announcement: AnnouncementBanner
): Promise<AnnouncementBanner> {
  const token = getAdminToken();
  const data = await apiPut<Record<string, unknown>>(
    '/api/site-content/',
    { announcement },
    token
  );
  return parseAnnouncement(data?.announcement);
}
