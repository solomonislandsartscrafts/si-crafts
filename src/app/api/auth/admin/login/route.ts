import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const result = await loginAdmin(email, password);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin/login] Error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
