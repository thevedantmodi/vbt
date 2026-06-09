import type { VercelRequest, VercelResponse } from '@vercel/node';
import { plaidClient, COUNTRY_CODES, PRODUCTS } from '../_lib/plaidClient';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'local-user' },
      client_name: "Vedant's Budget Tool",
      products: PRODUCTS,
      country_codes: COUNTRY_CODES,
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.error_message || err.message });
  }
}
