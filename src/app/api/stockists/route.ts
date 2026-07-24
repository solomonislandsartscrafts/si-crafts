import { NextRequest, NextResponse } from 'next/server';
import { getAllStockists, approveStockist, rejectStockist } from '@/services/stockists';
import { validateAdminSession } from '@/services/auth';

async function authenticateAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  if (!token) return null;
  return validateAdminSession(token);
}

export async function GET(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stockists = await getAllStockists();
  return NextResponse.json(stockists);
}

export async function PATCH(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (action === 'approve') {
    const result = await approveStockist(id);
    return NextResponse.json(result);
  }
  if (action === 'reject') {
    const result = await rejectStockist(id);
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
