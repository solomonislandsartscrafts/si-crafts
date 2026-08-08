import { NextRequest, NextResponse } from 'next/server';
import { logoutAdmin } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (token) {
    await logoutAdmin(token);
  }
  return NextResponse.json({ success: true });
}
