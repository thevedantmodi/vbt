import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db';
import { items } from '../lib/db/schema';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const rows = await db.select().from(items).limit(1);
  res.json({ linked: rows.length > 0, env: process.env.PLAID_ENV || 'sandbox' });
}
