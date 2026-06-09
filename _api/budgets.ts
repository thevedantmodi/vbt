import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, budgets } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await db.select().from(budgets);
      const map: Record<string, number> = {};
      for (const r of rows) map[r.categoryId] = Number(r.planned);
      return res.json({ budgets: map });
    }

    if (req.method === 'POST') {
      const { categoryId, planned } = req.body as { categoryId: string; planned: number };
      if (!categoryId || typeof planned !== 'number' || planned < 0) {
        return res.status(400).json({ error: 'Invalid payload' });
      }
      await db
        .insert(budgets)
        .values({ categoryId, planned: String(planned) })
        .onConflictDoUpdate({ target: budgets.categoryId, set: { planned: String(planned) } });
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
