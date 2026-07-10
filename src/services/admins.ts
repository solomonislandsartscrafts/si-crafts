import { mockAdmins } from '@/data/mock';
import type { AdminUser, AdminRole } from '@/types';

const delay = () => new Promise((r) => setTimeout(r, 0));

export async function getAdminById(id: string): Promise<AdminUser | null> {
  await delay();
  return mockAdmins.find((a) => a.id === id) ?? null;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  await delay();
  return mockAdmins.find((a) => a.email === email) ?? null;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  await delay();
  return [...mockAdmins];
}

export interface CreateAdminInput {
  name: string;
  email: string;
  role: AdminRole;
  passwordHash: string;
}

export async function createAdmin(data: CreateAdminInput): Promise<AdminUser> {
  await delay();
  const admin: AdminUser = {
    ...data,
    id: `admin-${Date.now()}`,
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAdmins.push(admin);
  return admin;
}

export async function updateAdmin(id: string, data: Partial<AdminUser>): Promise<AdminUser | null> {
  await delay();
  const index = mockAdmins.findIndex((a) => a.id === id);
  if (index === -1) return null;
  mockAdmins[index] = { ...mockAdmins[index], ...data, updatedAt: new Date().toISOString() };
  return mockAdmins[index];
}

export async function deactivateAdmin(id: string, requestingAdminId: string): Promise<AdminUser | null> {
  await delay();
  // Cannot deactivate yourself
  if (id === requestingAdminId) return null;

  // Cannot deactivate if it would leave zero active super_admins
  const activeSuperAdmins = mockAdmins.filter(
    (a) => a.role === 'super_admin' && a.isActive && a.id !== id
  );
  const target = mockAdmins.find((a) => a.id === id);
  if (target?.role === 'super_admin' && activeSuperAdmins.length === 0) return null;

  return updateAdmin(id, { isActive: false });
}

export async function incrementFailedLogin(id: string): Promise<void> {
  await delay();
  const admin = mockAdmins.find((a) => a.id === id);
  if (admin) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) {
      admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
  }
}

export async function resetFailedLogin(id: string): Promise<void> {
  await delay();
  const admin = mockAdmins.find((a) => a.id === id);
  if (admin) {
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
  }
}

export async function lockAccount(id: string, until: string): Promise<void> {
  await delay();
  const admin = mockAdmins.find((a) => a.id === id);
  if (admin) {
    admin.lockedUntil = until;
  }
}
