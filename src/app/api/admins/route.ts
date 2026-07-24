import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins } from '@/services/admins';
import { validateAdminSession } from '@/services/auth';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await validateAdminSession(token);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await getAllAdmins();
  // Strip passwordHash before sending to client
  const safe = admins.map(({ passwordHash, ...rest }) => rest);
  return NextResponse.json(safe);
}
