/**
 * A login account and whatever role it currently holds.
 *
 * Roles are not stored on the account — the backend derives them from the
 * profiles attached to it. An active admin profile makes someone an editor or
 * super admin, an approved stockist record makes them a stockist, and neither
 * makes them a plain user with no dashboard access.
 */

export type AccountRole = 'super_admin' | 'editor' | 'stockist' | 'user';

export interface AccountAdminProfile {
  id: string;
  role: 'super_admin' | 'editor';
  isActive: boolean;
  isLocked: boolean;
}

export interface AccountStockistProfile {
  id: string;
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
  status: string;
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  isActive: boolean;
  isSuperuser: boolean;
  hasPassword: boolean;
  adminProfile: AccountAdminProfile | null;
  stockist: AccountStockistProfile | null;
  dateJoined: string;
  lastLogin: string | null;
}

/** Stockist details an admin fills in when adding someone who never applied. */
/**
 * Stockist details supplied alongside an account. Every field is optional
 * because updates are partial: an absent field means "leave it alone", which is
 * not the same as an empty string meaning "clear it". The backend enforces that
 * businessName and contactName exist when a stockist record is first created.
 */
export interface StockistDetailsInput {
  businessName?: string;
  contactName?: string;
  abn?: string;
  phone?: string;
  description?: string;
}

export interface CreateAccountInput {
  name: string;
  email: string;
  role: AccountRole;
  /** Required for admin roles. Leave blank for a stockist to email them a link. */
  password?: string;
  stockist?: StockistDetailsInput;
}

export interface UpdateAccountInput {
  name?: string;
  email?: string;
  role?: AccountRole;
  password?: string;
  isActive?: boolean;
  stockist?: StockistDetailsInput;
}

export const ROLE_LABELS: Record<AccountRole, string> = {
  super_admin: 'Super Admin',
  editor: 'Editor',
  stockist: 'Stockist',
  user: 'No role',
};
