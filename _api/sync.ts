import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, items, transactions } from './_db';
import { plaidClient } from './_plaid';
import { categorize } from './_categorize';

const EXCLUDED_PFC = new Set([
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'LOAN_PAYMENTS',
  'BANK_FEES',
]);

const EXCLUDED_NAME = /payment|thank you|autopay|auto pay|online pmt|web pmt/i;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const allItems = await db.select().from(items);

    for (const item of allItems) {
      let cursor = item.cursor ?? undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await plaidClient.transactionsSync({ access_token: item.accessToken, cursor });
        const data = response.data;

        const toInsert = data.added.filter((t) => {
          if (t.pending) return false;
          if (EXCLUDED_PFC.has(t.personal_finance_category?.primary ?? '')) return false;
          if (EXCLUDED_NAME.test(t.merchant_name || t.name)) return false;
          return true;
        }).map((t) => ({
          id:         t.transaction_id,
          itemId:     item.itemId,
          name:       t.merchant_name || t.name,
          amount:     String(t.amount),
          date:       t.date,
          categoryId: categorize(t),
          pending:    false,
          hidden:     false,
        }));

        if (toInsert.length > 0) {
          await db.insert(transactions).values(toInsert).onConflictDoUpdate({
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
    const msg = err?.message || String(err);
    console.error('sync error:', msg);
    res.status(500).json({ error: msg });
  }
}
