import { apiGet, apiPost, getAdminToken } from '@/lib/api-client';
import type { AdminUser, AdminRole } from '@/types';

interface AdminResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapAdmin(raw: AdminResponse): AdminUser {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    role: raw.role as AdminRole,
    passwordHash: '',
    isActive: raw.is_active,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  // Not directly available via list endpoint — use verify endpoint or filter
  const admins = await getAllAdmins();
  return admins.find((a) => a.id === id) ?? null;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const admins = await getAllAdmins();
  return admins.find((a) => a.email === email) ?? null;
}

export async function getAllAdmins(token?: string): Promise<AdminUser[]> {
  const authToken = token || getAdminToken();
  const data = await apiGet<AdminResponse[] | { results: AdminResponse[] }>('/api/auth/admins/', authToken);
  const items = Array.isArray(data) ? data : data.results ?? [];
  return items.map(mapAdmin);
}

export interface CreateAdminInput {
  name: string;
  email: string;
  role: AdminRole;
  passwordHash: string;
}

export async function createAdmin(data: CreateAdminInput): Promise<AdminUser> {
  const token = getAdminToken();
  const raw = await apiPost<AdminResponse>('/api/auth/admins/', {
    name: data.name,
    email: data.email,
    role: data.role,
    password: data.passwordHash, // Backend expects 'password' field
  }, token);
  return mapAdmin(raw);
}

export async function updateAdmin(id: string, data: Partial<AdminUser>): Promise<AdminUser | null> {
  // Admin updates go through the list endpoint — simplified for now
  const admins = await getAllAdmins();
  return admins.find((a) => a.id === id) ?? null;
}

export async function deactivateAdmin(id: string, requestingAdminId: string): Promise<AdminUser | null> {
  if (id === requestingAdminId) return null;
  // Deactivation handled via backend admin interface
  return updateAdmin(id, { isActive: false });
}


