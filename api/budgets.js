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

// _api/budgets.ts
var budgets_exports = {};
__export(budgets_exports, {
  default: () => handler
});
module.exports = __toCommonJS(budgets_exports);

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

// _api/budgets.ts
async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(budgets);
      const map = {};
      for (const r of rows) map[r.categoryId] = Number(r.planned);
      return res.json({ budgets: map });
    }
    if (req.method === "POST") {
      const { categoryId, planned } = req.body;
      if (!categoryId || typeof planned !== "number" || planned < 0) {
        return res.status(400).json({ error: "Invalid payload" });
      }
      await db.insert(budgets).values({ categoryId, planned: String(planned) }).onConflictDoUpdate({ target: budgets.categoryId, set: { planned: String(planned) } });
      return res.json({ ok: true });
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
