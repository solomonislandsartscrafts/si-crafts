import { NextRequest, NextResponse } from 'next/server';
import { createApplication } from '@/services/stockists';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const stockist = await createApplication(data);
  return NextResponse.json(stockist);
}
