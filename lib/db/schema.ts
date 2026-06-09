import { pgTable, serial, text, numeric, boolean } from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull().unique(),
  cursor: text("cursor"),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  itemId: text("item_id").references(() => items.itemId, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  amount: numeric("amount").notNull(),
  date: text("date").notNull(),
  categoryId: text("category_id").notNull(),
  pending: boolean("pending").default(false),
});

export const categoryOverrides = pgTable("category_overrides", {
  transactionId: text("transaction_id")
    .primaryKey()
    .references(() => transactions.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull(),
});

export const budgets = pgTable("budgets", {
  categoryId: text("category_id").primaryKey(),
  planned: numeric("planned").notNull(),
});
