import { apiGet, apiPost, apiDelete, getAdminToken } from '@/lib/api-client';
import type { Stockist } from '@/types';

interface StockistResponse {
  id: number;
  business_name: string;
  abn: string;
  contact_name: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapStockist(raw: StockistResponse): Stockist {
  return {
    id: String(raw.id),
    businessName: raw.business_name,
    abn: raw.abn,
    contactName: raw.contact_name,
    email: raw.email,
    phone: raw.phone,
    description: raw.description,
    status: raw.status as Stockist['status'],
    passwordHash: '',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getStockistById(id: string): Promise<Stockist | null> {
  try {
    const token = getAdminToken();
    const raw = await apiGet<StockistResponse>(`/api/stockists/${id}/`, token);
    return mapStockist(raw);
  } catch {
    return null;
  }
}

export async function getStockistByEmail(email: string): Promise<Stockist | null> {
  const token = getAdminToken();
  const data = await apiGet<{ results: StockistResponse[] } | StockistResponse[]>(`/api/stockists/?email=${encodeURIComponent(email)}`, token);
  const items = Array.isArray(data) ? data : data.results ?? [];
  if (items.length === 0) return null;
  return mapStockist(items[0]);
}

export async function getAllStockists(token?: string): Promise<Stockist[]> {
  const authToken = token || getAdminToken();
  const data = await apiGet<{ results: StockistResponse[] } | StockistResponse[]>('/api/stockists/', authToken);
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map(mapStockist);
}

export interface StockistApplicationInput {
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
}

export async function createApplication(data: StockistApplicationInput): Promise<Stockist> {
  const raw = await apiPost<StockistResponse>('/api/stockists/apply/', {
    business_name: data.businessName,
    abn: data.abn,
    contact_name: data.contactName,
    email: data.email,
    phone: data.phone,
    description: data.description,
  });
  return mapStockist(raw);
}

export interface CreateStockistInput extends StockistApplicationInput {
  /** Leave blank to email the stockist a one-time link to set their own. */
  password?: string;
}

export interface CreateStockistResult {
  stockist: Stockist;
  message: string;
}

/** Admin creates an approved stockist directly, skipping the application flow. */
export async function createStockist(
  data: CreateStockistInput,
  token?: string
): Promise<CreateStockistResult> {
  const authToken = token || getAdminToken();
  const raw = await apiPost<StockistResponse & { message?: string }>(
    '/api/stockists/',
    {
      business_name: data.businessName,
      abn: data.abn,
      contact_name: data.contactName,
      email: data.email,
      phone: data.phone,
      description: data.description,
      status: 'approved',
      ...(data.password ? { password: data.password } : {}),
    },
    authToken
  );
  return { stockist: mapStockist(raw), message: raw.message || 'Stockist added.' };
}

export async function approveStockist(id: string, token?: string): Promise<Stockist | null> {
  const authToken = token || getAdminToken();
  const raw = await apiPost<StockistResponse>(`/api/stockists/${id}/approve/`, {}, authToken);
  return mapStockist(raw);
}

export async function rejectStockist(id: string, token?: string): Promise<Stockist | null> {
  const authToken = token || getAdminToken();
  const raw = await apiPost<StockistResponse>(`/api/stockists/${id}/reject/`, {}, authToken);
  return mapStockist(raw);
}

export async function suspendStockist(id: string, token?: string): Promise<Stockist | null> {
  const authToken = token || getAdminToken();
  const raw = await apiPost<StockistResponse>(`/api/stockists/${id}/suspend/`, {}, authToken);
  return mapStockist(raw);
}

export async function enableStockist(id: string, token?: string): Promise<Stockist | null> {
  const authToken = token || getAdminToken();
  const raw = await apiPost<StockistResponse>(`/api/stockists/${id}/enable/`, {}, authToken);
  return mapStockist(raw);
}

export async function deleteStockist(id: string, token?: string): Promise<boolean> {
  const authToken = token || getAdminToken();
  try {
    await apiDelete(`/api/stockists/${id}/`, authToken);
    return true;
  } catch {
    return false;
  }
}
