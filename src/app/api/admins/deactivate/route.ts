import { NextRequest, NextResponse } from 'next/server';
import { deactivateAdmin } from '@/services/admins';
import { validateAdminSession } from '@/services/auth';

export async function POST(request: NextRequest) {
  // Derive requester from validated session
  const { id, token } = await request.json();

  if (!token) {
    return NextResponse.json(null, { status: 401 });
  }

  const sessionAdmin = await validateAdminSession(token);
  if (!sessionAdmin) {
    return NextResponse.json(null, { status: 401 });
  }

  const result = await deactivateAdmin(id, sessionAdmin.id);
  return NextResponse.json(result);
}
