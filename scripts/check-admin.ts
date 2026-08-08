import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function check() {
  const rows = await sql`SELECT id, email, is_active, role FROM admins`;
  console.log('Admins in database:');
  for (const row of rows) {
    console.log(`  ${row.email} | active: ${row.is_active} | role: ${row.role}`);
  }

  console.log('\nStockists in database:');
  const stockists = await sql`SELECT id, email, status FROM stockists`;
  for (const row of stockists) {
    console.log(`  ${row.email} | status: ${row.status}`);
  }
}

check().catch(console.error);
