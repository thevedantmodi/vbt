import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, items } from './_db';
import { plaidClient } from './_plaid';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const allItems = await db.select().from(items);
    for (const item of allItems) {
      await plaidClient.itemRemove({ access_token: item.accessToken }).catch(() => {});
    }
    await db.delete(items);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
