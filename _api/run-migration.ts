import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false`;
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position`;
    res.json({ ok: true, columns: cols.map((r: any) => r.column_name) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message, detail: err?.detail });
  }
}
