import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function reset() {
  // Reset all locked accounts and failed attempts
  await sql`
    UPDATE admins
    SET failed_login_attempts = 0, locked_until = NULL, updated_at = now()
  `;
  console.log('✓ All admin accounts unlocked and failed attempts reset');

  // Show current state
  const rows = await sql`SELECT email, is_active, failed_login_attempts, locked_until FROM admins`;
  for (const row of rows) {
    console.log(`  ${row.email} | active: ${row.is_active} | attempts: ${row.failed_login_attempts} | locked: ${row.locked_until || 'no'}`);
  }
}

reset().catch(console.error);
