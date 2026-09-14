import { apiGet, apiGetPublic, apiPut, getAdminToken } from '@/lib/api-client';

/**
 * Show/hide toggle for the homepage "Supported by" band.
 *
 * Stored as the `showSupporters` boolean on the shared SiteContent singleton
 * (the same `/api/site-content/` record the announcement banner and slideshow
 * settings live on), so this reads/writes only that one sub-key. Mirrors the
 * announcement.ts service shape exactly.
 *
 * Defaults to `false`: the band stays hidden until an admin explicitly turns it
 * on in Admin → Supporters. An unset or legacy record keeps the section off, so
 * the "Supported by" band never appears until it is deliberately activated.
 */

/** Default: supporters band hidden until explicitly turned on. */
const DEFAULT_SHOW = false;

/**
 * Coerce the raw `showSupporters` value from the backend into a boolean.
 * Only an explicit `true` shows the band; a missing or malformed value reads as
 * "hide" so the section is never shown until the admin turns it on.
 */
function parseShowSupporters(raw: unknown): boolean {
  return typeof raw === 'boolean' ? raw : DEFAULT_SHOW;
}

/**
 * Fetch the current toggle (uncached — for the admin editor, so a save is
 * reflected immediately). Throws on request failure so the editor can surface
 * an error rather than silently showing a default.
 */
export async function getShowSupporters(): Promise<boolean> {
  const data = await apiGet<Record<string, unknown>>('/api/site-content/');
  return parseShowSupporters(data?.showSupporters);
}

/**
 * Public read for the homepage band. Cached (ISR) like other public copy, so a
 * visitor's request never waits on the backend. Falls back to the default
 * (shown) on any failure — a broken read must never hide the section.
 */
export async function getShowSupportersSafe(): Promise<boolean> {
  try {
    const data = await apiGetPublic<Record<string, unknown>>('/api/site-content/');
    return parseShowSupporters(data?.showSupporters);
  } catch {
    return DEFAULT_SHOW;
  }
}

/** Save the toggle (admin-only). */
export async function updateShowSupporters(showSupporters: boolean): Promise<boolean> {
  const token = getAdminToken();
  const data = await apiPut<Record<string, unknown>>(
    '/api/site-content/',
    { showSupporters },
    token
  );
  return parseShowSupporters(data?.showSupporters);
}
