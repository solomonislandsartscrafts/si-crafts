import { apiGet, apiGetPublic, apiPut, getAdminToken } from '@/lib/api-client';
import { SITE_TEXT_DEFAULTS } from '@/lib/site-text-manifest';

/** Every manifest key mapped to the copy that should render. */
export type SiteTextMap = Record<string, string>;

/**
 * Merge stored values over the manifest defaults.
 *
 * Absence means "use the default"; a stored empty string means "render
 * nothing". That distinction matters — several fields (the About photo credit,
 * the contact ABN, an unused promise card) are meant to be hideable by clearing
 * them, and treating blank as "fall back to default" would make them
 * impossible to remove.
 */
function mergeWithDefaults(raw: unknown): SiteTextMap {
  const merged: SiteTextMap = { ...SITE_TEXT_DEFAULTS };

  // apiGet answers an unreachable backend with [], so guard the shape.
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return merged;

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && key in merged) {
      merged[key] = value;
    }
  }

  return merged;
}

/**
 * In development, reading a key that isn't in the manifest is almost always a
 * typo in a page. Left alone it renders as "undefined" or silently nothing, so
 * it gets shouted about instead.
 */
function withMissingKeyWarnings(map: SiteTextMap): SiteTextMap {
  if (process.env.NODE_ENV === 'production') return map;

  return new Proxy(map, {
    get(target, prop: string) {
      if (typeof prop === 'string' && !(prop in target)) {
        console.warn(
          `[site-text] Unknown key "${prop}". Add it to src/lib/site-text-manifest.ts.`
        );
        return '';
      }
      return target[prop as keyof typeof target];
    },
  });
}

/**
 * Site copy for public pages. Cached (ISR) and throws when the backend is
 * unreachable, so a cold start can't get a half-empty page cached at the edge.
 */
export async function getSiteText(): Promise<SiteTextMap> {
  const raw = await apiGetPublic<Record<string, string>>('/api/site-text/');
  return withMissingKeyWarnings(mergeWithDefaults(raw));
}

/** Safe variant for public pages — falls back to the manifest defaults. */
export async function getSiteTextSafe(): Promise<SiteTextMap> {
  try {
    return await getSiteText();
  } catch {
    return withMissingKeyWarnings({ ...SITE_TEXT_DEFAULTS });
  }
}

/** Un-cached read for the admin editor, so a save is reflected immediately. */
export async function getSiteTextForAdmin(): Promise<SiteTextMap> {
  const raw = await apiGet<Record<string, string>>('/api/site-text/');
  return mergeWithDefaults(raw);
}

/**
 * Save copy. Only pass the keys that actually changed — the backend upserts
 * what it is given and leaves everything else alone, so two admins editing
 * different pages can't overwrite each other.
 */
export async function updateSiteText(entries: SiteTextMap): Promise<SiteTextMap> {
  const raw = await apiPut<Record<string, string>>(
    '/api/site-text/',
    entries,
    getAdminToken()
  );
  return mergeWithDefaults(raw);
}
