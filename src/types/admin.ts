export type AdminRole = 'super_admin' | 'editor';

export interface AdminUser {
  id: string;
  /** The underlying login account id. Absent on session-derived objects. */
  userId?: string;
  name: string;
  email: string;
  role: AdminRole;
  passwordHash: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
