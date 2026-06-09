import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, categoryOverrides } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { transactionId, categoryId } = req.body as { transactionId: string; categoryId: string };
    await db.insert(categoryOverrides)
      .values({ transactionId, categoryId })
      .onConflictDoUpdate({ target: categoryOverrides.transactionId, set: { categoryId } });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
