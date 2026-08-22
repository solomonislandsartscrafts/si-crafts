import { apiGet, apiGetPublic, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Supporter } from '@/types';

interface ApiSupporter {
  id: number;
  name: string;
  logo_url: string;
  logo_alt: string;
  href: string;
  sort_order: number;
}

function mapSupporter(raw: ApiSupporter): Supporter {
  return {
    id: String(raw.id),
    name: raw.name,
    logoUrl: raw.logo_url || '',
    logoAlt: raw.logo_alt || '',
    href: raw.href || '',
    sortOrder: raw.sort_order,
  };
}

function toList(data: ApiSupporter[] | { results: ApiSupporter[] }): Supporter[] {
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list.map(mapSupporter);
}

function toBody(data: Partial<Omit<Supporter, 'id'>>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.logoUrl !== undefined) body.logo_url = data.logoUrl;
  if (data.logoAlt !== undefined) body.logo_alt = data.logoAlt;
  if (data.href !== undefined) body.href = data.href;
  if (data.sortOrder !== undefined) body.sort_order = data.sortOrder;
  return body;
}

// --- Public ---

export async function getSupporters(): Promise<Supporter[]> {
  return toList(
    await apiGetPublic<ApiSupporter[] | { results: ApiSupporter[] }>('/api/supporters/')
  );
}

/**
 * The confirmed supporter, bundled with the front end.
 *
 * `/api/supporters/` is newer than the deployed backend, so it currently answers
 * 404 and the homepage credit disappeared with it. This stands in whenever the
 * API has nothing to give, and is replaced outright the moment the API returns
 * even one supporter — so adding SICA under Admin → Supporters does not produce
 * a duplicate.
 *
 * Only confirmed supporters belong here. An earlier version padded the band out
 * to four entries by repeating this one logo under "Sponsor 2", "Sponsor 3" and
 * "Sponsor 4", claiming backing that did not exist.
 */
const BUNDLED_SUPPORTERS: Supporter[] = [
  {
    id: 'sica',
    name: 'SICA',
    logoUrl: '/images/sica logo.png',
    // The name is the accessible name, and the artwork is a wordmark saying the
    // same thing, so a separate alt would only repeat it.
    logoAlt: '',
    href: '',
    sortOrder: 0,
  },
];

/**
 * Safe variant for the homepage banner. Falls back to the bundled supporter when
 * the API is unreachable or has no supporters recorded yet.
 */
export async function getSupportersSafe(): Promise<Supporter[]> {
  try {
    const supporters = await getSupporters();
    return supporters.length > 0 ? supporters : BUNDLED_SUPPORTERS;
  } catch {
    return BUNDLED_SUPPORTERS;
  }
}

// --- Admin ---

export async function getSupportersForAdmin(): Promise<Supporter[]> {
  return toList(await apiGet<ApiSupporter[] | { results: ApiSupporter[] }>('/api/supporters/'));
}

export async function createSupporter(data: Omit<Supporter, 'id'>): Promise<Supporter> {
  const raw = await apiPost<ApiSupporter>('/api/supporters/', toBody(data), getAdminToken());
  return mapSupporter(raw);
}

export async function updateSupporter(
  id: string,
  data: Partial<Omit<Supporter, 'id'>>
): Promise<Supporter> {
  const raw = await apiPatch<ApiSupporter>(
    `/api/supporters/${id}/`,
    toBody(data),
    getAdminToken()
  );
  return mapSupporter(raw);
}

export async function deleteSupporter(id: string): Promise<void> {
  await apiDelete(`/api/supporters/${id}/`, getAdminToken());
}
