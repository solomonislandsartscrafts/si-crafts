import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to check which R2 env vars are available at runtime.
 * Returns which vars are set (without exposing values).
 */
export async function GET() {
  const vars = {
    R2_ACCOUNT_ID: Boolean(process.env.R2_ACCOUNT_ID),
    R2_ACCESS_KEY_ID: Boolean(process.env.R2_ACCESS_KEY_ID),
    R2_SECRET_ACCESS_KEY: Boolean(process.env.R2_SECRET_ACCESS_KEY),
    R2_BUCKET_NAME: Boolean(process.env.R2_BUCKET_NAME),
    R2_PUBLIC_URL: Boolean(process.env.R2_PUBLIC_URL),
  };

  const allSet = Object.values(vars).every(Boolean);

  return NextResponse.json({
    configured: allSet,
    vars,
    runtime: typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis ? 'edge' : 'nodejs',
  });
}
