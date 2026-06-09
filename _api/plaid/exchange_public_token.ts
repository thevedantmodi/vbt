import type { VercelRequest, VercelResponse } from '@vercel/node';
import { plaidClient } from '../_plaid';
import { db, items } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { public_token } = req.body;
    if (!public_token || typeof public_token !== 'string') {
      return res.status(400).json({ error: 'Invalid public_token' });
    }
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
    res.status(500).json({ error: 'Internal server error' });
  }
}
