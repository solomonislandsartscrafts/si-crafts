import type { AdminUser } from '@/types';

export const mockAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Alison Hart',
    email: 'alison@siac.org.au',
    role: 'super_admin',
    passwordHash: 'admin123',
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'James Kavo',
    email: 'james@siac.org.au',
    role: 'editor',
    passwordHash: 'editor123',
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];
