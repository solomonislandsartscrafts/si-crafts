import type { NextRequest } from 'next/server';
import { validateAdminSession } from '@/services/auth';

/**
 * Auth guard for account-management API routes.
 *
 * Account management is super-admin only, so a valid session is not enough —
 * the role has to be checked too. Shared so every route under /api/users
 * enforces the same rule; it used to be copy-pasted per route, which is exactly
 * how one copy ends up drifting.
 *
 * Returns null when the caller is unauthenticated or not a super admin. Callers
 * respond 403 on null.
 */
export async function authenticateSuperAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  if (!token) return null;

  const admin = await validateAdminSession(token);
  if (!admin || admin.role !== 'super_admin') return null;

  return { admin, token };
}
