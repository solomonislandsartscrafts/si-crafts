import { sql } from '@/lib/db';
import type { Stockist } from '@/types';

function rowToStockist(row: Record<string, unknown>): Stockist {
  return {
    id: row.id as string,
    businessName: row.business_name as string,
    abn: row.abn as string,
    contactName: row.contact_name as string,
    email: row.email as string,
    phone: row.phone as string,
    description: row.description as string,
    status: row.status as Stockist['status'],
    passwordHash: row.password_hash as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getStockistById(id: string): Promise<Stockist | null> {
  const rows = await sql`
    SELECT id, business_name, abn, contact_name, email, phone, description,
           status, password_hash, created_at, updated_at
    FROM stockists WHERE id = ${id}
  `;
  return rows[0] ? rowToStockist(rows[0]) : null;
}

export async function getStockistByEmail(email: string): Promise<Stockist | null> {
  const rows = await sql`
    SELECT id, business_name, abn, contact_name, email, phone, description,
           status, password_hash, created_at, updated_at
    FROM stockists WHERE email = ${email}
  `;
  return rows[0] ? rowToStockist(rows[0]) : null;
}

export async function getAllStockists(): Promise<Stockist[]> {
  const rows = await sql`
    SELECT id, business_name, abn, contact_name, email, phone, description,
           status, password_hash, created_at, updated_at
    FROM stockists ORDER BY created_at DESC
  `;
  return rows.map(rowToStockist);
}

export interface StockistApplicationInput {
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
}

export async function createApplication(data: StockistApplicationInput): Promise<Stockist> {
  const rows = await sql`
    INSERT INTO stockists (business_name, abn, contact_name, email, phone, description, status, password_hash)
    VALUES (${data.businessName}, ${data.abn}, ${data.contactName}, ${data.email}, ${data.phone}, ${data.description}, 'pending', '')
    RETURNING id, business_name, abn, contact_name, email, phone, description,
              status, password_hash, created_at, updated_at
  `;
  return rowToStockist(rows[0]);
}

export async function approveStockist(id: string): Promise<Stockist | null> {
  const rows = await sql`
    UPDATE stockists SET status = 'approved', updated_at = now()
    WHERE id = ${id}
    RETURNING id, business_name, abn, contact_name, email, phone, description,
              status, password_hash, created_at, updated_at
  `;
  return rows[0] ? rowToStockist(rows[0]) : null;
}

export async function rejectStockist(id: string): Promise<Stockist | null> {
  const rows = await sql`
    UPDATE stockists SET status = 'rejected', updated_at = now()
    WHERE id = ${id}
    RETURNING id, business_name, abn, contact_name, email, phone, description,
              status, password_hash, created_at, updated_at
  `;
  return rows[0] ? rowToStockist(rows[0]) : null;
}
