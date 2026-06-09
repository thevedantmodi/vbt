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

// _api/plaid/create_link_token.ts
var create_link_token_exports = {};
__export(create_link_token_exports, {
  default: () => handler
});
module.exports = __toCommonJS(create_link_token_exports);

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

// _api/plaid/create_link_token.ts
async function handler(_req, res) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "local-user" },
      client_name: "Vedant's Budget Tool",
      products: PRODUCTS,
      country_codes: COUNTRY_CODES,
      language: "en"
    });
    res.json({ link_token: response.data.link_token });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error_message || err.message });
  }
}
