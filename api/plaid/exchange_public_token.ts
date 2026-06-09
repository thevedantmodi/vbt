import type { VercelRequest, VercelResponse } from '@vercel/node';
import { plaidClient } from '../_lib/plaidClient';
import { db } from '../_lib/db/index';
import { items } from '../_lib/db/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({ public_token });

    await db.insert(items).values({
      accessToken: response.data.access_token,
      itemId:      response.data.item_id,
      cursor:      null,
    }).onConflictDoUpdate({
      target: items.itemId,
      set:    { accessToken: response.data.access_token },
    });

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.error_message || err.message });
  }
}
