import type { VercelRequest, VercelResponse } from '@vercel/node';
import { plaidClient } from './_lib/plaidClient';
import { db } from './_lib/db/index';
import { items } from './_lib/db/schema';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const allItems = await db.select().from(items);
    if (allItems.length === 0) {
      return res.status(404).json({ error: 'No linked accounts' });
    }

    const results = await Promise.all(
      allItems.map((item) =>
        plaidClient.accountsBalanceGet({ access_token: item.accessToken })
          .then((r) => r.data.accounts)
      )
    );

    res.json({ accounts: results.flat() });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.error_message || err.message });
  }
}
