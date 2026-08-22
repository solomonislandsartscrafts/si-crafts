import { NextRequest, NextResponse } from 'next/server';
import { createApplication } from '@/services/stockists';
import { ApiError } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const stockist = await createApplication(data);
    return NextResponse.json(stockist);
  } catch (err) {
    /**
     * Forward the backend's own wording for a rejected application.
     *
     * Without this the throw escaped as an unhandled 500 and the form showed
     * "Something went wrong. Please try again." — which is actively misleading
     * for the most common rejection, an address that has already applied.
     * Retrying can never succeed, so the applicant needs to be told that.
     */
    if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
