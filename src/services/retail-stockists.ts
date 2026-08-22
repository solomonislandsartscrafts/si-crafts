import { apiGet, apiGetPublic, apiPost, apiPatch, apiDelete, getAdminToken } from '@/lib/api-client';
import type { RetailStockist } from '@/types';

interface ApiRetailStockist {
  id: number;
  name: string;
  city: string;
  url: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  closed: string;
  sort_order: number;
}

function mapRetailStockist(raw: ApiRetailStockist): RetailStockist {
  return {
    id: String(raw.id),
    name: raw.name,
    city: raw.city || '',
    url: raw.url || '',
    address: raw.address || '',
    phone: raw.phone || '',
    email: raw.email || '',
    hours: raw.hours || '',
    closed: raw.closed || '',
    sortOrder: raw.sort_order,
  };
}

function toList(data: ApiRetailStockist[] | { results: ApiRetailStockist[] }): RetailStockist[] {
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list.map(mapRetailStockist);
}

function toBody(data: Partial<Omit<RetailStockist, 'id'>>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.city !== undefined) body.city = data.city;
  if (data.url !== undefined) body.url = data.url;
  if (data.address !== undefined) body.address = data.address;
  if (data.phone !== undefined) body.phone = data.phone;
  if (data.email !== undefined) body.email = data.email;
  if (data.hours !== undefined) body.hours = data.hours;
  if (data.closed !== undefined) body.closed = data.closed;
  if (data.sortOrder !== undefined) body.sort_order = data.sortOrder;
  return body;
}

// --- Public ---

/** Cached read for the public Stockists page. */
export async function getRetailStockists(): Promise<RetailStockist[]> {
  return toList(
    await apiGetPublic<ApiRetailStockist[] | { results: ApiRetailStockist[] }>(
      '/api/retail-stockists/'
    )
  );
}

/** Safe variant — an unreachable backend renders the empty state rather than failing the page. */
export async function getRetailStockistsSafe(): Promise<RetailStockist[]> {
  try {
    return await getRetailStockists();
  } catch {
    return [];
  }
}

// --- Admin ---

/** Un-cached read for the admin screen. */
export async function getRetailStockistsForAdmin(): Promise<RetailStockist[]> {
  return toList(
    await apiGet<ApiRetailStockist[] | { results: ApiRetailStockist[] }>('/api/retail-stockists/')
  );
}

export async function createRetailStockist(
  data: Omit<RetailStockist, 'id'>
): Promise<RetailStockist> {
  const raw = await apiPost<ApiRetailStockist>(
    '/api/retail-stockists/',
    toBody(data),
    getAdminToken()
  );
  return mapRetailStockist(raw);
}

export async function updateRetailStockist(
  id: string,
  data: Partial<Omit<RetailStockist, 'id'>>
): Promise<RetailStockist> {
  const raw = await apiPatch<ApiRetailStockist>(
    `/api/retail-stockists/${id}/`,
    toBody(data),
    getAdminToken()
  );
  return mapRetailStockist(raw);
}

export async function deleteRetailStockist(id: string): Promise<void> {
  await apiDelete(`/api/retail-stockists/${id}/`, getAdminToken());
}
