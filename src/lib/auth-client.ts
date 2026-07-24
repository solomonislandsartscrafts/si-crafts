/**
 * Client-side auth helpers that call server API routes.
 * Use these in 'use client' components instead of importing from @/services/auth directly.
 */

import type { Stockist, AdminUser } from '@/types';

export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
  lockedUntil?: string;
}

// --- Stockist ---

export async function loginStockist(email: string, password: string): Promise<AuthResult> {
  const res = await fetch('/api/auth/stockist/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function validateStockistSession(token: string): Promise<Stockist | null> {
  const res = await fetch('/api/auth/stockist/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return res.json();
}

// --- Admin ---

export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function validateAdminSession(token: string): Promise<AdminUser | null> {
  const res = await fetch('/api/auth/admin/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  return res.json();
}
