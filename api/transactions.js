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

// _api/transactions.ts
var transactions_exports = {};
__export(transactions_exports, {
  default: () => handler
});
module.exports = __toCommonJS(transactions_exports);
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
  pending: (0, import_pg_core.boolean)("pending").default(false)
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

// _api/transactions.ts
async function handler(_req, res) {
  try {
    const rows = await db.select({
      id: transactions.id,
      name: transactions.name,
      amount: transactions.amount,
      date: transactions.date,
      categoryId: transactions.categoryId,
      override: categoryOverrides.categoryId
    }).from(transactions).leftJoin(categoryOverrides, (0, import_drizzle_orm.eq)(transactions.id, categoryOverrides.transactionId));
    res.json({
      transactions: rows.map((r) => ({
        id: r.id,
        name: r.name,
        amount: Number(r.amount),
        date: r.date,
        categoryId: r.override ?? r.categoryId
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
