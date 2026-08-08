import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins } from '@/services/admins';
import { validateAdminSession } from '@/services/auth';
import { apiPost } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await validateAdminSession(token);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await getAllAdmins(token);
  // Strip passwordHash before sending to client
  const safe = admins.map(({ passwordHash, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await validateAdminSession(token);
  if (!admin || admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  try {
    const result = await apiPost('/api/auth/admins/', body, token);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create admin';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
