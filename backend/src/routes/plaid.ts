import { Router, Request, Response, NextFunction } from "express";
import { plaidClient, COUNTRY_CODES, PRODUCTS } from "../services/plaidClient";

export const plaidRouter = Router();

// In production, store access tokens in a database keyed by user ID
const tokenStore = new Map<string, { accessToken: string; itemId: string }>();

plaidRouter.post(
  "/create_link_token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || "default-user";
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: "Vedant's Budget Tool",
        products: PRODUCTS,
        country_codes: COUNTRY_CODES,
        language: "en",
      });
      res.json({ link_token: response.data.link_token });
    } catch (err) {
      next(err);
    }
  },
);

plaidRouter.post(
  "/exchange_token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { public_token, userId = "default-user" } = req.body;
      const response = await plaidClient.itemPublicTokenExchange({
        public_token,
      });
      tokenStore.set(userId, {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
      });
      res.json({ success: true, item_id: response.data.item_id });
    } catch (err) {
      next(err);
    }
  },
);

export { tokenStore };
