import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, transactions, categoryOverrides } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const rows = await db
      .select({
        id:         transactions.id,
        name:       transactions.name,
        amount:     transactions.amount,
        date:       transactions.date,
        categoryId: transactions.categoryId,
        override:   categoryOverrides.categoryId,
      })
      .from(transactions)
      .leftJoin(categoryOverrides, eq(transactions.id, categoryOverrides.transactionId));

    res.json({
      transactions: rows.map((r) => ({
        id:         r.id,
        name:       r.name,
        amount:     Number(r.amount),
        date:       r.date,
        categoryId: r.override ?? r.categoryId,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
