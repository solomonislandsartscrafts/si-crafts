/**
 * Database migration script — creates auth tables in Neon.
 *
 * Run with: npx tsx scripts/migrate.ts
 *
 * Tables created:
 * - admins (admin accounts with roles and lockout)
 * - stockists (wholesale buyer accounts)
 * - sessions (auth tokens for both admins and stockists)
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Run with: npx tsx --env-file=.env.local scripts/migrate.ts');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('🔌 Connecting to Neon...');

  // Admins table
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY DEFAULT 'admin-' || gen_random_uuid()::text,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor')),
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('✓ admins table created');

  // Stockists table
  await sql`
    CREATE TABLE IF NOT EXISTS stockists (
      id TEXT PRIMARY KEY DEFAULT 'stockist-' || gen_random_uuid()::text,
      business_name TEXT NOT NULL,
      abn TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      password_hash TEXT NOT NULL DEFAULT '',
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('✓ stockists table created');

  // Sessions table
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'stockist')),
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('✓ sessions table created');

  // Index for session lookup by user
  await sql`
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id, user_type)
  `;

  // Index for expired session cleanup
  await sql`
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at)
  `;
  console.log('✓ indexes created');

  // Seed a default super admin (password: "admin123" — change in production!)
  const existingAdmin = await sql`SELECT id FROM admins WHERE email = 'admin@sicrafts.com.au'`;
  if (existingAdmin.length === 0) {
    const adminHash = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO admins (id, name, email, role, password_hash)
      VALUES ('admin-1', 'Isaac Tekulu', 'admin@sicrafts.com.au', 'super_admin', ${adminHash})
    `;
    console.log('✓ default super admin seeded (admin@sicrafts.com.au / admin123)');
  } else {
    console.log('→ super admin already exists, skipping seed');
  }

  // Seed a default editor
  const existingEditor = await sql`SELECT id FROM admins WHERE email = 'editor@sicrafts.com.au'`;
  if (existingEditor.length === 0) {
    const editorHash = await bcrypt.hash('editor123', 10);
    await sql`
      INSERT INTO admins (id, name, email, role, password_hash)
      VALUES ('admin-2', 'Editor User', 'editor@sicrafts.com.au', 'editor', ${editorHash})
    `;
    console.log('✓ default editor seeded (editor@sicrafts.com.au / editor123)');
  } else {
    console.log('→ editor already exists, skipping seed');
  }

  // Seed a test stockist (approved)
  const existingStockist = await sql`SELECT id FROM stockists WHERE email = 'gallery@example.com'`;
  if (existingStockist.length === 0) {
    const stockistHash = await bcrypt.hash('stockist123', 10);
    await sql`
      INSERT INTO stockists (id, business_name, abn, contact_name, email, phone, description, status, password_hash)
      VALUES (
        'stockist-1',
        'Melbourne Gallery Shop',
        '12345678901',
        'Sarah Chen',
        'gallery@example.com',
        '0412345678',
        'Museum retail shop specialising in Pacific arts.',
        'approved',
        ${stockistHash}
      )
    `;
    console.log('✓ test stockist seeded (gallery@example.com / stockist123)');
  } else {
    console.log('→ test stockist already exists, skipping seed');
  }

  console.log('\n✅ Migration complete!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
