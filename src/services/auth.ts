import { getStockistByEmail, getStockistById } from './stockists';
import { getAdminByEmail, getAdminById, incrementFailedLogin, resetFailedLogin } from './admins';
import type { Stockist, AdminUser } from '@/types';

export interface AuthResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
  lockedUntil?: string;
}

/**
 * Mock auth — sessions stored in localStorage as JSON so they persist
 * across page navigations in the browser. In production this would be
 * HTTP-only cookies validated at the edge.
 */

interface SessionData {
  userId: string;
  type: 'stockist' | 'admin';
  expiresAt: number;
}

const SESSIONS_KEY = 'si_crafts_sessions';

function getSessions(): Record<string, SessionData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSessions(sessions: Record<string, SessionData>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function generateToken(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// --- Stockist Auth ---

export async function loginStockist(email: string, password: string): Promise<AuthResult> {
  const stockist = await getStockistByEmail(email);

  if (!stockist || stockist.passwordHash !== password || stockist.status !== 'approved') {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = generateToken();
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  const sessions = getSessions();
  sessions[token] = { userId: stockist.id, type: 'stockist', expiresAt };
  saveSessions(sessions);

  return { success: true, sessionToken: token };
}

export async function logoutStockist(sessionToken: string): Promise<void> {
  const sessions = getSessions();
  delete sessions[sessionToken];
  saveSessions(sessions);
}

export async function validateStockistSession(sessionToken: string): Promise<Stockist | null> {
  const sessions = getSessions();
  const session = sessions[sessionToken];
  if (!session || session.type !== 'stockist' || session.expiresAt < Date.now()) {
    if (session) {
      delete sessions[sessionToken];
      saveSessions(sessions);
    }
    return null;
  }
  return getStockistById(session.userId);
}

// --- Admin Auth ---

export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  const admin = await getAdminByEmail(email);

  if (!admin || !admin.isActive) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Check lockout
  if (admin.lockedUntil && new Date(admin.lockedUntil).getTime() > Date.now()) {
    return { success: false, error: 'Account temporarily locked', lockedUntil: admin.lockedUntil };
  }

  if (admin.passwordHash !== password) {
    await incrementFailedLogin(admin.id);
    return { success: false, error: 'Invalid email or password' };
  }

  await resetFailedLogin(admin.id);

  const token = generateToken();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 60 minutes
  const sessions = getSessions();
  sessions[token] = { userId: admin.id, type: 'admin', expiresAt };
  saveSessions(sessions);

  return { success: true, sessionToken: token };
}

export async function logoutAdmin(sessionToken: string): Promise<void> {
  const sessions = getSessions();
  delete sessions[sessionToken];
  saveSessions(sessions);
}

export async function validateAdminSession(sessionToken: string): Promise<AdminUser | null> {
  const sessions = getSessions();
  const session = sessions[sessionToken];
  if (!session || session.type !== 'admin' || session.expiresAt < Date.now()) {
    if (session) {
      delete sessions[sessionToken];
      saveSessions(sessions);
    }
    return null;
  }
  return getAdminById(session.userId);
}
