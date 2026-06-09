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

// _api/dbcheck.ts
var dbcheck_exports = {};
__export(dbcheck_exports, {
  default: () => handler
});
module.exports = __toCommonJS(dbcheck_exports);
var import_serverless = require("@neondatabase/serverless");
async function handler(_req, res) {
  const sql = (0, import_serverless.neon)(process.env.DATABASE_URL);
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position`;
  res.json({ db: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0], columns: cols.map((r) => r.column_name) });
}
