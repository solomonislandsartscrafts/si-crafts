import { sql } from '@/lib/db';
import type { AdminUser, AdminRole } from '@/types';

function rowToAdmin(row: Record<string, unknown>): AdminUser {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as AdminRole,
    passwordHash: row.password_hash as string,
    isActive: row.is_active as boolean,
    failedLoginAttempts: row.failed_login_attempts as number,
    lockedUntil: row.locked_until as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const rows = await sql`
    SELECT id, name, email, role, password_hash, is_active,
           failed_login_attempts, locked_until, created_at, updated_at
    FROM admins WHERE id = ${id}
  `;
  return rows[0] ? rowToAdmin(rows[0]) : null;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const rows = await sql`
    SELECT id, name, email, role, password_hash, is_active,
           failed_login_attempts, locked_until, created_at, updated_at
    FROM admins WHERE email = ${email}
  `;
  return rows[0] ? rowToAdmin(rows[0]) : null;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const rows = await sql`
    SELECT id, name, email, role, password_hash, is_active,
           failed_login_attempts, locked_until, created_at, updated_at
    FROM admins ORDER BY created_at ASC
  `;
  return rows.map(rowToAdmin);
}

export interface CreateAdminInput {
  name: string;
  email: string;
  role: AdminRole;
  passwordHash: string;
}

export async function createAdmin(data: CreateAdminInput): Promise<AdminUser> {
  const rows = await sql`
    INSERT INTO admins (name, email, role, password_hash)
    VALUES (${data.name}, ${data.email}, ${data.role}, ${data.passwordHash})
    RETURNING id, name, email, role, password_hash, is_active,
              failed_login_attempts, locked_until, created_at, updated_at
  `;
  return rowToAdmin(rows[0]);
}

export async function updateAdmin(id: string, data: Partial<AdminUser>): Promise<AdminUser | null> {
  const existing = await getAdminById(id);
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const email = data.email ?? existing.email;
  const role = data.role ?? existing.role;
  const isActive = data.isActive ?? existing.isActive;
  const passwordHash = data.passwordHash ?? existing.passwordHash;

  const rows = await sql`
    UPDATE admins
    SET name = ${name}, email = ${email}, role = ${role},
        is_active = ${isActive}, password_hash = ${passwordHash}, updated_at = now()
    WHERE id = ${id}
    RETURNING id, name, email, role, password_hash, is_active,
              failed_login_attempts, locked_until, created_at, updated_at
  `;
  return rows[0] ? rowToAdmin(rows[0]) : null;
}

export async function deactivateAdmin(id: string, requestingAdminId: string): Promise<AdminUser | null> {
  // Cannot deactivate yourself
  if (id === requestingAdminId) return null;

  // Verify requesting admin exists, is active, and has super_admin role
  const requester = await getAdminById(requestingAdminId);
  if (!requester || !requester.isActive || requester.role !== 'super_admin') return null;

  // Cannot deactivate if it would leave zero active super_admins
  const target = await getAdminById(id);
  if (!target) return null;

  if (target.role === 'super_admin') {
    const countRows = await sql`
      SELECT COUNT(*) as cnt FROM admins
      WHERE role = 'super_admin' AND is_active = true AND id != ${id}
    `;
    if (Number(countRows[0].cnt) === 0) return null;
  }

  return updateAdmin(id, { isActive: false });
}

export async function incrementFailedLogin(id: string): Promise<void> {
  const admin = await getAdminById(id);
  if (!admin) return;

  const newAttempts = admin.failedLoginAttempts + 1;
  const lockedUntil = newAttempts >= 5
    ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
    : null;

  await sql`
    UPDATE admins
    SET failed_login_attempts = ${newAttempts},
        locked_until = ${lockedUntil},
        updated_at = now()
    WHERE id = ${id}
  `;
}

export async function resetFailedLogin(id: string): Promise<void> {
  await sql`
    UPDATE admins
    SET failed_login_attempts = 0, locked_until = NULL, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function lockAccount(id: string, until: string): Promise<void> {
  await sql`
    UPDATE admins SET locked_until = ${until}, updated_at = now()
    WHERE id = ${id}
  `;
}
