import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(null);
  }

  const admin = await validateAdminSession(token);
  return NextResponse.json(admin);
}
