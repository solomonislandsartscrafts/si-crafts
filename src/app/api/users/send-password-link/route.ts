import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordLink } from '@/services/users';
import { authenticateSuperAdmin } from '@/lib/api-auth';
import { ApiError } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  const auth = await authenticateSuperAdmin(request);
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  if (!id) {
    return NextResponse.json({ error: 'User id is required.' }, { status: 400 });
  }

  try {
    const message = await sendPasswordLink(id, auth.token);
    return NextResponse.json({ success: true, message });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send the email.';

    // The backend answers 502 when the mail transport fails, which is not the
    // admin's fault and is worth retrying. Reporting it as 400 made a broken
    // SMTP config look like bad input. Other statuses pass through; anything
    // without one stays 400.
    const status =
      err instanceof ApiError && err.status >= 400 && err.status <= 599
        ? err.status
        : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
