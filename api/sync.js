"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// _api/sync.ts
var sync_exports = {};
__export(sync_exports, {
  default: () => handler
});
module.exports = __toCommonJS(sync_exports);
var import_drizzle_orm = require("drizzle-orm");

// _api/_db.ts
var import_serverless = require("@neondatabase/serverless");
var import_neon_http = require("drizzle-orm/neon-http");
var import_pg_core = require("drizzle-orm/pg-core");
var items = (0, import_pg_core.pgTable)("items", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  accessToken: (0, import_pg_core.text)("access_token").notNull(),
  itemId: (0, import_pg_core.text)("item_id").notNull().unique(),
  cursor: (0, import_pg_core.text)("cursor")
});
var transactions = (0, import_pg_core.pgTable)("transactions", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  itemId: (0, import_pg_core.text)("item_id").references(() => items.itemId, { onDelete: "cascade" }),
  name: (0, import_pg_core.text)("name").notNull(),
  amount: (0, import_pg_core.numeric)("amount").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  categoryId: (0, import_pg_core.text)("category_id").notNull(),
  pending: (0, import_pg_core.boolean)("pending").default(false),
  hidden: (0, import_pg_core.boolean)("hidden").default(false)
});
var categoryOverrides = (0, import_pg_core.pgTable)("category_overrides", {
  transactionId: (0, import_pg_core.text)("transaction_id").primaryKey().references(() => transactions.id, { onDelete: "cascade" }),
  categoryId: (0, import_pg_core.text)("category_id").notNull()
});
var budgets = (0, import_pg_core.pgTable)("budgets", {
  categoryId: (0, import_pg_core.text)("category_id").primaryKey(),
  planned: (0, import_pg_core.numeric)("planned").notNull()
});
var sql = (0, import_serverless.neon)(process.env.DATABASE_URL);
var db = (0, import_neon_http.drizzle)(sql, { schema: { items, transactions, categoryOverrides, budgets } });

// _api/_plaid.ts
var import_plaid = require("plaid");
var configuration = new import_plaid.Configuration({
  basePath: import_plaid.PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14"
    }
  }
});
var plaidClient = new import_plaid.PlaidApi(configuration);
var COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(",");
var PRODUCTS = (process.env.PLAID_PRODUCTS || "transactions").split(",");

// _api/_categorize.ts
var RULES = [
  { id: "rent", pfc: ["RENT_AND_UTILITIES"], match: ["rent", "property", "landlord"] },
  { id: "savings", pfc: ["TRANSFER_OUT"], match: ["savings", "vault", "transfer to"] },
  { id: "groceries", pfc: ["FOOD_AND_DRINK_GROCERIES"], match: ["market", "grocery", "trader joe", "whole foods", "safeway", "co-op"] },
  { id: "food", pfc: ["FOOD_AND_DRINK_RESTAURANT", "FOOD_AND_DRINK_FAST_FOOD"], match: ["restaurant", "cafe", "bakery", "kitchen", "grill", "ramen", "taco"] },
  { id: "drink", pfc: ["FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR", "FOOD_AND_DRINK_COFFEE"], match: ["bar", "coffee", "pub", "tavern", "brewing", "blue bottle"] },
  { id: "transit", pfc: ["TRANSPORTATION"], match: ["uber", "lyft", "clipper", "bart", "transit", "bike", "gas", "parking"] },
  { id: "subs", pfc: ["ENTERTAINMENT", "GENERAL_SERVICES_SUBSCRIPTION"], match: ["spotify", "netflix", "icloud", "patreon", "nytimes", "chatgpt", "subscription"] },
  { id: "personal", pfc: ["PERSONAL_CARE", "GENERAL_MERCHANDISE"], match: ["pharmacy", "walgreens", "cvs", "sephora", "aesop", "uniqlo", "salon"] },
  { id: "fitness", pfc: ["GENERAL_SERVICES_GYMS_AND_FITNESS_CENTERS"], match: ["gym", "fitness", "crunch", "classpass", "yoga", "pilates"] },
  { id: "travel", pfc: ["TRAVEL"], match: ["airline", "airbnb", "hotel", "flight", "united", "delta", "expedia"] }
];
function categorize(tx) {
  const pfc = tx.personal_finance_category?.primary;
  if (pfc) {
    const r2 = RULES.find((x) => x.pfc.includes(pfc));
    if (r2) return r2.id;
  }
  const name = (tx.merchant_name || tx.name || "").toLowerCase();
  const r = RULES.find((x) => x.match.some((m) => name.includes(m)));
  return r ? r.id : "other";
}

// _api/sync.ts
var EXCLUDED_PFC = /* @__PURE__ */ new Set([
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "LOAN_PAYMENTS",
  "BANK_FEES"
]);
var EXCLUDED_NAME = /payment|thank you|autopay|auto pay|online pmt|web pmt/i;
async function handler(_req, res) {
  try {
    const allItems = await db.select().from(items);
    for (const item of allItems) {
      let cursor = item.cursor ?? void 0;
      let hasMore = true;
      while (hasMore) {
        const response = await plaidClient.transactionsSync({ access_token: item.accessToken, cursor });
        const data = response.data;
        const toInsert = data.added.filter((t) => {
          if (t.pending) return false;
          if (EXCLUDED_PFC.has(t.personal_finance_category?.primary ?? "")) return false;
          if (EXCLUDED_NAME.test(t.merchant_name || t.name)) return false;
          return true;
        }).map((t) => ({
          id: t.transaction_id,
          itemId: item.itemId,
          name: t.merchant_name || t.name,
          amount: String(t.amount),
          date: t.date,
          categoryId: categorize(t),
          pending: false
        }));
        if (toInsert.length > 0) {
          await db.insert(transactions).values(toInsert).onConflictDoUpdate({
            target: transactions.id,
            set: { name: transactions.name, amount: transactions.amount, date: transactions.date, categoryId: transactions.categoryId }
          });
        }
        for (const t of data.modified) {
          await db.update(transactions).set({
            name: t.merchant_name || t.name,
            amount: String(t.amount),
            date: t.date,
            categoryId: categorize(t)
          }).where((0, import_drizzle_orm.eq)(transactions.id, t.transaction_id));
        }
        for (const t of data.removed) {
          if (t.transaction_id) await db.delete(transactions).where((0, import_drizzle_orm.eq)(transactions.id, t.transaction_id));
        }
        cursor = data.next_cursor || void 0;
        hasMore = data.has_more;
      }
      await db.update(items).set({ cursor: cursor ?? null }).where((0, import_drizzle_orm.eq)(items.itemId, item.itemId));
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
