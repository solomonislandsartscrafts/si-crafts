import { sql } from '@/lib/db';
import type { Stockist, AdminUser } from '@/types';

export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
  lockedUntil?: string;
}

function generateToken(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// --- Stockist Auth ---

export async function loginStockist(email: string, password: string): Promise<AuthResult> {
  const rows = await sql`
    SELECT id, business_name, abn, contact_name, email, phone, description, status, password_hash,
           created_at, updated_at
    FROM stockists
    WHERE email = ${email}
  `;

  const stockist = rows[0];
  if (!stockist || stockist.password_hash !== password || stockist.status !== 'approved') {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

  await sql`
    INSERT INTO sessions (token, user_id, user_type, expires_at)
    VALUES (${token}, ${stockist.id}, 'stockist', ${expiresAt.toISOString()})
  `;

  return { success: true, sessionToken: token };
}

export async function logoutStockist(sessionToken: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
}

export async function validateStockistSession(sessionToken: string): Promise<Stockist | null> {
  const sessionRows = await sql`
    SELECT user_id, expires_at FROM sessions
    WHERE token = ${sessionToken} AND user_type = 'stockist'
  `;

  const session = sessionRows[0];
  if (!session || new Date(session.expires_at) < new Date()) {
    if (session) {
      await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
    }
    return null;
  }

  const rows = await sql`
    SELECT id, business_name, abn, contact_name, email, phone, description, status, password_hash,
           created_at, updated_at
    FROM stockists WHERE id = ${session.user_id}
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    businessName: row.business_name,
    abn: row.abn,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    description: row.description,
    status: row.status,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- Admin Auth ---

export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  const rows = await sql`
    SELECT id, name, email, role, password_hash, is_active,
           failed_login_attempts, locked_until, created_at, updated_at
    FROM admins WHERE email = ${email}
  `;

  const admin = rows[0];
  if (!admin || !admin.is_active) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Check lockout
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    return { success: false, error: 'Account temporarily locked', lockedUntil: admin.locked_until };
  }

  if (admin.password_hash !== password) {
    // Increment failed attempts
    const newAttempts = (admin.failed_login_attempts || 0) + 1;
    const lockedUntil = newAttempts >= 5
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      : null;

    await sql`
      UPDATE admins
      SET failed_login_attempts = ${newAttempts},
          locked_until = ${lockedUntil},
          updated_at = now()
      WHERE id = ${admin.id}
    `;
    return { success: false, error: 'Invalid email or password' };
  }

  // Reset failed attempts on success
  await sql`
    UPDATE admins
    SET failed_login_attempts = 0, locked_until = NULL, updated_at = now()
    WHERE id = ${admin.id}
  `;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

  await sql`
    INSERT INTO sessions (token, user_id, user_type, expires_at)
    VALUES (${token}, ${admin.id}, 'admin', ${expiresAt.toISOString()})
  `;

  return { success: true, sessionToken: token };
}

export async function logoutAdmin(sessionToken: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
}

export async function validateAdminSession(sessionToken: string): Promise<AdminUser | null> {
  const sessionRows = await sql`
    SELECT user_id, expires_at FROM sessions
    WHERE token = ${sessionToken} AND user_type = 'admin'
  `;

  const session = sessionRows[0];
  if (!session || new Date(session.expires_at) < new Date()) {
    if (session) {
      await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
    }
    return null;
  }

  const rows = await sql`
    SELECT id, name, email, role, password_hash, is_active,
           failed_login_attempts, locked_until, created_at, updated_at
    FROM admins WHERE id = ${session.user_id}
  `;

  const row = rows[0];
  if (!row || !row.is_active) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    isActive: row.is_active,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- Session Cleanup ---

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await sql`
    DELETE FROM sessions WHERE expires_at < now()
  `;
  return result.length ?? 0;
}
