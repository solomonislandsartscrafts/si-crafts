import { NextRequest, NextResponse } from 'next/server';
import { getAllStockists, createStockist, approveStockist, rejectStockist, suspendStockist, enableStockist, deleteStockist } from '@/services/stockists';
import { validateAdminSession } from '@/services/auth';

async function authenticateAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  if (!token) return null;
  const admin = await validateAdminSession(token);
  return admin ? { admin, token } : null;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stockists = await getAllStockists(auth.token);
  return NextResponse.json(stockists);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const businessName = (body.businessName || '').trim();
  const contactName = (body.contactName || '').trim();
  const email = (body.email || '').trim();

  if (!businessName || !contactName || !email) {
    return NextResponse.json(
      { error: 'Business name, contact name and email are required.' },
      { status: 400 }
    );
  }

  try {
    const result = await createStockist(
      {
        businessName,
        contactName,
        email,
        abn: (body.abn || '').trim(),
        phone: (body.phone || '').trim(),
        description: (body.description || '').trim(),
        password: (body.password || '').trim() || undefined,
      },
      auth.token
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add stockist.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, action } = await request.json();
  if (action === 'approve') {
    const result = await approveStockist(id, auth.token);
    return NextResponse.json(result);
  }
  if (action === 'reject') {
    const result = await rejectStockist(id, auth.token);
    return NextResponse.json(result);
  }
  if (action === 'suspend') {
    const result = await suspendStockist(id, auth.token);
    return NextResponse.json(result);
  }
  if (action === 'enable') {
    const result = await enableStockist(id, auth.token);
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  await deleteStockist(id, auth.token);
  return NextResponse.json({ success: true });
}
