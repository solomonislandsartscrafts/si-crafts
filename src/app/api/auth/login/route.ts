import { NextRequest, NextResponse } from 'next/server';
import { loginStockist, loginAdmin } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
  }

  try {
    // Try admin first
    const adminResult = await loginAdmin(email, password);
    if (adminResult.success) {
      return NextResponse.json({ ...adminResult, userType: 'admin' });
    }

    // If admin failed because account doesn't exist (not locked), try stockist
    if (!adminResult.lockedUntil) {
      const stockistResult = await loginStockist(email, password);
      if (stockistResult.success) {
        return NextResponse.json({ ...stockistResult, userType: 'stockist' });
      }
    }

    // Both failed
    return NextResponse.json({
      success: false,
      error: adminResult.lockedUntil ? 'Account temporarily locked. Try again later.' : 'Invalid email or password',
      lockedUntil: adminResult.lockedUntil,
    });
  } catch (err) {
    console.error('[auth/login] Error:', err);
    return NextResponse.json({ success: false, error: 'Server error. Please try again.' }, { status: 500 });
  }
}
