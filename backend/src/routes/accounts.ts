import { Router, Request, Response, NextFunction } from 'express';
import { plaidClient } from '../services/plaidClient';
import { tokenStore } from './plaid';

export const accountsRouter = Router();

accountsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.query.userId as string) || 'default-user';
    const item = tokenStore.get(userId);
    if (!item) return res.status(404).json({ error: { error_message: 'No linked account for user' } });

    const response = await plaidClient.accountsBalanceGet({ access_token: item.accessToken });
    res.json({ accounts: response.data.accounts });
  } catch (err) {
    next(err);
  }
});
