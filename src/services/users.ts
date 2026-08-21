/**
 * Account management service — the one place that talks to the accounts API.
 *
 * Covers every kind of login: super admins, editors, stockists, and users with
 * no role yet. Role changes go through `updateUser` too, because on the backend
 * a role is just which profiles are attached to the account.
 */

import { apiGet, apiPost, apiPatch, apiFetch, getAdminToken } from '@/lib/api-client';
import type {
  AccountUser,
  CreateAccountInput,
  StockistDetailsInput,
  UpdateAccountInput,
} from '@/types';

interface AccountResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  has_password: boolean;
  admin_profile: { id: number; role: string; is_active: boolean; is_locked: boolean } | null;
  stockist: {
    id: number;
    business_name: string;
    abn: string;
    contact_name: string;
    email: string;
    phone: string;
    description: string;
    status: string;
  } | null;
  date_joined: string;
  last_login: string | null;
  message?: string;
}

const ACCOUNT_ROLES: readonly AccountUser['role'][] = [
  'super_admin',
  'editor',
  'stockist',
  'user',
];

/**
 * The wire gives us a plain string. `ROLE_ICONS[role]` is rendered as a
 * component and `ROLE_BADGE[role]` as a variant, so an unrecognised value would
 * render `undefined` as a JSX element and crash the Accounts page. Fall back to
 * the least-privileged role instead.
 */
function toAccountRole(value: string): AccountUser['role'] {
  const match = ACCOUNT_ROLES.find((role) => role === value);
  if (!match) {
    console.warn(`[users] Unknown role "${value}" from the backend — treating as "user".`);
    return 'user';
  }
  return match;
}

function mapUser(raw: AccountResponse): AccountUser {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    role: toAccountRole(raw.role),
    isActive: raw.is_active,
    isSuperuser: raw.is_superuser,
    hasPassword: raw.has_password,
    adminProfile: raw.admin_profile
      ? {
          id: String(raw.admin_profile.id),
          role: raw.admin_profile.role as 'super_admin' | 'editor',
          isActive: raw.admin_profile.is_active,
          isLocked: raw.admin_profile.is_locked,
        }
      : null,
    stockist: raw.stockist
      ? {
          id: String(raw.stockist.id),
          businessName: raw.stockist.business_name,
          abn: raw.stockist.abn,
          contactName: raw.stockist.contact_name,
          email: raw.stockist.email,
          phone: raw.stockist.phone,
          description: raw.stockist.description,
          status: raw.stockist.status,
        }
      : null,
    dateJoined: raw.date_joined,
    lastLogin: raw.last_login,
  };
}

/**
 * Stockist details use camelCase in the app and snake_case over the wire.
 *
 * Fields the caller didn't supply are omitted rather than sent as ''. The
 * backend assigns any key it receives, so defaulting to '' turned a partial
 * update of one field into a blanking of all the others.
 */
function stockistPayload(details?: StockistDetailsInput) {
  if (!details) return undefined;

  const wireKeys: Array<[keyof StockistDetailsInput, string]> = [
    ['businessName', 'business_name'],
    ['contactName', 'contact_name'],
    ['abn', 'abn'],
    ['phone', 'phone'],
    ['description', 'description'],
  ];

  const payload: Record<string, string> = {};
  for (const [appKey, wireKey] of wireKeys) {
    const value = details[appKey];
    if (value !== undefined) payload[wireKey] = value;
  }
  return payload;
}

export interface UserResult {
  user: AccountUser;
  message: string;
}

export interface GetUsersOptions {
  role?: string;
  search?: string;
}

/** Stop following pages eventually, so a bad `next` can't spin forever. */
const MAX_PAGES = 50;

/**
 * Every account matching the filters, across all pages.
 *
 * The endpoint paginates at the project default of 50. The Accounts screen
 * shows one flat list and filters on the server, so it needs the whole result
 * set — reading only the first page silently hid the 51st account onwards.
 */
export async function getAllUsers(
  options: GetUsersOptions = {},
  token?: string
): Promise<AccountUser[]> {
  const authToken = token || getAdminToken();
  const items: AccountResponse[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const query = new URLSearchParams();
    if (options.role) query.set('role', options.role);
    if (options.search) query.set('search', options.search);
    if (page > 1) query.set('page', String(page));
    const suffix = query.toString() ? `?${query.toString()}` : '';

    const data = await apiGet<
      AccountResponse[] | { results: AccountResponse[]; next: string | null }
    >(`/api/auth/users/${suffix}`, authToken);

    // An unpaginated response (or the unreachable-backend fallback) is a
    // complete answer on its own.
    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }

    items.push(...(data.results ?? []));
    if (!data.next) break;
  }

  return items.map(mapUser);
}

export async function getUser(id: string, token?: string): Promise<AccountUser | null> {
  const authToken = token || getAdminToken();
  try {
    const raw = await apiGet<AccountResponse>(`/api/auth/users/${id}/`, authToken);
    return mapUser(raw);
  } catch {
    return null;
  }
}

export async function createUser(
  data: CreateAccountInput,
  token?: string
): Promise<UserResult> {
  const authToken = token || getAdminToken();
  const raw = await apiPost<AccountResponse>(
    '/api/auth/users/',
    {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { password: data.password } : {}),
      ...(data.stockist ? { stockist: stockistPayload(data.stockist) } : {}),
    },
    authToken
  );
  return { user: mapUser(raw), message: raw.message || 'Account created.' };
}

export async function updateUser(
  id: string,
  data: UpdateAccountInput,
  token?: string
): Promise<UserResult> {
  const authToken = token || getAdminToken();
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name;
  if (data.email !== undefined) body.email = data.email;
  if (data.role !== undefined) body.role = data.role;
  if (data.isActive !== undefined) body.is_active = data.isActive;
  if (data.password) body.password = data.password;
  if (data.stockist) body.stockist = stockistPayload(data.stockist);

  const raw = await apiPatch<AccountResponse>(`/api/auth/users/${id}/`, body, authToken);
  return { user: mapUser(raw), message: raw.message || 'Changes saved.' };
}

export async function deleteUser(id: string, token?: string): Promise<string> {
  const authToken = token || getAdminToken();
  // Not apiDelete: this endpoint answers 200 with a message worth showing.
  const res = await apiFetch<{ message?: string } | undefined>(`/api/auth/users/${id}/`, {
    method: 'DELETE',
    token: authToken,
  });
  return res?.message || 'Account deleted.';
}

/** Email a stockist a fresh one-time link to set their own password. */
export async function sendPasswordLink(id: string, token?: string): Promise<string> {
  const authToken = token || getAdminToken();
  const res = await apiPost<{ message?: string }>(
    `/api/auth/users/${id}/send-password-link/`,
    {},
    authToken
  );
  return res.message || 'Password setup email sent.';
}
