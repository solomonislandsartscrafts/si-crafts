import { NextRequest, NextResponse } from 'next/server';
import { loginStockist } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
  }

  const result = await loginStockist(email, password);
  return NextResponse.json(result);
}
