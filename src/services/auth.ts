import { apiPost, apiGet } from '@/lib/api-client';
import type { Stockist, AdminUser } from '@/types';

export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
  lockedUntil?: string;
}

// --- Stockist Auth ---

export async function loginStockist(email: string, password: string): Promise<AuthResult> {
  try {
    const data = await apiPost<{ success: boolean; sessionToken: string; user: unknown }>('/api/auth/stockist/login/', { email, password });
    return { success: true, sessionToken: data.sessionToken };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid email or password';
    return { success: false, error: message };
  }
}

export async function logoutStockist(sessionToken: string): Promise<void> {
  try {
    await apiPost('/api/auth/stockist/logout/', { refresh: sessionToken }, sessionToken);
  } catch {
    // Ignore errors on logout
  }
}

export async function validateStockistSession(sessionToken: string): Promise<Stockist | null> {
  try {
    const data = await apiGet<{
      id: number;
      email: string;
      businessName: string;
      contactName: string;
    }>('/api/auth/stockist/verify/', sessionToken);
    return {
      id: String(data.id),
      businessName: data.businessName,
      abn: '',
      contactName: data.contactName,
      email: data.email,
      phone: '',
      description: '',
      status: 'approved',
      passwordHash: '',
      createdAt: '',
      updatedAt: '',
    };
  } catch {
    return null;
  }
}

// --- Admin Auth ---

export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  try {
    const data = await apiPost<{ success?: boolean; sessionToken?: string; error?: string }>('/api/auth/admin/login/', { email, password });
    if (data.success && data.sessionToken) {
      return { success: true, sessionToken: data.sessionToken };
    }
    return { success: false, error: data.error || 'Invalid email or password' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid email or password';
    if (message.includes('locked')) {
      return { success: false, error: message, lockedUntil: '' };
    }
    return { success: false, error: message };
  }
}

export async function logoutAdmin(sessionToken: string): Promise<void> {
  try {
    await apiPost('/api/auth/admin/logout/', { refresh: sessionToken }, sessionToken);
  } catch {
    // Ignore errors on logout
  }
}

export async function validateAdminSession(sessionToken: string): Promise<AdminUser | null> {
  try {
    const data = await apiGet<{
      id: number;
      email: string;
      name: string;
      role: string;
    }>('/api/auth/admin/verify/', sessionToken);
    return {
      id: String(data.id),
      name: data.name,
      email: data.email,
      role: data.role as AdminUser['role'],
      passwordHash: '',
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: '',
      updatedAt: '',
    };
  } catch {
    return null;
  }
}


