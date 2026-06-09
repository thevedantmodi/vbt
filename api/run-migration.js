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

// _api/run-migration.ts
var run_migration_exports = {};
__export(run_migration_exports, {
  default: () => handler
});
module.exports = __toCommonJS(run_migration_exports);
var import_serverless = require("@neondatabase/serverless");
async function handler(_req, res) {
  try {
    const sql = (0, import_serverless.neon)(process.env.DATABASE_URL);
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false`;
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position`;
    res.json({ ok: true, columns: cols.map((r) => r.column_name) });
  } catch (err) {
    res.status(500).json({ error: err?.message, detail: err?.detail });
  }
}
