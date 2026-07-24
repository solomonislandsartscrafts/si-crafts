import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSessions } from '@/services/auth';

/**
 * POST /api/sessions/cleanup
 * Deletes all expired sessions. Intended to be called by a scheduled
 * Cloudflare Worker cron trigger or external scheduler — not per-request.
 *
 * Protected by a shared secret in the Authorization header.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CLEANUP_SECRET;
  const auth = request.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await cleanupExpiredSessions();
  return NextResponse.json({ deleted });
}
