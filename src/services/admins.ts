import { apiGet, apiPost, apiPatch, getAdminToken } from '@/lib/api-client';
import type { AdminUser, AdminRole } from '@/types';

interface AdminResponse {
  id: number;
  user_id?: number;
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
    userId: raw.user_id !== undefined ? String(raw.user_id) : undefined,
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

/**
 * Update an admin.
 *
 * Admin profiles are edited through the accounts endpoint, because name, email
 * and password live on the login account rather than the profile. `id` is the
 * admin profile id, so the matching account id is looked up first.
 */
export async function updateAdmin(
  id: string,
  data: Partial<AdminUser>,
  token?: string
): Promise<AdminUser | null> {
  const authToken = token || getAdminToken();
  const admins = await getAllAdmins(authToken);
  const target = admins.find((a) => a.id === id);
  if (!target?.userId) return null;

  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.email !== undefined) body.email = data.email;
  // Removing admin access means dropping the role, not disabling the login.
  if (data.isActive === false) body.role = 'user';
  else if (data.role !== undefined) body.role = data.role;

  if (Object.keys(body).length === 0) return target;

  try {
    await apiPatch(`/api/auth/users/${target.userId}/`, body, authToken);
  } catch (err) {
    // Returning null tells the caller "couldn't update", but swallowing the
    // error left no way to tell a permission problem from an unreachable
    // backend. Keep the same return, log the reason.
    console.error(`[admins] Failed to update admin ${id}:`, err);
    return null;
  }

  const refreshed = await getAllAdmins(authToken);
  return refreshed.find((a) => a.id === id) ?? { ...target, ...data };
}

export async function deactivateAdmin(
  id: string,
  requestingAdminId: string,
  token?: string
): Promise<AdminUser | null> {
  if (id === requestingAdminId) return null;
  return updateAdmin(id, { isActive: false }, token);
}


