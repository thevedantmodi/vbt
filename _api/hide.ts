import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, transactions } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { transactionId } = req.body as { transactionId: string };
    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({ error: 'Invalid transactionId' });
    }
    await db.update(transactions).set({ hidden: true }).where(eq(transactions.id, transactionId));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
