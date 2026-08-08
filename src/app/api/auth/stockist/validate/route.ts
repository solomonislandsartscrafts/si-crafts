import { NextRequest, NextResponse } from 'next/server';
import { validateStockistSession } from '@/services/auth';

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(null);
  }

  const stockist = await validateStockistSession(token);
  return NextResponse.json(stockist);
}
