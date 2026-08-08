import { NextRequest, NextResponse } from 'next/server';
import { logoutStockist } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (token) {
    await logoutStockist(token);
  }
  return NextResponse.json({ success: true });
}
