import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, items, transactions } from './_db';
import { plaidClient } from './_plaid';
import { categorize } from './_categorize';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const allItems = await db.select().from(items);

    for (const item of allItems) {
      let cursor = item.cursor ?? undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await plaidClient.transactionsSync({ access_token: item.accessToken, cursor });
        const data = response.data;

        if (data.added.length > 0) {
          await db.insert(transactions).values(
            data.added.filter((t) => !t.pending).map((t) => ({
              id:         t.transaction_id,
              itemId:     item.itemId,
              name:       t.merchant_name || t.name,
              amount:     String(t.amount),
              date:       t.date,
              categoryId: categorize(t),
              pending:    false,
            }))
          ).onConflictDoUpdate({
            target: transactions.id,
            set: { name: transactions.name, amount: transactions.amount, date: transactions.date, categoryId: transactions.categoryId },
          });
        }

        for (const t of data.modified) {
          await db.update(transactions).set({
            name: t.merchant_name || t.name, amount: String(t.amount), date: t.date, categoryId: categorize(t),
          }).where(eq(transactions.id, t.transaction_id));
        }

        for (const t of data.removed) {
          if (t.transaction_id) await db.delete(transactions).where(eq(transactions.id, t.transaction_id));
        }

        cursor = data.next_cursor || undefined;
        hasMore = data.has_more;
      }

      await db.update(items).set({ cursor: cursor ?? null }).where(eq(items.itemId, item.itemId));
    }

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.error_message || err.message });
  }
}
