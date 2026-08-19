import { apiGet, apiPut, getAdminToken } from '@/lib/api-client';
import type { SlideshowSettings } from '@/types';

/** Default settings: all categories enabled, no per-item overrides */
const DEFAULT_SETTINGS: SlideshowSettings = {
  enabledCategories: { product: true, maker: true, craft: true },
  items: [],
};

/**
 * Parse raw JSON from the backend into a typed SlideshowSettings.
 * Gracefully handles empty/malformed data by falling back to defaults.
 */
function parseSlideshowSettings(raw: unknown): SlideshowSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };

  const obj = raw as Record<string, unknown>;

  const enabledCategories = { ...DEFAULT_SETTINGS.enabledCategories };
  if (obj.enabledCategories && typeof obj.enabledCategories === 'object') {
    const ec = obj.enabledCategories as Record<string, unknown>;
    if (typeof ec.product === 'boolean') enabledCategories.product = ec.product;
    if (typeof ec.maker === 'boolean') enabledCategories.maker = ec.maker;
    if (typeof ec.craft === 'boolean') enabledCategories.craft = ec.craft;
  }

  let items: SlideshowSettings['items'] = [];
  if (Array.isArray(obj.items)) {
    items = obj.items
      .filter(
        (item): item is { id: string; kind: string; enabled: boolean } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).id === 'string' &&
          typeof (item as Record<string, unknown>).kind === 'string' &&
          typeof (item as Record<string, unknown>).enabled === 'boolean'
      )
      .map((item) => ({
        id: item.id,
        kind: item.kind as SlideshowSettings['items'][number]['kind'],
        enabled: item.enabled,
      }));
  }

  return { enabledCategories, items };
}

/**
 * Fetch the current slideshow settings from the backend.
 * Falls back to defaults if the backend returns empty data.
 */
export async function getSlideshowSettings(): Promise<SlideshowSettings> {
  try {
    const data = await apiGet<Record<string, unknown>>('/api/site-content/');
    return parseSlideshowSettings(data?.slideshowSettings);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save slideshow settings to the backend (admin-only).
 */
export async function updateSlideshowSettings(settings: SlideshowSettings): Promise<SlideshowSettings> {
  const token = getAdminToken();
  const data = await apiPut<Record<string, unknown>>(
    '/api/site-content/',
    { slideshowSettings: settings },
    token
  );
  return parseSlideshowSettings(data?.slideshowSettings);
}

/**
 * Safe variant for public pages — returns defaults on failure.
 */
export async function getSlideshowSettingsSafe(): Promise<SlideshowSettings> {
  try {
    return await getSlideshowSettings();
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
