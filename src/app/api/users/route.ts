import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '@/services/users';
import { authenticateSuperAdmin } from '@/lib/api-auth';
import { ApiError } from '@/lib/api-client';
import type { AccountRole, StockistDetailsInput } from '@/types';

const ROLES: AccountRole[] = ['super_admin', 'editor', 'stockist', 'user'];

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

const STOCKIST_KEYS = [
  'businessName',
  'contactName',
  'abn',
  'phone',
  'description',
] as const;

/**
 * Only carry through the keys the client actually sent. Reading every key
 * unconditionally turned each absent field into '', which the backend then
 * assigned — so patching a phone number wiped the business name.
 */
function readStockist(value: unknown): StockistDetailsInput | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;

  const details: StockistDetailsInput = {};
  for (const key of STOCKIST_KEYS) {
    if (key in raw) details[key] = str(raw[key]);
  }
  return details;
}

/**
 * Carry the backend's status through instead of flattening everything to 400.
 *
 * A 404 for a missing account, a 502 for a mail failure and a 401 for an expired
 * token all used to arrive at the Accounts page as "400 validation error", which
 * made a dead session look like bad input. 400 remains the fallback for genuine
 * validation problems and for errors that carry no status.
 */
function fail(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : fallback;

  // status 0 is the client's own "backend unreachable"/"not configured" marker,
  // which is not a status we can return.
  const status =
    err instanceof ApiError && err.status >= 400 && err.status <= 599
      ? err.status
      : 400;

  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const role = request.nextUrl.searchParams.get('role') ?? '';
  const search = request.nextUrl.searchParams.get('search') ?? '';

  try {
    const users = await getAllUsers({ role, search }, auth.token);
    return NextResponse.json(users);
  } catch (err) {
    return fail(err, 'Failed to load users.');
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = str(body.email);
  const role = str(body.role) as AccountRole;

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: 'Choose a valid role.' }, { status: 400 });
  }

  const stockist = readStockist(body.stockist);
  if (role === 'stockist' && !stockist?.businessName) {
    return NextResponse.json(
      { error: 'Business name is required for a stockist.' },
      { status: 400 }
    );
  }

  try {
    const result = await createUser(
      {
        name: str(body.name),
        email,
        role,
        password: str(body.password) || undefined,
        stockist: role === 'stockist' ? stockist : undefined,
      },
      auth.token
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return fail(err, 'Failed to create account.');
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const id = str(body.id);
  if (!id) {
    return NextResponse.json({ error: 'User id is required.' }, { status: 400 });
  }

  const role = str(body.role);
  if (role && !ROLES.includes(role as AccountRole)) {
    return NextResponse.json({ error: 'Choose a valid role.' }, { status: 400 });
  }

  const stockist = readStockist(body.stockist);
  if (role === 'stockist' && stockist && !stockist.businessName) {
    return NextResponse.json(
      { error: 'Business name is required for a stockist.' },
      { status: 400 }
    );
  }

  try {
    const result = await updateUser(
      id,
      {
        ...(body.name !== undefined ? { name: str(body.name) } : {}),
        ...(body.email !== undefined ? { email: str(body.email) } : {}),
        ...(role ? { role: role as AccountRole } : {}),
        ...(body.password ? { password: str(body.password) } : {}),
        ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
        ...(stockist ? { stockist } : {}),
      },
      auth.token
    );
    return NextResponse.json(result);
  } catch (err) {
    return fail(err, 'Failed to update account.');
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const id = str((body as Record<string, unknown> | null)?.id);
  if (!id) {
    return NextResponse.json({ error: 'User id is required.' }, { status: 400 });
  }

  try {
    const message = await deleteUser(id, auth.token);
    return NextResponse.json({ success: true, message });
  } catch (err) {
    return fail(err, 'Failed to delete account.');
  }
}
