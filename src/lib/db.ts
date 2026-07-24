import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Neon serverless SQL client (lazy-initialized).
 * Works on Cloudflare Workers/Pages edge runtime (uses HTTP, not TCP).
 *
 * The client is created on first use — if DATABASE_URL is not set,
 * a descriptive error is thrown at query time rather than at import time.
 *
 * Usage:
 *   import { sql } from '@/lib/db';
 *   const rows = await sql`SELECT * FROM admins WHERE email = ${email}`;
 */
let _sql: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Configure it in .env.local before using the database.'
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

/**
 * Tagged template SQL function. Lazily initializes the Neon client.
 */
function lazySql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getClient()(strings, ...values);
}

export const sql = lazySql as unknown as NeonQueryFunction<false, false>;
