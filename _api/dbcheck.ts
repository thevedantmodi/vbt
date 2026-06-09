import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const sql = neon(process.env.DATABASE_URL!);
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position`;
  res.json({ db: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0], columns: cols.map((r: any) => r.column_name) });
}
