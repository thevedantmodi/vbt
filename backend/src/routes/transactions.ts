import { Router, Request, Response, NextFunction } from 'express';
import { plaidClient } from '../services/plaidClient';
import { tokenStore } from './plaid';

export const transactionsRouter = Router();

transactionsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.query.userId as string) || 'default-user';
    const item = tokenStore.get(userId);
    if (!item) return res.status(404).json({ error: { error_message: 'No linked account for user' } });

    let cursor: string | undefined;
    let added: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: item.accessToken,
        cursor,
      });
      const data = response.data;
      added = added.concat(data.added);
      cursor = data.next_cursor || undefined;
      hasMore = data.has_more;
    }

    const sorted = added.sort((a, b) => (b.date > a.date ? 1 : -1));
    res.json({ transactions: sorted });
  } catch (err) {
    next(err);
  }
});
