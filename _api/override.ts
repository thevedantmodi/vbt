import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, categoryOverrides } from './_db';

const VALID_CATEGORIES = new Set([
  'rent','savings','groceries','food','drink','transit',
  'subs','personal','fitness','travel','other',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { transactionId, categoryId } = req.body as { transactionId: string; categoryId: string };

    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({ error: 'Invalid transactionId' });
    }
    if (!categoryId || !VALID_CATEGORIES.has(categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' });
    }

    await db.insert(categoryOverrides)
      .values({ transactionId, categoryId })
      .onConflictDoUpdate({ target: categoryOverrides.transactionId, set: { categoryId } });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
